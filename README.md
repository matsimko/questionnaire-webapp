# A Tool for Creating Web Questionnaire Surveys

I developed this web application for [my bachelor's thesis](https://dspace.vsb.cz/handle/10084/147344).

Abstract:
>This thesis deals with the development of a web application which allows creation and filling out
of questionnaires. Users can create questionnaires, add sections to them and add questions to each
section. The application aims to make the creation of a questionnaire as convenient as possible.
That’s why it contains functionality like autosave, local validation and rearrangement of sections
and questions via drag and drop. The questionnaire’s creator can publish the questionnaire in one
of the available modes and then share links for the filling out of the questionnaire to respondents.
A respondent fills out the questionnaire one section at a time, while potentially being notified
about errors (e.g. a required question was not answered) before entering the next section. Once
all sections are filled out, the questionnaire is sent to the server to be further processed. Data
gathered from the responses can be exported by the creator in the JSON or CSV formats. The
server side is implemented as a REST API in the Python programming language using the Django
framework. The client side is written in the JavaScript programming language with the help of the
React framework.


## Running the app
```
git clone https://github.com/matsimko/questionnaire-webapp.git
cd questionnaire-webapp

python -m venv venv
.\venv\Scripts\activate
pip install django djangorestframework django-polymorphic django-rest-polymorphic

python .\qnaire\manage.py runserver
```

Admin user:\
username:admin\
password:EaSo8OK1aioMdH
