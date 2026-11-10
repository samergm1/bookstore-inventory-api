from django.db import models
from decimal import Decimal
from django.core.validators import MinValueValidator


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=17, unique=True)
    cost_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    selling_price_local = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True
    )
    stock_quantity = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=100, db_index=True)
    supplier_country = models.CharField(max_length=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']
        constraints = [
            models.CheckConstraint(condition=models.Q(cost_usd__gt=0), name='book_cost_usd_gt_0'),
        ]

    def __str__(self) -> str:
        return f'{self.title} ({self.isbn})'