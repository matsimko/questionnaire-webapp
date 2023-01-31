import abc
from django.contrib.auth.password_validation import validate_password
from django import forms
from rest_framework import serializers
from rest_polymorphic.serializers import PolymorphicSerializer
from .models import (
    MultipleChoiceAnswer,
    OpenAnswer,
    PrivateQnaireId,
    Questionnaire,
    Question,
    OpenQuestion,
    RangeAnswer,
    RangeQuestion,
    MultipleChoiceQuestion,
    Choice,
    Answer,
    Respondent,
    Component,
    Response,
    Section,
    # PrivateQnaireId
)
from accounts.models import User


# http://concisecoder.io/2018/11/17/normalize-your-django-rest-serializers/
class DictSerializer(serializers.ListSerializer):
    dict_key = 'id'

    @property
    def data(self):
        """
        Overriden to return a ReturnDict instead of a ReturnList.
        """
        ret = super(serializers.ListSerializer, self).data
        return serializers.ReturnDict(ret, serializer=self)

    def to_representation(self, data):
        """
        Converts the data from a list to a dictionary.
        """
        items = super(DictSerializer, self).to_representation(data)
        return {item[self.dict_key]: item for item in items}


def validate_move(queryset, data):
    if data['order_num'] >= queryset.count():
        raise serializers.ValidationError(
            {'order_num': 'Invalid order_num'})
    return data


def validate_ordered_add(queryset, data):
    if data['order_num'] > queryset.count():
        raise serializers.ValidationError(
            {'order_num': 'Invalid order_num'})
    return data


def get_latest_field_value(field, data, instance):
    if field in data:
        return data[field]
    # returns None if instance is None or attr doesn't exist
    return getattr(instance, field, None)

# on update returns the old value, on create returns the new value


def get_original_field_value(field, data, instance):
    if instance:
        return getattr(instance, field, None)
    return data[field]


def validate_less_than_or_equal(a, b, a_field, b_field):
    if (a is None) or (b is None) or (a <= b):
        return
    err_msg = f'{a_field} must be less than or equal to {b_field}'
    error = {}
    error[a_field] = err_msg
    error[b_field] = err_msg
    raise serializers.ValidationError(error)


def validate_less_than(a, b, a_field, b_field):
    if (a is None) or (b is None) or (a < b):
        return
    err_msg = f'{a_field} must be less than {b_field}'
    error = {}
    error[a_field] = err_msg
    error[b_field] = err_msg
    raise serializers.ValidationError(error)


def raise_answer_error(q, text):
    error_data = {}
    error_data[q.id] = text
    raise serializers.ValidationError(error_data)


def raise_answer_error_if_mandatory(q):
    if q.mandatory:
        raise_answer_error(
            q, "Question is mandatory, but no answer was provided")


def raise_validation_error_if_qnaire_published(qnaire):
    if qnaire.published:
        raise serializers.ValidationError({'detail':
                                           f'The action is not allowed on a published questionnaire'})


QUESTION_FIELDS = ('id', 'section', 'order_num', 'text', 'mandatory')


class QuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = QUESTION_FIELDS
        extra_kwargs = {'text': {'trim_whitespace': False}}

    def validate(self, data):
        section = get_original_field_value('section', data, self.instance)
        # on update (having two serializers would be fine as well)
        if self.instance:
            if 'section' in data:
                if data['section'] != section:
                    raise serializers.ValidationError(
                        f"section can only be updated through the 'move' API action")
            if 'order_num' in data:
                if data['order_num'] != self.instance.order_num:
                    raise serializers.ValidationError(
                        f"order_num can only be updated through the 'move' API action")
        # on create
        else:
            request = self.context.get('request')
            section = data['section']
            # make sure the created question belongs to a qnaire owned by the current user
            if section.qnaire.creator != request.user:
                raise serializers.ValidationError(
                    f"Section belongs to a questionnaire not owned by the user")

            data = validate_ordered_add(
                Question.objects.filter(section=section), data)

        return self.do_validate(data)

    @ abc.abstractmethod
    def do_validate(self, data):
        pass

# I inherit from QuestionSerializer so that base validation method can be potentially reused


class OpenQuestionSerializer(QuestionSerializer):
    class Meta:
        model = OpenQuestion
        fields = QUESTION_FIELDS + ('min_length', 'max_length', )

    def do_validate(self, data):
        min_length = get_latest_field_value('min_length', data, self.instance)
        max_length = get_latest_field_value('max_length', data, self.instance)
        validate_less_than_or_equal(
            min_length, max_length, 'min_length', 'max_length')

        return data


