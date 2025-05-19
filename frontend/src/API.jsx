import axios from 'axios';

// link https://axios-http.com/docs/intro

const API_BASE_URL = 'http://localhost:8000/api'; // Cambia con l'URL del tuo backend

/* Client API */

const getClient = async (clientId) => {                 // prende l'ID del cliente, per adesso non mi serve
  const res = await axios.get(`${API_BASE_URL}/clients/${clientId}/`);
  return res.data;
};

const getClientUsername = async (clientId) => {         // prendo l'username del cliente per visualizzarlo
  const res = await axios.get(`${API_BASE_URL}/clients/${clientId}/username/`);
  return res.data;
};

const getClientStatus = async (clientId) => {         // prendo lo stato del cliente per visualizzarlo
  const res = await axios.get(`${API_BASE_URL}/clients/${clientId}/status/`);
  return res.data;
};

const getClientAccountIDs = async (clientId) => {       // prendo tutti gli account del cliente
  const res = await axios.get(`${API_BASE_URL}/clients/${clientId}/accounts/`);
  return res.data;
};

const getActiveClientAccountIDs = async (clientId) => { // prendo tutti gli account attivi
  const res = await axios.get(`${API_BASE_URL}/clients/${clientId}/active_accounts/`);
  return res.data;
};


/* Account API */

const getAccountInfo = async (accountId) => {          // informazioni dell'account da mostrare
  const res = await axios.get(`${API_BASE_URL}/accounts/${accountId}/info/`);
  return res.data;
};

const depositToAccount = async (accountId, amount) => {     // deposito denaro dentro l'account
  const res = await axios.post(`${API_BASE_URL}/accounts/${accountId}/deposit/`, { amount });
  return res.data;
};

const withdrawFromAccount = async (accountId, amount) => {  // prelievo dall'account
  const res = await axios.post(`${API_BASE_URL}/accounts/${accountId}/withdraw/`, { amount });
  return res.data;
};

const transferToAccount = async (fromAccountId, iban, amount) => {       // bonifico ad un'altro account
  const res = await axios.post(`${API_BASE_URL}/accounts/${fromAccountId}/transfer/`, {
    iban: iban,
    amount: amount,
  });
  return res.data;
};

/* Transactions API */

const getTransactionsByClientAndAccount = async (clientId, accountId) => {// Transaction API – Ottieni le transazioni di un account specifico per un client
  try {
    const res = await axios.get(`${API_BASE_URL}/transactions/by-client-account/`, {
      params: {
        clientID: clientId,
        accountID: accountId,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Errore nel recuperare le transazioni:", error);
    throw error;
  }
};

const getLinePlot = async (clientID) => {
  const res = await axios.get(`${API_BASE_URL}/transactions/${clientID}/lineplot/`, {
    responseType: 'blob'
  });
  return res.data;
};

const getScatterPlot = async (clientID) => {
  const res = await axios.get(`${API_BASE_URL}/transactions/${clientID}/scatterplot/`, {
    responseType: 'blob'
  });
  return res.data;
};


const getHistogram = async (clientID) => {          // per richiedere l'histogramma lato server
  const res = await axios.get(`${API_BASE_URL}/transactions/${clientID}/histogram/`,
    { responseType: 'blob' } // per ricevere immagine binaria, altrimenti è troppo pesante
  );
  return res.data;
}

const API = { getClient, getClientUsername, getClientStatus, getActiveClientAccountIDs, getClientAccountIDs, getAccountInfo, depositToAccount, withdrawFromAccount, transferToAccount, getTransactionsByClientAndAccount, getHistogram, getLinePlot, getScatterPlot };
export default API;