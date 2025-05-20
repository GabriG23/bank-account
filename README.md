# Conti Bancari

## Descrizione del Progetto

Il progetto ha lo scopo di gestire gli account bancari dei clienti attraverso una piattaforma web integrata con **Django REST Framework** (backend) e **React** (frontend). I clienti possono effettuare operazioni come:

- Depositi
- Prelievi
- Bonifici ad altri account/clienti

Ogni conto può essere attivo o chiuso, e supporta due tipologie principali: **conto corrente (debito)** e **conto di credito (credito)**. Le transazioni sono tracciate per ogni cliente e conto, con vincoli di coerenza e sicurezza.

---

## Architettura del Progetto

### Backend - Django REST Framework

backend/  
├── api/  
│ ├── models.py # Definizione delle entità Client, Account e Transaction  
│ ├── views.py # ViewSet con logica di business per ogni modello  
│ ├── serializers.py # Serializzazione dei dati per le API  
│ ├── urls.py # Routing interno delle API  
│ └── admin.py # Registrazione dei modelli per il pannello admin  
└── backend/  
├── settings.py # Configurazione del progetto Django  
└── urls.py # Collegamento alle API  

### Frontend - React

frontend/  
├── App.jsx # Componente principale React  
├── App.css # Stile globale  
├── API.jsx # Interfaccia verso il backend  
├── main.jsx # Entry point dell’app  
├── Components/  
│ └── accountlist.jsx # visualizzazione degli account aperti/chiusi  
│ └── accountstatus.jsx # visualizzazione dello stato degli account  
│ └── dashboard.jsx # analisi grafica delle transazioni  
│ └── homepage.jsx # Home e visualizzazione dati  
│ └── layout.jsx # header e footer dell'app  
│ └── operation.jsx # operazioni da poter effettuare  
│ └── transaction.jsx # tabella con le transizioni per conto  

---

## Entità e Attributi

### Client
- `clientID` (PK)
- `name`, `surname`, `username`, `email`
- `registration_date`, `birthdate`
- `phone`, `address`
- `client_status`: `OPEN`, `CLOSED`

### Account
- `accountID` (PK)
- `clientID` (FK → Client)
- `balance`, `iban`, `opening_date`
- `account_type`: `DEBT`, `CREDIT`
- `account_status`: `OPEN`, `CLOSED`

### Transaction
- `transactionID` (PK)
- `from_account` (FK → Account)
- `to_account` (FK → Account)
- `clientID` (FK → Client)
- `amount`, `transaction_date`
- `transaction_type`: `DEPOSIT`, `WITHDRAW`, `TRANSFER`
- `transaction_status`: `COMPLETED`, `FAILED`

---

## Relazioni

- **Client → Account**: 1 → N
- **Client → Transaction**: 1 → N
- **Account → Transaction**: M → M

---

## Vincoli e Regole

### `ClientStatus`
- `OPEN`: può effettuare operazioni
- `CLOSED`: bloccato

### `AccountStatus`
- `OPEN`: può ricevere/inviare denaro
- `CLOSED`: disabilitato

### `AccountType`
- `DEBT`: saldo può andare in negativo entro un limite
- `CREDIT`: saldo non può essere negativo

### `TransactionType`
- `DEPOSIT`: verso il proprio conto
- `WITHDRAW`: prelievo dal proprio conto
- `TRANSFER`: solo verso conti aperti di clienti attivi

### `TransactionStatus`
- `COMPLETED`: operazione avvenuta con successo
- `FAILED`: operazione fallita


---

## Funzionalità Principali (Views)

### ClientViewSet
- `/info/`: Informazioni del cliente
- `/status/`: Stato attuale
- `/username/`: Visualizzazione frontend
- `/accounts/`: Lista conti associati
- `/active_accounts/`: Solo conti attivi

### AccountViewSet
- `/info/`: Dati del conto
- `/deposit/`: Deposita importo
- `/withdraw/`: Preleva importo
- `/transfer/`: Bonifico a altro conto

### TransactionViewSet
- `/by-client-account/`: Filtra per cliente e conto
- `/histogram/`: Istogramma importi transazioni
- `/lineplot/`: Andamento temporale
- `/scatterplot/`: Importo per tipo transazione

---

## Analisi Dati & Grafici

Il backend genera 3 grafici dinamici con **Matplotlib** e **Seaborn**, passati direttamente al frontend:

1. **Istogramma**: distribuzione degli importi delle transazioni (`/histogram`)
2. **Line Plot**: andamento temporale delle transazioni (`/lineplot`)
3. **Scatter Plot**: importi per tipo di operazione (`/scatterplot`)

---

## Test & Validazioni

- Tutte le operazioni gestiscono errori con codice di stato HTTP e messaggi dettagliati.
- Bonifici non consentiti su IBAN errati, conti chiusi o appartenenti allo stesso cliente.
