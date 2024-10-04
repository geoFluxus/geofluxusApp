from django.core.exceptions import ValidationError
from django.utils.translation import ugettext as _
import re


class SpecialCharactersPasswordValidator():
    def __init__(self, min_length=1):
        self.min_length = min_length

    def validate(self, password, user=None):
        special_characters = "[~!@#$%^&*_+{}\":;'[]]"
        if not any(char.isdigit() for char in password):
            raise ValidationError(_('Password must contain at least %(min_length)d digit.') % {'min_length': self.min_length})
        if not any(char.isalpha() for char in password):
            raise ValidationError(_('Password must contain at least %(min_length)d letter.') % {'min_length': self.min_length})
        if not any(char.isupper() for char in password):
            raise ValidationError(_('Password must contain at least %(min_length)d capital letter.') % {'min_length': self.min_length})
        if not any(char in special_characters for char in password):
            raise ValidationError(_('Password must contain at least %(min_length)d special character.') % {'min_length': self.min_length})

    def get_help_text(self):
        return _("Your password must contain at least 1 small letter, 1 capital letter, 1 number and 1 special character.")


class CharacterSequencePasswordValidator():
    def __init__(self, min_length=1):
        self.min_length = min_length

    def validate(self, password, user=None):
        if re.search(r'(.)\1\1', password):
            raise ValidationError(
                _('Password 2 contain maximum 2 of the same characters right after each other.')
            )

    def get_help_text(self):
        return _("Your password may contain maximum 2 of the same characters right after each other.")