from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer, PriceCalculationSerializer
from .services.pricing_service import PricingService


class BookViewSet(viewsets.ModelViewSet):
    """
    POST   /books                        Create book
    GET    /books?page=&page_size=       List paginated book
    GET    /books/{id}                   Detail
    PUT    /books/{id}                   Update book
    DELETE /books/{id}                   Delete book
    GET    /books/search?category=       Search by category
    GET    /books/low-stock?threshold=10 Books with low stock
    POST   /books/{id}/calculate-price   Calculate suggested sell price
    """

    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def _paginated(self, queryset):
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        category = request.query_params.get('category', '').strip()
        if not category:
            raise ValidationError({'category': ['El parámetro de categoría es obligatorio.']})
        qs = self.get_queryset().filter(category__icontains=category)
        return self._paginated(qs)

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        raw = request.query_params.get('threshold', '10')
        try:
            threshold = int(raw)
            if threshold < 0:
                raise ValueError
        except ValueError:
            raise ValidationError({'threshold': ['Debe ser un entero mayor o igual a 0.']})
        qs = self.get_queryset().filter(stock_quantity__lte=threshold).order_by(
            'stock_quantity', 'id'
        )
        return self._paginated(qs)

    @action(detail=True, methods=['post'], url_path='calculate-price')
    def calculate_price(self, request, pk=None):
        book = self.get_object()
        result = PricingService().calculate_and_save(book)
        return Response(PriceCalculationSerializer(result).data, status=status.HTTP_200_OK)