# 💰 Bank Account

## 📌 Descrizione del Progetto

Il progetto ha lo scopo di gestire gli account bancari dei clienti attraverso una piattaforma web integrata con **Django REST Framework** (backend) e **React** (frontend). I clienti possono effettuare operazioni come:

- Depositi
- Prelievi
- Bonifici ad altri account/clienti

Ogni conto può essere attivo o chiuso, e supporta due tipologie principali: **conto corrente (debito)** e **conto di credito (credito)**. Le transazioni sono tracciate per ogni cliente e conto, con vincoli di coerenza e sicurezza.

---

## 🧱 Architettura del Progetto

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
│ └── Homepage.jsx # Home e visualizzazione dati
└── Design/
└── Homepage.css # Stile per la homepage



---

## 📚 Entità e Attributi

### 🧍 Client
- `clientID` (PK)
- `name`, `surname`, `username`, `email`
- `registration_date`, `birthdate`
- `phone`, `address`
- `client_status`: `OPEN`, `CLOSED`

### 🏦 Account
- `accountID` (PK)
- `clientID` (FK → Client)
- `balance`, `iban`, `opening_date`
- `account_type`: `DEBT`, `CREDIT`
- `account_status`: `OPEN`, `CLOSED`, `FROZEN`

### 🔁 Transaction
- `transactionID` (PK)
- `from_account` (FK → Account)
- `to_account` (FK → Account)
- `clientID` (FK → Client)
- `amount`, `operation_date`, `operation_type`: `DEPOSIT`, `WITHDRAW`, `TRANSFER`

---

## 🔗 Relazioni

- **Client → Account**: 1 → N
- **Client → Transaction**: 1 → N
- **Account → Transaction**: M → M

---

## ✅ Vincoli e Regole

### `ClientStatus`
- `OPEN`: può effettuare operazioni
- `CLOSED`: bloccato

### `AccountStatus`
- `OPEN`: può ricevere/inviare denaro
- `CLOSED` / `FROZEN`: disabilitato

### `AccountType`
- `DEBT`: saldo può andare in negativo entro un limite
- `CREDIT`: saldo non può essere negativo

### `TransactionType`
- `DEPOSIT`: verso il proprio conto
- `WITHDRAW`: prelievo dal proprio conto
- `TRANSFER`: solo verso conti aperti di clienti attivi

---

## ⚙️ Funzionalità Principali (Views)

### 🔹 ClientViewSet
- `/info/`: Informazioni del cliente
- `/status/`: Stato attuale
- `/username/`: Visualizzazione frontend
- `/accounts/`: Lista conti associati
- `/active_accounts/`: Solo conti attivi

### 🔹 AccountViewSet
- `/info/`: Dati del conto
- `/deposit/`: Deposita importo
- `/withdraw/`: Preleva importo
- `/transfer/`: Bonifico a altro conto

### 🔹 TransactionViewSet
- `/by-client-account/`: Filtra per cliente e conto
- `/histogram/`: Istogramma importi transazioni
- `/lineplot/`: Andamento temporale
- `/scatterplot/`: Importo per tipo transazione

---

## 📊 Analisi Dati & Grafici

Il backend genera 3 grafici dinamici con **Matplotlib** e **Seaborn**, passati direttamente al frontend:

1. 📈 **Istogramma**: distribuzione degli importi delle transazioni (`/histogram`)
2. 📉 **Line Plot**: andamento temporale delle transazioni (`/lineplot`)
3. 🟢 **Scatter Plot**: importi per tipo di operazione (`/scatterplot`)

---

## 🧪 Test & Validazioni

- Tutte le operazioni gestiscono errori con codice di stato HTTP e messaggi dettagliati.
- Bonifici non consentiti su IBAN errati, conti chiusi o appartenenti allo stesso cliente.

---

## 🔗 Link Utili

### 🛠 Django
- [Admin Panel](https://docs.djangoproject.com/en/5.2/ref/contrib/admin/)
- [Models](https://docs.djangoproject.com/en/5.1/topics/db/models/)
- [Serializers](https://www.django-rest-framework.org/api-guide/serializers/)
- [ViewSets](https://www.django-rest-framework.org/api-guide/viewsets/)
- [Query API](https://docs.djangoproject.com/en/5.2/topics/db/queries/)

### 🔒 Sicurezza
- [Gestione Password](https://docs.djangoproject.com/en/5.2/topics/auth/passwords/)

### 📊 Visualizzazioni
- [Seaborn Docs](https://seaborn.pydata.org/)
- [React Plot Integration](https://stackoverflow.com/questions/72303450/how-would-i-render-data-from-a-django-model-with-a-react-frontend)

---

## 📌 Tutorial di riferimento

> **Django + React tutorial:** [CRUD App with Axios & Rest Framework – BezKoder](https://www.bezkoder.com/django-react-crud/)

---

## 📎 Note Finali

- Tutti i modelli, viste e serializzatori seguono una struttura modulare.
- È possibile estendere la piattaforma con autenticazione avanzata, gestione carte, limiti personalizzati o reportistica mensile.
