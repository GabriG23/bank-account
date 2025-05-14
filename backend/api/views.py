from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Client, Account, Transaction, create_transaction
from .serializers import ClientSerializer, AccountSerializer, TransactionSerializer
from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError


# link viewset: https://www.django-rest-framework.org/api-guide/viewsets/
# link apiview: https://www.django-rest-framework.org/api-guide/generic-views/
# link autenticazione (password): https://docs.djangoproject.com/it/4.0//topics/auth/
# link status code: https://www.django-rest-framework.org/api-guide/status-codes/ (codici classici, 200, 404...)
# link come effettuare un logout: https://docs.djangoproject.com/en/3.2/topics/auth/default/#how-to-log-a-user-out


class ClientViewSet(viewsets.ModelViewSet):     # view del Client
    queryset = Client.objects.all()             # oggetti del client
    serializer_class = ClientSerializer         # serializer del client

    @action(detail=True, methods=['get'])
    def info(self, request, pk=None):               # dato un account mi ritorna le informazioni su di esso
        client = self.get_object()
        data = {'name': client.name,
                'surname': client.surname,
                'email': client.email,
                'registration_date': client.registration_date,
                'client_status': client.client_status,
                'birthdate': client.birthdate,
                'phone': client.phone,
                'address': client.address
                }
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):       # ritorna lo stato del cliente
        client = self.get_object()
        return Response({'client_status': client.client_status})

    @action(detail=True, methods=['get'])
    def username(self, request, pk=None):       # ritorna l'username del cliente, mi serve per visualizzarlo in alto a destra in react
        client = self.get_object()
        return Response({'username': client.username})
    
    @action(detail=True, methods=['get'])
    def accounts(self, request, pk=None):       # ritorna gli account del cliente
        client = self.get_object()              # prendo i dati del client
        accounts = client.accounts.all().values('accountID')
        return Response(accounts)
    
class AccountViewSet(viewsets.ModelViewSet):    # view del Client
    queryset = Account.objects.all()            # prendo tutti gli oggetti
    serializer_class = AccountSerializer        # prendo la classe serializer

    @action(detail=True, methods=['get'])
    def info(self, request, pk=None):               # dato un account mi ritorna le informazioni su di esso
        account = self.get_object()                 # prendo l'account, ricordiamo che l'id lo da in automatico
        data = {'balance': account.balance,
                'opening_date': account.opening_date,
                'account_type': account.account_type,
                'account_status': account.account_status}
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def deposit(self, request, pk=None):
        account = self.get_object()             # usa la primary key internamente
        amount = request.data.get("amount")     # prendo l'amount dalla richiesta
        client = account.clientID               # prendo l'id del cliente

        try:
            amount = Decimal(amount)        # converto in decimale
            account.deposit(amount)         # lo effettuo. Se va male lancerà una eccezione, # se tutto va bene creo l'oggetto
            create_transaction(None, account, client, amount, 'DEPOSIT', 'COMPLETED')
            return Response({'status': 'deposit successful', 'new_balance': account.balance})
        except (InvalidOperation, TypeError, ValidationError) as e:
            amount = Decimal(amount) if amount else 0
            create_transaction(None, account, client, amount, 'DEPOSIT', 'FAILED')
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)     

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        account = self.get_object()             # prendo l'account in automatico
        amount = request.data.get("amount")     # prendo l'amount dalal request
        client = account.clientID               # prendo l'id del client
        try:
            amount = Decimal(amount)
            account.withdraw(amount)
            create_transaction(account, None, client, amount, 'WITHDRAW', 'COMPLETED')
            return Response({'status': 'withdraw successful', 'new_balance': account.balance})
        except (InvalidOperation, TypeError, ValidationError) as e:
            amount=Decimal(amount) if amount else 0
            create_transaction(account, None, client, amount, 'WITHDRAW', 'FAILED')
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        from_account = self.get_object()                # account sorgente lo prendo da URL
        to_account = request.data.get("to_account")     # dalla richiesta prendo il target
        amount = request.data.get("amount")             # prendo l'amount

        try:
            target_account = Account.objects.get(pk=to_account)
            amount = Decimal(amount)
            result = from_account.transfer_to(target_account, amount)

            if result == 'pending':
                return Response({'status': 'pending - sopra i 1000€'})
            return Response({'status': 'transfer completed'})
        
        except Account.DoesNotExist:
            return Response({'error': 'Account destinatario non trovato'}, status=status.HTTP_404_NOT_FOUND)
        except (InvalidOperation, TypeError, ValidationError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
      
    @action(detail=True, methods=['get'])
    def pending_transactions(self, request, pk=None):       # per un account prende tutte le transizioni in attesa (PENDING)
        account = self.get_object()                         # prende l'account
        transactions = Transaction.objects.filter(
            from_account=account, status='PENDING'
        ).values('transactionID', 'amount', 'transaction_date', 'transaction_type', 'status')
        return Response(transactions)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    @action(detail=True, methods=['get'])
    def histogram(self, request, pk=None):
        return
    
    @action(detail=True, methods=['get'])
    def scatter(self, request, pk=None):
        return
    
    @action(detail=True, methods=['get'])
    def line(self, request, pk=None):
        return