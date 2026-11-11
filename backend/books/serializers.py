from decimal import Decimal
from django.db.models import Value
from django.db.models.functions import Replace, Upper
from rest_framework import serializers

from .services.pricing_service import currency_for_country
from .models import Book
from .validators import is_valid_isbn_format, normalize_isbn


class BookSerializer(serializers.ModelSerializer):
    cost_usd = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    selling_price_local = serializers.DecimalField(max_digits=14, decimal_places=2, coerce_to_string=False, read_only=True)
    stock_quantity = serializers.IntegerField()
    currency = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'isbn',
            'cost_usd',
            'selling_price_local',
            'currency',
            'stock_quantity',
            'category',
            'supplier_country',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'selling_price_local', 'currency', 'created_at', 'updated_at']
        extra_kwargs = {'isbn': {'validators': []}}
        
    def get_currency(self, obj: Book):
        return currency_for_country(obj.supplier_country)

    def validate_title(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError('El título no puede estar vacío.')
        return value

    def validate_author(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError('El autor no puede estar vacío.')
        return value

    def validate_category(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError('La categoría no puede estar vacía.')
        return value

    def validate_cost_usd(self, value: Decimal) -> Decimal:
        if value <= 0:
            raise serializers.ValidationError('El valor en USD debe ser mayor a 0.')
        return value

    def validate_stock_quantity(self, value: int) -> int:
        if value < 0:
            raise serializers.ValidationError('La cantidad de inventario no puede ser negativa.')
        return value

    def validate_supplier_country(self, value: str) -> str:
        value = value.strip().upper()
        if len(value) != 2 or not value.isalpha():
            raise serializers.ValidationError('El país del proveedor debe ser un código de 2 letras (ej. "ES").')
        return value

    def validate_isbn(self, value: str) -> str:
        value = value.strip()
        if not is_valid_isbn_format(value):
            raise serializers.ValidationError('ISBN inválido: debe tener 10 o 13 dígitos.')
        normalized = normalize_isbn(value)
        qs = Book.objects.annotate(
            isbn_norm=Upper(
                Replace(Replace('isbn', Value('-'), Value('')), Value(' '), Value(''))
            )
        ).filter(isbn_norm=normalized)
        # Exclude this book if the operation is PUT
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ya existe un libro con este ISBN.')
        return value


class PriceCalculationSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    cost_usd = serializers.FloatField()
    exchange_rate = serializers.FloatField()
    cost_local = serializers.FloatField()
    margin_percentage = serializers.FloatField()
    selling_price_local = serializers.FloatField()
    currency = serializers.CharField()
    exchange_rate_source = serializers.CharField()
    calculation_timestamp = serializers.DateTimeField()