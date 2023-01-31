from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, renderers
from rest_framework import response
from rest_framework.views import APIView
from django.db.models import Q, Value, functions

from accounts.models import User


from .serializers import ChoiceSerializer, PrivateQnaireIdResponseSerializer, PrivateQnaireIdSerializer, QuestionPolymorphicSerializer, QuestionnaireSerializer, ResponseSerializer, SectionSerializer, UserSerializer

from .models import Answer, Choice, PrivateQnaireId, Question, Questionnaire, Response, Section

# Create your views here.


class ResponseView(APIView):

    def post(self, request, **kwargs):
        qnaire = get_object_or_404(Questionnaire, pk=kwargs['id'])
        private_qnaire_id = None
        if qnaire.private:
            private_qnaire_id_serializer = PrivateQnaireIdResponseSerializer(
                data=request.data)
            private_qnaire_id_serializer.is_valid(raise_exception=True)
            queryset = PrivateQnaireId.objects.filter(
                pk=private_qnaire_id_serializer.validated_data['id'], qnaire=qnaire)
            if queryset:
                private_qnaire_id = queryset[0]
            else:
                return response.Response(
                    data={'detail': 'Invalid private_qnaire_id'}, status=status.HTTP_400_BAD_REQUEST)

        response_serializer = ResponseSerializer(
            data=request.data, context={'qnaire': qnaire})
        response_serializer.is_valid(raise_exception=True)
        response_serializer.save()
        if private_qnaire_id is not None:
            private_qnaire_id.delete()
        return response.Response(data=response_serializer.data, status=status.HTTP_200_OK)


def forbidden_if_not_owning_qnaire(qnaire, request):
    if request.user != qnaire.creator:
        return response.Response(
            {'detail': f"User {request.user} doesn't own the questionnaire"}, status=status.HTTP_403_FORBIDDEN)


class CSVRenderer(renderers.BaseRenderer):
    media_type = 'text/csv'
    format = 'csv'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        # replace separator in cells, then join cells of each row with separator, then join rows with newline
        return '\n'.join([';'.join((cell.replace(';', ',') for cell in row)) for row in data])


class ResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [renderers.JSONRenderer, CSVRenderer]

    def get(self, request, **kwargs):
        qnaire = get_object_or_404(Questionnaire, pk=kwargs['id'])
        forbidden = forbidden_if_not_owning_qnaire(qnaire, request)
        if forbidden:
            return forbidden

        format = kwargs.get('format', 'json')
        if format == 'csv':
            return self.get_csv_result(qnaire)
        else:
            return self.get_json_result(qnaire)

    def get_json_result(self, qnaire):
        qnaire_serializer = QuestionnaireSerializer(qnaire)

        sections = qnaire.section_set.all()
        section_serializer = SectionSerializer(sections, many=True)

        questions = Question.objects.filter(section__in=sections)
        question_serializer = QuestionPolymorphicSerializer(
            questions, many=True)

        choices = Choice.objects.filter(question__in=questions)
        choice_serializer = ChoiceSerializer(choices, many=True)

        # answers = Answer.objects.filter(
        #     Q(OpenAnswer___question__in=questions) |
        #     Q(RangeAnswer___question__in=questions) |
        #     Q(MultipleChoiceAnswer___question__in=questions))
        # answer_serializer = AnswerPolymorhicSerializer(answers, many=True)

        # TODO: OPTIMIZE THIS TO RETRIEVE RESPONSES IN ONE GO IF POSSIBLE (there are issues with select_related with polymorhic models)
        # Alternative solution is to include field 'qnaire' in Response. Then I could just do Response.objects.filter(qnaire=qnaire)
        responses_pks = Answer.objects.filter(
            (Q(OpenAnswer___question__in=questions) |
             Q(RangeAnswer___question__in=questions) |
             Q(MultipleChoiceAnswer___question__in=questions))).values_list('response', flat=True).distinct()
        responses = Response.objects.filter(pk__in=responses_pks)
        response_serializer = ResponseSerializer(responses, many=True)

        return response.Response(data={**qnaire_serializer.data,
                                       'sections': section_serializer.data,
                                       'questions': question_serializer.data,
                                       'choices': choice_serializer.data,
                                       # 'answers': answer_serializer.data,
                                       'responses': response_serializer.data
                                       })

    def get_csv_result(self, qnaire):
        sections = qnaire.section_set.all().order_by('order_num')
        questions = Question.objects.filter(section__in=sections).order_by(
            'section__order_num', 'order_num')
        cols = []
        # the number of responses is going to grow while question will always stay at a relatively small number
        # so it's better to make a query for each question rather than for each response
        for q in questions:
            answers = q.get_answer_set().all().order_by('response')
            col = [a.get_value_str() for a in answers]  # answer values
            col.insert(0, q.text)  # header
            cols.append(col)

        # now the respondent for each response has to be retrieved
        responses_pks = Answer.objects.filter(
            (Q(OpenAnswer___question__section__qnaire=qnaire) |
             Q(RangeAnswer___question__section__qnaire=qnaire) |
             Q(MultipleChoiceAnswer___question__section__qnaire=qnaire))).values_list('response', flat=True).distinct()
        responses = Response.objects.filter(pk__in=responses_pks)
        respondents = ['Respondent']
        for r in responses:
            respondents.append(r.respondent.id if r.respondent else '')
        cols.insert(0, respondents)

        # transformation to rows takes some time but I can then use string.join instead of manually concatenating the strings
        rows = [list(row) for row in zip(*cols)]

        return response.Response(data=rows)


class ResultStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, **kwargs):
        qnaire = get_object_or_404(Questionnaire, pk=kwargs['id'])
        forbidden = forbidden_if_not_owning_qnaire(qnaire, request)
        if forbidden:
            return forbidden

        qnaire_serializer = QuestionnaireSerializer(qnaire)

        responses_pks = Answer.objects.filter(
            (Q(OpenAnswer___question__section__qnaire=qnaire) |
             Q(RangeAnswer___question__section__qnaire=qnaire) |
             Q(MultipleChoiceAnswer___question__section__qnaire=qnaire))).values_list('response', flat=True).distinct()
        total_responses = len(responses_pks)
        last_response_timestamp = None
        if total_responses > 0:
            last_response = Response.objects.filter(
                pk__in=responses_pks).latest('submit_timestamp')
            last_response_timestamp = last_response.submit_timestamp

        return response.Response({**qnaire_serializer.data,
                                  'total_responses': total_responses,
                                  'last_response_timestamp': last_response_timestamp
                                  })

# class PrivateQnaireIdView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, **kwargs):
#         qnaire = get_object_or_404(Questionnaire, pk=kwargs['id'])
#         forbidden = forbidden_if_not_owning_qnaire(qnaire, request)
#         if forbidden:
#             return forbidden

#         private_qnaire_id = PrivateQnaireId.objects.create(qnaire=qnaire)
#         serializer = PrivateQnaireIdSerializer(private_qnaire_id)

#         return response.Response(data=serializer.data, status=status.HTTP_200_OK)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
