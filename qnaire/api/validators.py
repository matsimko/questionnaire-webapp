from lib2to3.pytree import Base
from django.core.exceptions import ValidationError
from django.core.validators import BaseValidator
from django.utils.translation import gettext_lazy as _
from django.utils.deconstruct import deconstructible

@deconstructible
class GreaterThanValidator(BaseValidator):
    message = _('Ensure this value is greater than %(limit_value)s.')
    code = 'max_value'

    def compare(self, a, b):
        return a <= b