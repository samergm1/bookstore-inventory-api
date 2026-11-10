import logging

from django.http import JsonResponse
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Servicio temporalmente no disponible.'
    default_code = 'service_unavailable'


def _error_body(status_code: int, code: str, message: str, details=None) -> dict:
    body = {'error': {'status': status_code, 'code': code, 'message': message}}
    if details is not None:
        body['error']['details'] = details
    return body


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        logger.exception('Error no controlado', exc_info=exc)
        from rest_framework.response import Response

        return Response(
            _error_body(500, 'internal_error', 'Error interno del servidor.'),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if isinstance(exc, ValidationError):
        response.data = _error_body(
            response.status_code,
            'validation_error',
            'Los datos enviados no son válidos.',
            details=response.data,
        )
        return response

    detail = response.data.get('detail') if isinstance(response.data, dict) else None
    code = getattr(detail, 'code', None) or getattr(exc, 'default_code', 'error')
    response.data = _error_body(response.status_code, str(code), str(detail or exc))
    return response


def json_404(request, exception=None):
    return JsonResponse(_error_body(404, 'not_found', 'Recurso no encontrado.'), status=404)


def json_500(request):
    return JsonResponse(_error_body(500, 'internal_error', 'Error interno del servidor.'), status=500)