class RangeQuestionSerializer(QuestionSerializer):

    class Meta:
        model = RangeQuestion
        fields = QUESTION_FIELDS + ('type', 'min', 'max', 'step')

    def do_validate(self, data):
        min = get_latest_field_value('min', data, self.instance)
        max = get_latest_field_value('max', data, self.instance)
        validate_less_than(min, max, 'min', 'max')

        step = get_latest_field_value('step', data, self.instance)
        if step is not None:
            if not min.is_integer():
                raise serializers.ValidationError(
                    {'min': 'min must be an integer when step is defined'})
            if not max.is_integer():
                raise serializers.ValidationError(
                    {'max': 'max must be an integer when step is defined'})
            validate_less_than_or_equal(step, max - min, 'step', 'max - min')

        type = get_latest_field_value('type', data, self.instance)
        if type in [RangeQuestion.ENUMERATE, RangeQuestion.STAR_RATING, RangeQuestion.SMILEY_RATING]:
            type_name = dict(RangeQuestion.TYPE_CHOICES)[type]
            if step is None:
                raise serializers.ValidationError(
                    f'step must be defined for type {type_name}')
            if (max - min) / step >= RangeQuestion.MAX_CHOICES_FOR_ENUMERATE:
                raise serializers.ValidationError(
                    f'Number of choices would exceed {RangeQuestion.MAX_CHOICES_FOR_ENUMERATE}')
        if type in [RangeQuestion.STAR_RATING, RangeQuestion.SMILEY_RATING]:
            if step != 1 or min != 1:
                raise serializers.ValidationError(
                    f'For type {type_name} these constraints must be true: step=1; min=1')
        if type == RangeQuestion.SMILEY_RATING:
            if max > RangeQuestion.MAX_SMILEYS:
                raise serializers.ValidationError(
                    f'max must be less than or equal to {RangeQuestion.MAX_SMILEYS} for type {type_name}')
        return data


CHOICE_FIELDS = ('id', 'text', 'order_num', 'skip_to_section', 'question')


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = CHOICE_FIELDS
        extra_kwargs = {'question': {'read_only': True},
                        'order_num': {'read_only': True},
                        'text': {'trim_whitespace': False}}
        list_serializer_class = DictSerializer

    def validate(self, data):
        question = get_original_field_value('question', data, self.instance)
        request = self.context.get('request')
        qnaire = question.section.qnaire

        data = self.do_validate(data, qnaire, request)

        skip_to_section = data.get('skip_to_section')
        if skip_to_section is not None and skip_to_section.qnaire != qnaire:
            raise serializers.ValidationError(
                f"skip_to_section belongs to a different questionnaire than the choice.")
        return data

    def do_validate(self, data, qnaire, request):
        return data


class CreateChoiceSerializer(ChoiceSerializer):
    class Meta:
        model = Choice
        fields = CHOICE_FIELDS
        list_serializer_class = DictSerializer

    def do_validate(self, data, qnaire, request):
        # make sure the created choice belongs to a qnaire owned by the current user
        if qnaire.creator != request.user:
            raise serializers.ValidationError(
                f"The question belongs to a questionnaire not owned by the user")

        return data


class MultipleChoiceQuestionSerializer(QuestionSerializer):
    # choices = ChoiceSerializer(
    #     many=True, read_only=True, source='choice_set')

    class Meta:
        model = MultipleChoiceQuestion
        fields = QUESTION_FIELDS + \
            ('min_answers', 'max_answers', 'other_choice', 'random_order', )

    def do_validate(self, data):
        min_answers = get_latest_field_value(
            'min_answers', data, self.instance)
        max_answers = get_latest_field_value(
            'max_answers', data, self.instance)
        validate_less_than_or_equal(
            min_answers, max_answers, 'min_answers', 'max_answers')

        # make sure min_answers and max_answers doesn't exceed total number of choices
        if self.instance is not None:
            total_choices = Choice.objects.filter(
                question=self.instance).count()
            if self.instance.other_choice:
                total_choices += 1
            if total_choices > 0:
                validate_less_than_or_equal(
                    min_answers, total_choices, 'min_answers', 'total number of choices')
                if max_answers is not None:
                    validate_less_than_or_equal(
                        max_answers, total_choices, 'max_answers', 'total number of choices')

        return data


class QuestionPolymorphicSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        # Question: QuestionSerializer, # instances of Question are not allowed
        OpenQuestion: OpenQuestionSerializer,
        RangeQuestion: RangeQuestionSerializer,
        MultipleChoiceQuestion: MultipleChoiceQuestionSerializer
    }

    class Meta:
        list_serializer_class = DictSerializer


class QuestionMoveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('order_num', 'section')

    def validate(self, data):
        src_question = self.context.get('src')
        section = data['section']
        # the question with the target order_num must be in the target section
        queryset = Question.objects.filter(section=section)
        if src_question.section == section:
            return validate_move(queryset, data)
        else:
            # the target section must be from the same qnaire as the src
            queryset = queryset.filter(
                section__qnaire=src_question.section.qnaire)
            return validate_ordered_add(queryset, data)


class OpenQuestionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpenQuestion
        fields = ()


class RangeQuestionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RangeQuestion
        fields = ()


class MultipleChoiceQuestionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MultipleChoiceQuestion
        fields = ()


class QuestionTypePolymorphicSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        # Question: QuestionSerializer, # instances of Question are not allowed
        OpenQuestion: OpenQuestionTypeSerializer,
        RangeQuestion: RangeQuestionTypeSerializer,
        MultipleChoiceQuestion: MultipleChoiceQuestionTypeSerializer
    }


SECTION_FIELDS = ('id', 'name', 'desc', 'order_num')


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = SECTION_FIELDS
        extra_kwargs = {'order_num': {'read_only': True},
                        'name': {'trim_whitespace': False},
                        'desc': {'trim_whitespace': False}}
        list_serializer_class = DictSerializer

    def validate(self, data):
        return self.do_validate(data)

    def do_validate(self, data):
        return data


class CreateSectionSerializer(SectionSerializer):
    class Meta:
        model = Section
        fields = SECTION_FIELDS + ('qnaire',)

    def do_validate(self, data):
        request = self.context.get('request')
        qnaire = data['qnaire']

        # make sure the created section belongs to a qnaire owned by the current user
        if qnaire.creator != request.user:
            raise serializers.ValidationError(
                f"User doesn't own the questionnaire")

        return validate_ordered_add(Section.objects.filter(qnaire=qnaire), data)


class SectionMoveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ('order_num', )

    def validate(self, data):
        src_section = self.context.get('src')
        queryset = Section.objects.filter(qnaire=src_section.qnaire)
        return validate_move(queryset, data)


QUESTIONNAIRE_FIELDS = ('id', 'name', 'desc', 'anonymous',
                        'private', 'published', 'last_modified', 'created_at')


class QuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionnaire
        fields = QUESTIONNAIRE_FIELDS
        extra_kwargs = {'name': {'trim_whitespace': False},
                        'desc': {'trim_whitespace': False}}
        list_serializer_class = DictSerializer

    def validate(self, data):
        request = self.context.get('request')
        if 'name' in data:
            name = data['name']
            qs = Questionnaire.objects.filter(
                creator=request.user, name__iexact=name)
            if self.instance:
                qs = qs.exclude(id=self.instance.id)
            if qs.exists():
                raise serializers.ValidationError(
                    {'name': f"Name must be unique within user's questionnaires"})

        return data


class QuestionnaireRetrieveSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, source='section_set')
    questions = serializers.SerializerMethodField()
    choices = serializers.SerializerMethodField()

    class Meta:
        model = Questionnaire
        fields = QUESTIONNAIRE_FIELDS + ('sections', 'questions', 'choices')

    def get_questions(self, qnaire):
        questions = Question.objects.filter(
            section__in=qnaire.section_set.all())
        return QuestionPolymorphicSerializer(questions, many=True).data

    def get_choices(self, qnaire):
        choices = Choice.objects.filter(
            question__section__in=qnaire.section_set.all())
        return ChoiceSerializer(choices, many=True).data


ANSWER_FIELDS = ()


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ANSWER_FIELDS


class OpenAnswerSerializer(AnswerSerializer):
    class Meta:
        model = OpenAnswer
        fields = ANSWER_FIELDS + ('question', 'text')

    def validate(self, data):
        q = data['question']
        if 'text' not in data or len(data['text']) == 0:
            raise_answer_error_if_mandatory(q)
            return data

        text = data['text']
        if q.min_length is not None and len(text) < q.min_length:
            raise raise_answer_error(
                q, f"Answer must be at least {q.min_length} characters long")
        if q.max_length is not None and len(text) > q.max_length:
            raise raise_answer_error(
                q, f"Answer must be shorter than {q.min_length} characters")
        return data


class RangeAnswerSerializer(AnswerSerializer):
    class Meta:
        model = RangeAnswer
        fields = ANSWER_FIELDS + ('question', 'num')

    def validate(self, data):
        q = data['question']
        num = data.get('num', None)
        if num is None:
            raise_answer_error_if_mandatory(q)
            return data

        if num < q.min:
            raise raise_answer_error(
                q, f"Answer must be greater than or equal to {q.min}")
        if num > q.max:
            raise raise_answer_error(
                q, f"Answer must be less than or equal to {q.max}")
        if q.step is not None and (num - q.min) % q.step != 0:
            raise raise_answer_error(
                q, f"Answer must be a step of {q.step}")
        return data


