import abc
from django.db import models
from django.core.validators import MinValueValidator
from polymorphic.models import PolymorphicModel
from accounts.models import User
from secrets import token_urlsafe

from .validators import GreaterThanValidator

# needed because of a bug in django-polymorphic
def NON_POLYMORPHIC_CASCADE(collector, field, sub_objs, using):
    return models.CASCADE(collector, field, sub_objs.non_polymorphic(), using)


class Respondent(models.Model):
    id = models.CharField(primary_key=True, max_length=64)


class Response(models.Model):
    respondent = models.ForeignKey(
        Respondent, on_delete=models.SET_NULL, null=True)
    submit_timestamp = models.DateTimeField(auto_now_add=True)


class Questionnaire(models.Model):
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100)
    desc = models.TextField(blank=True)
    anonymous = models.BooleanField(default=True)
    private = models.BooleanField(default=False)
    published = models.BooleanField(default=False)
    # active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f'{self.name}'


class Section(models.Model):
    qnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    desc = models.TextField(blank=True)
    order_num = models.IntegerField(validators=[MinValueValidator(0)])

    class Meta:
        indexes = [
            models.Index(fields=['qnaire', 'order_num']),
        ]

    def __str__(self) -> str:
        return f'{self.name}'


class Question(PolymorphicModel):
    section = models.ForeignKey(Section, on_delete=NON_POLYMORPHIC_CASCADE)
    text = models.TextField()
    mandatory = models.BooleanField(default=False)
    order_num = models.IntegerField(validators=[MinValueValidator(0)])

    class Meta:
        indexes = [
            models.Index(fields=['section', 'order_num']),
        ]

    @abc.abstractmethod
    def get_answer_set(self):
        return

    def __str__(self) -> str:
        return f'{self.text}'


class OpenQuestion(Question):
    min_length = models.IntegerField(
        null=True, validators=[MinValueValidator(1)])
    max_length = models.IntegerField(
        null=True, validators=[MinValueValidator(1)])

    def get_answer_set(self):
        return self.openanswer_set


class RangeQuestion(Question):
    ENUMERATE = 1
    SLIDER = 2
    FIELD = 3
    STAR_RATING = 4
    SMILEY_RATING = 5

    TYPE_CHOICES = (
        (ENUMERATE, 'Enumerate'),
        (SLIDER, 'Slider'),
        (FIELD, 'Field'),
        (STAR_RATING, 'Star rating'),
        (SMILEY_RATING, 'Smiley rating'),
    )

    MAX_CHOICES_FOR_ENUMERATE = 20
    MAX_SMILEYS = 5

    type = models.IntegerField(choices=TYPE_CHOICES, default=2)
    min = models.FloatField(default=1)
    max = models.FloatField(default=5)
    # only integer step will be allowed (the alternative is make all fields decimal so that it would be possible to validate the step)
    step = models.IntegerField(null=True, validators=[GreaterThanValidator(0)])

    def get_answer_set(self):
        return self.rangeanswer_set

class MultipleChoiceQuestion(Question):
    min_answers = models.IntegerField(
        validators=[MinValueValidator(1)], default=1)
    max_answers = models.IntegerField(
        validators=[MinValueValidator(1)], default=1)
    other_choice = models.BooleanField(default=False)
    random_order = models.BooleanField(default=False)

    def get_answer_set(self):
        return self.multiplechoiceanswer_set

class Choice(models.Model):
    question = models.ForeignKey(
        MultipleChoiceQuestion, on_delete=models.CASCADE)
    text = models.CharField(max_length=100)
    order_num = models.IntegerField(
        validators=[MinValueValidator(0)])
    skip_to_section = models.ForeignKey(
        Section, on_delete=models.SET_NULL, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['question', 'order_num']),
        ]

    def __str__(self) -> str:
        return f'{self.text}'


class Answer(PolymorphicModel):
    response = models.ForeignKey(Response, on_delete=NON_POLYMORPHIC_CASCADE)

    @abc.abstractmethod
    def get_value_str(self):
        return



class OpenAnswer(Answer):
    question = models.ForeignKey(OpenQuestion, on_delete=models.PROTECT)
    text = models.TextField(blank=True)

    def get_value_str(self):
        return self.text


class RangeAnswer(Answer):
    question = models.ForeignKey(RangeQuestion, on_delete=models.PROTECT)
    num = models.FloatField(null=True)

    def get_value_str(self):
        return str(self.num) if self.num is not None else ''

class MultipleChoiceAnswer(Answer):
    question = models.ForeignKey(
        MultipleChoiceQuestion, on_delete=models.PROTECT)
    # saves me from having to create an "association table"
    choices = models.ManyToManyField(Choice)
    other_choice_text = models.TextField(blank=True)

    def get_value_str(self):
        choices = [str(choice) for choice in self.choices.all()]
        if self.other_choice_text:
            choices.append(self.other_choice_text)
        return ','.join(choices)
        


class Component(models.Model):
    # add custom on_delete: if is_global then SET_NULL else CASCADE
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_global = models.BooleanField(default=False)
    data = models.TextField()  # maybe change this to JSONField


PRIVATE_QNAIRE_ID_LENGTH = 32


def generate_qnaire_private_id():
    while True:
        id = token_urlsafe(PRIVATE_QNAIRE_ID_LENGTH)
        if not PrivateQnaireId.objects.filter(id=id).exists():
            break
    return id


class PrivateQnaireId(models.Model):
    id = models.CharField(max_length=PRIVATE_QNAIRE_ID_LENGTH,
                          primary_key=True, default=generate_qnaire_private_id)
    qnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE)
