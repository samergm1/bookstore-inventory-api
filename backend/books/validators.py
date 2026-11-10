import re

ISBN_ALLOWED_CHARS = re.compile(r'^[0-9Xx\-\s]+$')


def normalize_isbn(value: str) -> str:
    return re.sub(r'[\-\s]', '', value or '').upper()


def is_valid_isbn_format(value: str) -> bool:
    if not value or not ISBN_ALLOWED_CHARS.match(value):
        return False
    digits = normalize_isbn(value)
    if len(digits) == 13:
        return digits.isdigit()
    if len(digits) == 10:
        return digits[:9].isdigit() and (digits[9].isdigit() or digits[9] == 'X')
    return False