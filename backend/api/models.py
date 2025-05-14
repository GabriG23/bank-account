# Create your models here.
from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal

# link models.Model:    https://docs.djangoproject.com/en/5.1/topics/db/models/
# link abstract class: https://docs.djangoproject.com/en/5.2/topics/db/models/#abstract-base-classes
# link password in django: https://docs.djangoproject.com/en/5.2/topics/auth/passwords/#:~:text=This%20document%20describes%20how%20Django%20stores%20passwords%2C%20how,might%20be%20able%20to%20eavesdrop%20on%20their%20connections.
# differenza charfield e textfield: https://stackoverflow.com/questions/7354588/whats-the-difference-between-charfield-and-textfield-in-django
# abstractuser vs abstractbaseuser: https://stackoverflow.com/questions/21514354/abstractuser-vs-abstractbaseuser-in-django
# basemanager per le autenticazioni: https://docs.djangoproject.com/en/5.1/topics/auth/customizing/
# come modificare le istanze: https://docs.djangoproject.com/en/5.2/ref/models/instances/
# exception in Django: https://docs.djangoproject.com/en/5.1/ref/exceptions/
# Decimal field: https://www.geeksforgeeks.org/decimalfield-django-models/

def create_transaction(from_account, to_account, client, amount, ttype, tstatus):
    return Transaction.objects.create(
        from_account=from_account,
        to_account=to_account,
        clientID=client,
        amount=amount,
        transaction_type=ttype,
        transaction_status=tstatus,
        )

class Client(models.Model):               # clienti delle banca
    clientID = models.BigAutoField(primary_key=True)     # client_ID: viene creato in automatico dalla tabella
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    registration_date = models.DateField(auto_now_add=True)
    client_status = models.CharField(max_length=50, choices=[('ACTIVE', 'Active'),
                                                             ('SUSPENDED', 'Suspended'),
                                                             ('CLOSED', 'Closed')])
    birthdate = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Client {self.username} ({self.name} {self.surname})"
    

class Account(models.Model):        # account del cliente
    accountID = models.BigAutoField(primary_key=True)
    clientID = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='accounts')    # on_delete=models.CASCADE: se l'oggetto è eliminato, cancellerà tutti gli oggetti connessi
    balance = models.DecimalField(max_digits=12, decimal_places=2)                             # related_name: usato per specificare il tipo di relazione con la tabella
    opening_date = models.DateField(auto_now_add=True)
    account_type = models.CharField(max_length=20, choices=[('DEBT', 'Debt'), 
                                                            ('CREDIT', 'Credit')])
    account_status = models.CharField(max_length=50, choices=[('OPEN', 'Open'), 
                                                              ('CLOSED', 'Closed'), 
                                                              ('FREEZE', 'Freeze')])

    def __str__(self):
        return f"Account {self.accountID} ({self.account_type}) ({self.account_status})"
    
    def deposit(self, amount):      # non ho limiti su quanto depositare
        if amount <= 0:
            raise ValidationError("L'importo del deposito deve essere positivo")
        self.balance += Decimal(amount)     # converto nel campo Decimal
        self.save()     # devo salvare sempre il DB quando faccio una modifica
                        # è comune salvare nel modello, ma posso farlo anche nelle view
    
    def withdraw(self, amount):     # sul prelievo ho diversi limiti
        if amount <= 0:
            raise ValidationError("L'importo del prelievo deve essere positivo")
        
        amount = Decimal(amount)

        if self.account_status != 'OPEN':
            raise ValidationError("L'account non è attivo per transizioni.")

        if self.account_type == 'CREDIT':
            if amount > 500:
                raise ValidationError("I conti di tipo 'Credit' non permettono prelievi oltre i 500€.")
            if self.balance - amount < 0:
                raise ValidationError("I conti di tipo 'Credit' non posso avere saldo negativo.")
        elif self.account_type == 'DEBT':
            debt_limit = Decimal('-1000')
            if self.balance - amount < debt_limit:
                raise ValidationError("Limite di debito superato (massimo - 1000€).")
        else:
            raise ValidationError("Tipo di conto non supportato.")
        
        self.balance -= amount
        self.save()
    
    def transfer_to(self, target_account, amount):
        if amount <= 0:
            raise ValidationError("L'importo del bonifico deve essere positivo.")
        if self.accountID == target_account:
            raise ValidationError("Non puoi trasferire fondi allo stesso account.")

        amount = Decimal(amount)
        if amount > 1000:    # Bonifico "pending" se > 1000€
            create_transaction(self, target_account, self.clientID, amount, 'TRANSFER', 'PENDING')
            
            return 'pending'

        self.withdraw(amount)           # Esegui bonifico se sotto soglia
        target_account.deposit(amount)
        create_transaction(self, target_account, self.clientID, amount, 'TRANSFER', 'COMPLETED')
        return 'completed'

class Transaction(models.Model):    # Transazione fatte dal cliente
    transactionID = models.BigAutoField(primary_key=True)
    from_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='outgoing_operations', null=True, blank=True)
    to_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='incoming_operations', null=True, blank=True)
    clientID = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='transactions')

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateTimeField(auto_now_add=True)
    transaction_type = models.CharField(max_length=20, choices=[('DEPOSIT', 'Deposit'),
                                                              ('WITHDRAW', 'Withdraw'),
                                                              ('TRANSFER', 'Transfer')])
    transaction_status = models.CharField(max_length=50, choices=[
        ('COMPLETED', 'Completed'),
        ('PENDING', 'Pending'),
        ('FAILED', 'Failed')
    ])

    def __str__(self):
        return f"Transaction {self.transactionID} ({self.transaction_type})"