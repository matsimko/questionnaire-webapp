from django.urls import path, include
from rest_framework.authtoken import views
from rest_framework.urlpatterns import format_suffix_patterns

from .views import ResponseView, ResultStatsView, ResultView, CreateUserView

urlpatterns = [
    path('auth/', views.obtain_auth_token),
    path('users/', CreateUserView.as_view()),
    path('questionnaires/<int:id>/response/', ResponseView.as_view()),
    path('questionnaires/<int:id>/result/', ResultView.as_view()),
    path('questionnaires/<int:id>/stats/', ResultStatsView.as_view()),
    # path('questionnaires/<int:id>/private-id/', PrivateQnaireIdView.as_view()),
    path('', include('api.routers')),
]

urlpatterns = format_suffix_patterns(urlpatterns, allowed=['json', 'csv'])