class MultipleChoiceAnswerSerializer(AnswerSerializer):
    class Meta:
        model = MultipleChoiceAnswer
        fields = ANSWER_FIELDS + ('question', 'choices', 'other_choice_text')
        extra_kwargs = {'choices': {'required': False, 'allow_empty': True}}

    def validate(self, data):
        q = data['question']
        choice_pool = set(q.choice_set.all())
        if 'choices' not in data:
            selected_choices = []
            total_selected_choices = 0
        else:
            selected_choices = data['choices']
            total_selected_choices = len(selected_choices)

        if 'other_choice_text' in data and len(data['other_choice_text']) > 0:
            if not q.other_choice:
                raise serializers.ValidationError(
                    f"Other choice is not allowed for question '{q}'")
            else:
                total_selected_choices += 1

        if total_selected_choices == 0:
            raise_answer_error_if_mandatory(q)
            return data

        if total_selected_choices < q.min_answers:
            raise raise_answer_error(
                q, f"Fewer choices were selected than the allowed minimum of {q.min_answers}")

        if total_selected_choices > q.max_answers:
            raise raise_answer_error(
                q, f"More choices were selected than the allowed maximum of {q.max_answers}")

        for choice in selected_choices:
            if choice not in choice_pool:
                raise raise_answer_error(
                    q, f"Invalid choice was provided as answer")
            # remove the choice from pool to prevent duplicate choices
            choice_pool.remove(choice)

        return data


class AnswerPolymorhicSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        # Answer: AnswerSerializer,
        OpenAnswer: OpenAnswerSerializer,
        RangeAnswer: RangeAnswerSerializer,
        MultipleChoiceAnswer: MultipleChoiceAnswerSerializer
    }


class ResponseSerializer(serializers.ModelSerializer):
    answers = AnswerPolymorhicSerializer(many=True, source='answer_set')

    class Meta:
        model = Response
        fields = ('answers', 'respondent', 'submit_timestamp')
        # extra_kwargs = {'respondent': {'required': False}} # this should be automatic by having the field be null=True

    def validate(self, data):
        qnaire = self.context.get('qnaire')
        if not qnaire.published:
            raise serializers.ValidationError(
                'Response cannot be submited because questionnaire is not published')

        respondent = data.get('respondent')
        if qnaire.anonymous and respondent is not None:
            raise serializers.ValidationError(
                "Response can't contain a respondent because the questionnaire is anonymous")
        elif not qnaire.anonymous and respondent is None:
            raise serializers.ValidationError(
                "Response must contain a respondent because the questionnaire is not anonymous")

        questions = set(Question.objects.filter(section__qnaire=qnaire))
        for answer in data['answer_set']:
            if answer['question'] not in questions:
                raise serializers.ValidationError(
                    'Response contains an answer to a question which is not a part of the given questionnaire')
            else:
                questions.remove(answer['question'])
        if len(questions) != 0:
            raise serializers.ValidationError(
                'Answers were not provided for every question of the questionnaire')

        return data

    # I need to make a custom create method for serializing relationships, and hence I also have to branch Answer based on type
    def create(self, validated_data):
        answers_data = validated_data.pop('answer_set')
        response = Response.objects.create(**validated_data)
        for answer_data in answers_data:
            # resourcetype has already been validated by the polymorphic serializer
            type = answer_data.pop('resourcetype')
            answer_class = None
            choices = None
            if type == 'OpenAnswer':
                answer_class = OpenAnswer
            elif type == 'RangeAnswer':
                answer_class = RangeAnswer
            elif type == 'MultipleChoiceAnswer':
                answer_class = MultipleChoiceAnswer
                if 'choices' in answer_data:
                    choices = answer_data.pop('choices')
            answer = answer_class.objects.create(
                response=response, **answer_data)
            if choices is not None:
                answer.choices.set(choices)
        return response


class PrivateQnaireIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateQnaireId
        fields = ('id', 'qnaire')


class PrivateQnaireIdResponseSerializer(serializers.ModelSerializer):
    private_qnaire_id = serializers.CharField(source='id')

    class Meta:
        model = PrivateQnaireId
        fields = ('private_qnaire_id',)


class RespondentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respondent
        fields = ('id', )

# class ComponentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Component
#         fields = ()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'date_joined')
        extra_kwargs = {'password': {'write_only': True},
                        'date_joined': {'read_only': True}}

    def validate(self, data):
        try:
            validate_password(data['password'])
        except forms.ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})

        return data

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
