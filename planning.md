# Implementation
- creare classe con attributi
-

# Tasks
## React
- homepage iniziale
- sistemare login
- creare una private area
## Django
- depositare denaro nel conto
- prelevare denaro nel conto
- effettuare login con clienti diversi
- inviare denaro ad altri clienti: bonifico (immediato)
- ogni volta che faccio un'operazione la salvo nella tabella operazioni


# E-R
- Cliente -> Account 1 : N
- Cliente -> Operazioni 1 : N

# Tables
- Person (name, surname, birth_date, email, phone, address) # classe astratta
- Client: (clientID, registration_date, password_hash, username, account_status (active, suspendend, closed))
- Account: accountID (primary_key), clientID (foreign_key), state (open, closed, freeze), opening_date, balance, account_type (savings, checking, credit)
- Transaction: transactionID (primary_key), fromAccountID, toAccountID, clientID, operation_type (deposito, prelievo, bonifico), amount, operation_date, status (pending, completed, failed), description, operation_date

### Description
- Person: è la nostra classe primaria per gestire le diverse entità persone. Per adesso abbiamo solo i clienti, ma successivamente possiamo aggiungere i dipendenti
- Client: tabella del cliente con tutte le informazioni. Un cliente può avere più account


### Users/Passoword
-
- 

