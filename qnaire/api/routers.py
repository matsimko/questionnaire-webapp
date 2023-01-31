from rest_framework import routers

from .viewsets import AnswerViewSet, ChoiceViewSet, PrivateQnaireIdViewSet, QuestionnaireViewSet, QuestionViewSet, RespondentViewSet, SectionViewSet

router = routers.SimpleRouter()
router.register('questionnaires', QuestionnaireViewSet)
router.register('questions', QuestionViewSet)
router.register('sections', SectionViewSet)
router.register('choices', ChoiceViewSet)
router.register('respondents', RespondentViewSet)
router.register('private-qnaire-ids', PrivateQnaireIdViewSet)
# router.register('answers', AnswerViewSet)

urlpatterns = router.urls
