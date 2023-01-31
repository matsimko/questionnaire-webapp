from django.db.models import F, Q
from rest_framework import permissions, viewsets, response, status, mixins
from rest_framework.decorators import action

from .mixins import OrderedViewSetMixin, UserQuerySetMixin, MultiSerializerViewSetMixin
from .models import Answer, Choice, PrivateQnaireId, Question, Questionnaire, Respondent, Response, Section
from .serializers import (
    AnswerPolymorhicSerializer,
    ChoiceSerializer,
    CreateChoiceSerializer,
    CreateSectionSerializer,
    PrivateQnaireIdSerializer,
    QuestionMoveSerializer,
    QuestionSerializer,
    QuestionTypePolymorphicSerializer,
    QuestionnaireRetrieveSerializer,
    QuestionnaireSerializer,
    QuestionPolymorphicSerializer,
    RespondentSerializer,
    SectionMoveSerializer,
    SectionSerializer,
    UserSerializer,
    raise_validation_error_if_qnaire_published,
)


class ModelViewSetWithValidation(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.validate_create(serializer)
        return self.do_create(serializer)

    def validate_create(self, serializer):
        pass

    def do_create(self, serializer):
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.validate_update(instance, serializer)
        return self.do_update(instance, serializer)

    def validate_update(self, instance, serializer):
        pass

    def do_update(self, instance, serializer):
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return response.Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.validate_destroy(instance)
        return self.do_destroy(instance)

    def validate_destroy(self, instance):
        pass

    def do_destroy(self, instance):
        self.perform_destroy(instance)
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class QuestionnaireViewSet(UserQuerySetMixin, MultiSerializerViewSetMixin, ModelViewSetWithValidation):
    queryset = Questionnaire.objects.all()
    serializer_class = QuestionnaireSerializer
    serializer_action_classes = {'retrieve': QuestionnaireRetrieveSerializer}
    no_auth_actions = ['retrieve']

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def delete_responses(self, instance):
        # Alternative solution is to include field 'qnaire' in Response. Then I could just do Response.objects.filter(qnaire=qnaire).delete() and cascade would happen
        responses_pks = Answer.objects.filter(
            (Q(OpenAnswer___question__section__qnaire=instance) |
             Q(RangeAnswer___question__section__qnaire=instance) |
                Q(MultipleChoiceAnswer___question__section__qnaire=instance))).values_list('response', flat=True).distinct()
        Response.objects.filter(pk__in=responses_pks).delete()

    def do_update(self, instance, serializer):
        published = serializer.validated_data.get('published', instance.published)
        if not published and instance.published:
            self.delete_responses(instance)
            instance.privateqnaireid_set.all().delete()
        # private = serializer.validated_data.get('private', None)
        self.perform_update(serializer)
        return response.Response(serializer.data)

    def perform_destroy(self, instance):
        # there can never be responses unless the qnaire is published, which means the query doesn't need to be done otherwise
        if instance.published:
            self.delete_responses(instance)
        return super().perform_destroy(instance)


# for section movement and question movement within section


def handle_simple_move(model, src, order_num, serializer, **filters):
    moved_up = src.order_num > order_num
    if moved_up:
        qs_between = model.objects.filter(
            order_num__lt=src.order_num, order_num__gte=order_num, **filters)
        qs_between.update(order_num=F('order_num') + 1)
    else:
        qs_between = model.objects.filter(
            order_num__lte=order_num, order_num__gt=src.order_num, **filters)
        qs_between.update(order_num=F('order_num') - 1)
    old_order_num = src.order_num
    src.order_num = order_num
    src.save()

    min, max = sorted([old_order_num, order_num])
    changed_objects = model.objects.filter(
        order_num__lte=max, order_num__gte=min, **filters)
    return response.Response(serializer(changed_objects, many=True).data, status=status.HTTP_200_OK)


class SectionViewSet(UserQuerySetMixin, MultiSerializerViewSetMixin, OrderedViewSetMixin, ModelViewSetWithValidation):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    serializer_action_classes = {'create': CreateSectionSerializer}
    user_field = 'qnaire__creator'
    order_scope_field = 'qnaire'
    list_serializer_class = serializer_class  # for OrderedViewSetMixin

    def validate_destroy(self, instance):
        raise_validation_error_if_qnaire_published(instance.qnaire)

    def validate_create(self, serializer):
        raise_validation_error_if_qnaire_published(
            serializer.validated_data['qnaire'])

    @action(detail=True, methods=['PATCH'])
    def move(self, request, pk=None):
        src_section = self.get_object()
        move_serializer = SectionMoveSerializer(
            data=request.data, context={'src': src_section})
        if move_serializer.is_valid():
            order_num = move_serializer.validated_data['order_num']
            if order_num == src_section.order_num:
                return response.Response(status=status.HTTP_204_NO_CONTENT)
            return handle_simple_move(Section, src_section, order_num, SectionSerializer, qnaire=src_section.qnaire)

        else:
            return response.Response(move_serializer.errors,
                                     status=status.HTTP_400_BAD_REQUEST)


class QuestionViewSet(UserQuerySetMixin, OrderedViewSetMixin, ModelViewSetWithValidation):
    queryset = Question.objects.all()
    serializer_class = QuestionPolymorphicSerializer
    user_field = 'section__qnaire__creator'
    order_scope_field = 'section'
    list_serializer_class = serializer_class  # for OrderedViewSetMixin

    def validate_destroy(self, instance):
        raise_validation_error_if_qnaire_published(instance.section.qnaire)

    def validate_create(self, serializer):
        raise_validation_error_if_qnaire_published(
            serializer.validated_data['section'].qnaire)

    def validate_update(self, instance, serializer):
        raise_validation_error_if_qnaire_published(instance.section.qnaire)

    @action(detail=True, methods=['PATCH'])
    def move(self, request, pk=None):
        src_question = self.get_object()
        move_serializer = QuestionMoveSerializer(
            data=request.data, context={'src': src_question})
        move_serializer.is_valid(raise_exception=True)

        order_num = move_serializer.validated_data['order_num']
        section = move_serializer.validated_data['section']
        section_changed = section != src_question.section
        if order_num == src_question.order_num and not section_changed:
            return response.Response(status=status.HTTP_204_NO_CONTENT)

        if not section_changed:
            return handle_simple_move(Question, src_question, order_num, QuestionPolymorphicSerializer, section=section)

        old_section = src_question.section
        old_order_num = src_question.order_num
        Question.objects.filter(section=old_section, order_num__gt=old_order_num).update(
            order_num=F('order_num') - 1)
        Question.objects.filter(section=section, order_num__gte=order_num).update(
            order_num=F('order_num') + 1)
        src_question.section = section
        src_question.order_num = order_num
        src_question.save()

        changed_questions = list(Question.objects.filter(
            section=old_section, order_num__gte=old_order_num))
        changed_questions += list(Question.objects.filter(
            section=section, order_num__gte=order_num))
        return response.Response(QuestionPolymorphicSerializer(changed_questions, many=True).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['PATCH'])
    def type(self, request, pk=None):
        question = self.get_object()
        serializer = QuestionTypePolymorphicSerializer(
            data=request.data)
        serializer.is_valid(raise_exception=True)
        field_values = {'id': question.id, 'section': question.section,
                        'order_num': question.order_num, 'text': question.text, 'mandatory': question.mandatory}
        question.delete()
        new_question = serializer.save(**field_values)
        return response.Response(QuestionPolymorphicSerializer(new_question).data, status=status.HTTP_200_OK)


class ChoiceViewSet(UserQuerySetMixin, MultiSerializerViewSetMixin, OrderedViewSetMixin, ModelViewSetWithValidation):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer
    serializer_action_classes = {'create': CreateChoiceSerializer}
    user_field = 'question__section__qnaire__creator'
    order_scope_field = 'question'
    list_serializer_class = ChoiceSerializer

    def validate_destroy(self, instance):
        raise_validation_error_if_qnaire_published(
            instance.question.section.qnaire)

    def validate_create(self, serializer):
        raise_validation_error_if_qnaire_published(
            serializer.validated_data['question'].section.qnaire)

    def validate_update(self, instance, serializer):
        raise_validation_error_if_qnaire_published(
            instance.question.section.qnaire)

    def perform_destroy(self, instance):
        question = instance.question
        new_total_choices = question.choice_set.count()
        if question.other_choice:
            new_total_choices += 1
        if question.max_answers > new_total_choices:
            question.max_answers = max(new_total_choices, 1)
            question.min_answers = min(question.min_answers, question.max_answers)
            question.save()
        instance.delete()


class RespondentViewSet(viewsets.ModelViewSet):
    queryset = Respondent.objects.all()
    serializer_class = RespondentSerializer

    def get_permissions(self):
        if self.action == 'retrieve':
            permission_classes = []
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]


class PrivateQnaireIdViewSet(UserQuerySetMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = PrivateQnaireId.objects.all()
    serializer_class = PrivateQnaireIdSerializer
    user_field = 'qnaire__creator'
    no_auth_actions = ['retrieve']


class AnswerViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Answer.objects.all()
    serializer_class = AnswerPolymorhicSerializer