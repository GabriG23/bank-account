from rest_framework import serializers
from .models import Client, Account, Transaction

# link serializers: https://docs.djangoproject.com/en/5.1/topics/serialization/
# traducono il formato dati di Django in altri, in questo caso vengono passati a react come JSON

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'