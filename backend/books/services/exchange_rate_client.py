import logging
import requests
from dataclasses import dataclass
from decimal import Decimal
from django.conf import settings
from django.core.cache import cache
from books.exceptions import ServiceUnavailable

logger = logging.getLogger(__name__)

CACHE_KEY = 'exchange_rates:USD'


@dataclass(frozen=True)
class ExchangeRate:
    currency: str
    rate: Decimal
    source: str


class ExchangeRateClient:
    def __init__(self, url: str | None = None, timeout: float | None = None):
        self.url = url or settings.EXCHANGE_RATE_API_URL
        self.timeout = timeout or settings.EXCHANGE_RATE_TIMEOUT_SECONDS

    def _fetch_rates(self) -> dict:
        response = requests.get(self.url, timeout=self.timeout)
        response.raise_for_status()
        rates = response.json().get('rates')
        if not isinstance(rates, dict) or not rates:
            raise ValueError('Respuesta de la API sin tasas')
        return rates

    def get_rate(self, currency: str) -> ExchangeRate:
        currency = currency.upper()
        rates = cache.get(CACHE_KEY)
        source = 'cache'
        
        if rates is None:
            try:
                rates = self._fetch_rates()
                cache.set(CACHE_KEY, rates, settings.EXCHANGE_RATE_CACHE_SECONDS)
                source = 'api'
            except (requests.RequestException, ValueError) as exc:
                logger.warning('API de tasas no disponible (%s). Usando tasa por defecto.', exc)
                rates = None

        if rates and currency in rates:
            return ExchangeRate(currency, Decimal(str(rates[currency])), source)

        default = settings.DEFAULT_EXCHANGE_RATES.get(currency)
        if default is None:
            raise ServiceUnavailable(
                f'No se pudo obtener la tasa de cambio USD -> {currency} '
                'y no hay tasa por defecto configurada.'
            )
        return ExchangeRate(currency, Decimal(str(default)), 'default')
