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

const getClientStatus= async (clientId) => {         // prendo lo stato del cliente per visualizzarlo
    const res = await axios.get(`${API_BASE_URL}/clients/${clientId}/status/`);
    return res.data;
};

const getClientAccountIDs = async (clientId) => {       // prendo tutti gli account del cliente
  const res = await axios.get(`${API_BASE_URL}/clients/${clientId}/accounts/`);
  return res.data;
};

/* Account API */

const getAccountInfo = async (accountId) => {
    const res = await axios.get(`${API_BASE_URL}/accounts/${accountId}/info/`);
    return res.data;
};

const depositToAccount = async (accountId, amount) => {
    const res = await axios.post(`${API_BASE_URL}/accounts/${accountId}/deposit/`, { amount });
    return res.data;
};

const withdrawFromAccount = async (accountId, amount) => {
    const res = await axios.post(`${API_BASE_URL}/accounts/${accountId}/withdraw/`, { amount });
    return res.data;
};

const transferToAccount = async (fromAccountId, toAccountId, amount) => {
    const res = await axios.post(`${API_BASE_URL}/accounts/${fromAccountId}/transfer/`, {
        to_account: toAccountId,
        amount,
    });
    return res.data;
};

const getPendingTransactions = async (accountId) => {       // non usata ancora
    const res = await axios.get(`${API_BASE_URL}/accounts/${accountId}/pending_transactions/`);
    return res.data;
};

/* Transactions API */

const getAllTransactions = async () => {
    const res = await axios.get(`${API_BASE_URL}/transactions/`);
    return res.data;
};

const getTransaction = async (transactionId) => {
    const res = await axios.get(`${API_BASE_URL}/transactions/${transactionId}/`);
    return res.data;
};

const API = {getClient, getClientUsername, getClientStatus, getClientAccountIDs, getAccountInfo, depositToAccount, withdrawFromAccount, transferToAccount, getPendingTransactions, getAllTransactions, getTransaction};
export default API;