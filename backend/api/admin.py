# Register your models here.
from django.contrib import admin
from .models import Client, Account, Transaction
from import_export import resources
from import_export.admin import ImportExportModelAdmin

# link admin: https://docs.djangoproject.com/en/5.2/ref/contrib/admin/

class ClientResource(resources.ModelResource): # per importare i file csv
    class Meta:
        model = Client
        import_id_fields = ('clientID',)
        fields = ('clientID', 'name', 'surname', 'username', 'email', 'registration_date', 'client_status', 'birthdate', 'phone', 'address')

@admin.register(Client)
class ClientAdmin(ImportExportModelAdmin):
    resource_class = ClientResource

class AccountResource(resources.ModelResource):
    class Meta:
        model = Account
        import_id_fields = ('accountID',)
        fields = ('accountID', 'clientID', 'balance', 'opening_date', 'account_type', 'account_status')

@admin.register(Account)
class AccountAdmin(ImportExportModelAdmin):
    resource_class = AccountResource

class TransactionResource(resources.ModelResource):
    class Meta:
        model = Transaction
        import_id_fields = ('transactionID',)
        fields = ('transactionID', 'clientID', 'from_account', 'to_account', 'amount', 'transaction_type', 'transaction_status')

@admin.register(Transaction)
class TransactionAdmin(ImportExportModelAdmin):
    resource_class = TransactionResource