import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Modal, Spinner } from 'react-bootstrap';
import AccountList from './accountlist';
import API from '../API';

function Transaction({ clientID }) {
  const [openAccounts, setOpenAccounts] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);

  const fetchDetails = async () => {
    try {
      const data = await API.getAccountInfo(selectedAccountID);
      setAccountDetails(data);
    } catch (error) {
      console.error("Errore nel recupero dei dettagli dell'account", error);
    }
  };

  useEffect(() => {
    if (selectedAccountID) {
      fetchDetails();
    }
  }, [selectedAccountID]);

  const handleSelectAccount = (accountID) => {
    setSelectedAccountID(accountID);
    setAccountDetails(null);
  };

  useEffect(() => {
    const fetchActiveAccounts = async () => {
      try {
        const data = await API.getActiveClientAccountIDs(clientID);
        setOpenAccounts(data || []);
      } catch (error) {
        console.error("Errore nel recupero dei conti attivi:", error);
        setOpenAccounts([]);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchActiveAccounts();
  }, [clientID, setOpenAccounts]);


  return (
    <>
      {!openAccounts || openAccounts.length === 0 ? <AccountList.NoActiveAccounts /> :

        <Container fluid className="pt-5">
          <Row className="min-vh-75">
            {/* Colonna 1: Lista conti */}
            <Col md={2} className="p-3 border-end bg-light">
              <AccountList.AccountListOpen
                clientID={clientID}
                openAccounts={openAccounts}
                setOpenAccounts={setOpenAccounts}
                selectedAccountID={selectedAccountID}
                onSelect={handleSelectAccount}
              />
            </Col>

            {/* Colonna 2: Transazioni */}
            <Col md={10} className="p-5 justify-content-center">
              {selectedAccountID ? (
                <TransactionTable clientID={clientID} accountID={selectedAccountID} accountDetails={accountDetails} />
              ) : (
                <div className="text-center text-muted fs-5 mt-5">
                  Seleziona un conto per visualizzare le transazioni
                </div>
              )}
            </Col>
          </Row>
        </Container>
      }
    </>
  );
}

function TransactionTable({ clientID, accountID, accountDetails }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(20);

  // Reset filtro e visibilità su cambio conto
  useEffect(() => {
    setFilterType('ALL');
    setVisibleCount(20);
  }, [accountID]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const data = await API.getTransactionsByClientAndAccount(clientID, accountID);
        const sorted = data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
        setTransactions(sorted);
      } catch (error) {
        console.error("Errore nel recupero transazioni:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [clientID, accountID]);

  const formatAmount = (type, amount) => {
    const formatted = `${parseFloat(amount).toFixed(2)} €`;
    if (type === 'WITHDRAW') return <span className="text-danger">- {formatted}</span>;
    if (type === 'DEPOSIT') return <span className="text-success">+ {formatted}</span>;
    return <span className="text-warning">{formatted}</span>; // TRANSFER o altri
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-success">{status}</span>;
      case 'FAILED':
        return <span className="text-danger">{status}</span>;
      default:
        return <span className="text-secondary">{status}</span>;
    }
  };

  const filteredTransactions =
    filterType === 'ALL'
      ? transactions
      : transactions.filter((tx) => tx.transaction_type === filterType);

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTransactions.length;

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col md={6}>
          <h5>Transazioni conto</h5>

          {accountDetails && (
            <>
              <p className="text-muted">Conto selezionato: <strong>{accountDetails.iban}</strong></p>
            </>
          )}


        </Col>
        <Col md={6} className="d-flex justify-content-end align-items-center">
          <Form.Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setVisibleCount(20);
            }}
            style={{ maxWidth: '200px' }}
          >
            <option value="ALL">Tutti i tipi</option>
            <option value="DEPOSIT">Solo Depositi</option>
            <option value="WITHDRAW">Solo Prelievi</option>
            <option value="TRANSFER">Solo Bonifici</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Alert variant="info">Nessuna transazione trovata.</Alert>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover text-center">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Importo</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((tx, index) => (
                  <tr key={tx.transactionID}>
                    <td>{index + 1}</td>
                    <td>{new Date(tx.transaction_date).toLocaleString()}</td>
                    <td>{tx.transaction_type}</td>
                    <td>{formatAmount(tx.transaction_type, tx.amount)}</td>
                    <td>{getStatusBadge(tx.transaction_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="text-center mt-3">
              <Button variant="outline-primary" onClick={() => setVisibleCount((prev) => prev + 20)}>
                Mostra altre
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default Transaction;
