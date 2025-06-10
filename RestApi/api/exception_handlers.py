from rest_framework.views import exception_handler
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        logger.error(f"Ошибка: {exc} | Контекст: {context}")
        response.data['status_code'] = response.status_code
        response.data['error'] = response.data.get('detail', 'Ошибка обработки запроса')
    else:
        logger.critical(f"Непредвиденная ошибка: {exc} | Контекст: {context}")
    return response