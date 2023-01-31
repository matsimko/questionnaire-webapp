from django.urls import path, include
from django.views.defaults import server_error
from .views import index

urlpatterns = [
    path('', index),
    path('login/', index),
    path('register/', index),
    path('questionnaires/', index),
    path('questionnaires/<int:pk>/', index),
    path('questionnaires/<int:pk>/response/', index),
    path('questionnaires/<int:pk>/response/<str:private_id>/', index),
    path('500/', server_error),
]
