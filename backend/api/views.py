from rest_framework import viewsets
# from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Client, Account, Transaction, create_transaction
from .serializers import ClientSerializer, AccountSerializer, TransactionSerializer
from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError
import matplotlib
matplotlib.use('Agg')  # usa backend "Agg" per generare PNG senza GUI
                       # mi dava un errore quando passavo l'immagine al frontend
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import pandas as pd
from django.http import HttpResponse
from django.db.models import Q
from matplotlib.dates import DateFormatter

# link viewset: https://www.django-rest-framework.org/api-guide/viewsets/
# link apiview: https://www.django-rest-framework.org/api-guide/generic-views/
# link autenticazione (password): https://docs.djangoproject.com/it/4.0//topics/auth/
# link status code: https://www.django-rest-framework.org/api-guide/status-codes/ (codici classici, 200, 404...)
# link come effettuare un logout: https://docs.djangoproject.com/en/3.2/topics/auth/default/#how-to-log-a-user-out
# link react-django plot: https://stackoverflow.com/questions/72303450/how-would-i-render-data-from-a-django-model-with-a-react-frontend
# link seaborn https://seaborn.pydata.org/
# link query https://docs.djangoproject.com/en/5.2/topics/db/queries/

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
    
    @action(detail=True, methods=['get'])
    def active_accounts(self, request, pk=None):
        client = self.get_object()
        active_accounts = client.accounts.filter(account_status='OPEN').values('accountID')
        return Response(active_accounts)
            
    
