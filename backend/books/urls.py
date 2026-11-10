from rest_framework.routers import SimpleRouter

from .views import BookViewSet

router = SimpleRouter()
router.trailing_slash = '/?'
router.register('books', BookViewSet, basename='book')

urlpatterns = router.urls