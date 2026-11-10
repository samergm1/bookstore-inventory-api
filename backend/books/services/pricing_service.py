from decimal import ROUND_HALF_UP, Decimal
from django.conf import settings
from django.utils import timezone
from books.models import Book
from books.services.exchange_rate_client import ExchangeRateClient

TWO_PLACES = Decimal('0.01')

COUNTRY_CURRENCY = {
    'ES': 'EUR', 'FR': 'EUR', 'DE': 'EUR', 'IT': 'EUR', 'PT': 'EUR',
    'NL': 'EUR', 'BE': 'EUR', 'IE': 'EUR', 'AT': 'EUR', 'FI': 'EUR', 'GR': 'EUR',
    'US': 'USD', 'GB': 'GBP', 'CO': 'COP', 'MX': 'MXN', 'AR': 'ARS',
    'CL': 'CLP', 'PE': 'PEN', 'BR': 'BRL', 'CA': 'CAD', 'JP': 'JPY',
}


def currency_for_country(country_code: str) -> str:
    return COUNTRY_CURRENCY.get((country_code or '').upper(), settings.DEFAULT_LOCAL_CURRENCY)


class PricingService:
    def __init__(self, rate_client: ExchangeRateClient | None = None):
        self.rate_client = rate_client or ExchangeRateClient()

    def calculate_and_save(self, book: Book) -> dict:
        currency = currency_for_country(book.supplier_country)
        rate = self.rate_client.get_rate(currency)
        margin = Decimal(str(settings.PRICING_MARGIN_PERCENTAGE))

        cost_local = (book.cost_usd * rate.rate).quantize(TWO_PLACES, ROUND_HALF_UP)
        selling_price = (cost_local * (1 + margin / 100)).quantize(TWO_PLACES, ROUND_HALF_UP)

        book.selling_price_local = selling_price
        book.save(update_fields=['selling_price_local', 'updated_at'])

        return {
            'book_id': book.id,
            'cost_usd': book.cost_usd,
            'exchange_rate': rate.rate,
            'cost_local': cost_local,
            'margin_percentage': margin,
            'selling_price_local': selling_price,
            'currency': currency,
            'exchange_rate_source': rate.source,
            'calculation_timestamp': timezone.now(),
        }