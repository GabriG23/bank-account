from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, TransactionViewSet, AccountViewSet # AuthViewSet

# link router https://www.django-rest-framework.org/api-guide/routers/

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls))
]