class AccountViewSet(viewsets.ModelViewSet):    # view del Client
    queryset = Account.objects.all()            # prendo tutti gli oggetti
    serializer_class = AccountSerializer        # prendo la classe serializer

    @action(detail=True, methods=['get'])
    def info(self, request, pk=None):               # dato un account mi ritorna le informazioni su di esso
        account = self.get_object()                 # prendo l'account, ricordiamo che l'id lo da in automatico
        data = {'iban': account.iban,
                'balance': account.balance,
                'opening_date': account.opening_date,
                'account_type': account.account_type,
                'account_status': account.account_status}
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def deposit(self, request, pk=None):
        account = self.get_object()
        client = account.clientID
        amount_raw = request.data.get("amount")

        try:
            amount = Decimal(amount_raw)
        except (InvalidOperation, TypeError):
            create_transaction(None, account, client, Decimal(0), 'DEPOSIT', 'FAILED')
            return Response({'error': 'Importo non valido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            account.deposit(amount)
            create_transaction(None, account, client, amount, 'DEPOSIT', 'COMPLETED')
            return Response({'status': 'deposit successful', 'new_balance': account.balance})
        except ValidationError as e:
            create_transaction(None, account, client, amount, 'DEPOSIT', 'FAILED')
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        account = self.get_object()
        client = account.clientID
        amount_raw = request.data.get("amount")

        try:
            amount = Decimal(amount_raw)
        except (InvalidOperation, TypeError):
            create_transaction(account, None, client, Decimal(0), 'WITHDRAW', 'FAILED')
            return Response({'error': 'Importo non valido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            account.withdraw(amount)
            create_transaction(account, None, client, amount, 'WITHDRAW', 'COMPLETED')
            return Response({'status': 'withdraw successful', 'new_balance': account.balance})
        except ValidationError as e:
            create_transaction(account, None, client, amount, 'WITHDRAW', 'FAILED')
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    
    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        from_account = self.get_object()    # L'account sorgente (quello nella URL)
        iban = request.data.get("iban")     # IBAN del destinatario
        amount = request.data.get("amount") # prende l'amount

        if not iban or not amount:      # controlla se sono stati inviati
            return Response({'error': 'IBAN e importo sono obbligatori'}, status=400)

        try:
            amount = Decimal(amount)    # converte in decimal
            if amount <= 0: # controllo dell'importo positivo
                raise InvalidOperation("L'importo deve essere positivo.")
        except (InvalidOperation, TypeError):
            return Response({'error': 'Importo non valido'}, status=400)

        if iban == from_account.iban:   # evitiamo di farci degli auto bonifici
            return Response({'error': 'Non puoi trasferire fondi allo stesso IBAN.'}, status=400)

        try:    # cerco il conto destinatario usando l'iban (univoco)
            target_account = Account.objects.get(iban=iban)
        except Account.DoesNotExist:
            return Response({'error': 'IBAN destinatario non trovato.'}, status=404)

        if target_account.account_status != 'OPEN':     #
            return Response({'error': 'Il conto destinatario è chiuso.'}, status=400)

        # Esegui la transazione
        try:
            from_account.transfer_to(target_account, amount)
            return Response({
                'status': 'transfer completed',
                'new_balance': from_account.balance
            }, status=200)
        except (ValidationError, Exception) as e:
            # Transazione fallita → registra comunque
            create_transaction(from_account, target_account, from_account.clientID, amount, 'TRANSFER', 'FAILED')
            return Response({'error': str(e)}, status=400)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    @action(detail=False, methods=['get'], url_path='by-client-account')
    def by_client_account(self, request):
        client_id = request.query_params.get('clientID')        # prende il clientID dalla request
        account_id = request.query_params.get('accountID')      # prende l'accountID dalla request

        if not client_id or not account_id: # controlla se sono stati inviati
            return Response({'error': 'clientID e accountID sono obbligatori'}, status=status.HTTP_400_BAD_REQUEST)

        transactions = Transaction.objects.filter(      # Filtra le transazioni dove l'account è presente come mittente o destinatario
            Q(from_account__accountID=account_id) | Q(to_account__accountID=account_id),
            clientID__clientID=client_id    # Usa clientID__clientID correttamente (doppio underscore perché è foreign key).
        )
        # Q(...) | Q(...) usa l'oggetto Q per permettere filtri complessi con operatori logici. Qui si richiedono le transizioni in cui l'account è coinvolto come mittente o destinatario

        if not transactions.exists():   # se la transizioni non esiste ritorna errore
            return Response({'message': 'Nessuna transazione trovata per questo account e client.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(transactions, many=True)   # crea il serializer
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def histogram(self, request, pk=None):
        transactions = Transaction.objects.filter(clientID=pk)  # prendo tutte le transizioni con la chiave primaria del cliente
        if not transactions.exists():           # controlla se esiste
            return Response({"error": "No transactions found for this client."}, status=404)

        df = pd.DataFrame(list(transactions.values('amount'))) # converto i file in un dataframe con pandas

        plt.figure(figsize=(8, 5))          # creo il plot
        sns.histplot(data=df, x='amount', bins=10, kde=True)
        plt.title('Transizioni degli importi del cliente sull\'account selezionato')
        plt.xlabel('Importo della transazione (€)')
        plt.ylabel('Frequenza')
        plt.tight_layout()

        buffer = BytesIO()                  # lo salvo su di un buffer
        plt.savefig(buffer, format='png')
        plt.close()
        buffer.seek(0)                      # posizione di partenza 0 (inizio dello stream)

        return HttpResponse(buffer.getvalue(), content_type='image/png')
    
    @action(detail=True, methods=['get'])
    def lineplot(self, request, pk=None):
        transactions = Transaction.objects.filter(clientID=pk).order_by('transaction_date')          # prende le transizioni per quel cliente, ordinandole per data
        if not transactions.exists():   # controlla se il cliente ha delle transizioni disponibili
            return Response({"error": "No transactions found for this client."}, status=404)

        df = pd.DataFrame(list(transactions.values('transaction_date', 'amount')))  # crea un dataframe dalla lista di valori (prende solo la data e l'amount)
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])

        plt.figure(figsize=(10, 5))
        sns.lineplot(data=df, x='transaction_date', y='amount', marker='o')
        plt.title('Andamento degli importi nel tempo')
        plt.xlabel('Data')
        plt.ylabel('Importo (€)')
        plt.xticks(rotation=45)
        plt.tight_layout()

        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        plt.close()
        buffer.seek(0)

        return HttpResponse(buffer.getvalue(), content_type='image/png')

    @action(detail=True, methods=['get'])
    def scatterplot(self, request, pk=None):
        transactions = Transaction.objects.filter(clientID=pk)          # prende le transizioni per quel cliente
        if not transactions.exists():   # controlla se il cliente ha delle transizioni disponibili
            return Response({"error": "No transactions found for this client."}, status=404)

        df = pd.DataFrame(list(transactions.values('transaction_date', 'amount', 'transaction_type')))  # usa pandas per convertire le transizioni da una lista di valori per data, amount e tipo
        df['transaction_date'] = pd.to_datetime(df['transaction_date']) # il database è 2 ore indietro, 

        plt.figure(figsize=(10, 5)) # dimensione della figure
        sns.scatterplot(data=df, x='transaction_date', y='amount', hue='transaction_type')  # punti dello scatter plot
        plt.title('Transazioni nel tempo')  # titolo
        plt.xlabel('Data')                  # label di x
        plt.ylabel('Importo (€)')           # label di y
        plt.xticks(rotation=45)             # numero di ticks sull'asse x
        plt.tight_layout()                  # stringe il layout

        buffer = BytesIO()                  # carica tutto su memoria
        plt.savefig(buffer, format='png')   # salva la figura
        plt.close()                         # la chiude
        buffer.seek(0)                      # decide la posizione di partenza dello stream di dati

        return HttpResponse(buffer.getvalue(), content_type='image/png')    # ritorna la figura
        # per adesso abbiamo fatto che ritorniamo direttamente l'immagine, si possono tornare anche solo i dati e far plottare al client