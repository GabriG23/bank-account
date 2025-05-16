import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Modal, Spinner } from 'react-bootstrap';
import AccountList from './accountlist'; // Usa quello che ti ho sistemato prima
import API from '../API';

function Transaction({ clientID }) {
  const [openAccounts, setOpenAccounts] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState(null);

  const handleSelectAccount = (accountID) => {
    setSelectedAccountID(accountID);
  };

  return(
    <>
      <Container fluid className="pt-5">
      <Row>
        {/* COLONNA 1: Lista conti attivi */}
        <Col md={2} className="p-2 border-end bg-light">
          <AccountList.AccountListOpen
            clientID={clientID}
            openAccounts={openAccounts}
            setOpenAccounts={setOpenAccounts}
            selectedAccountID={selectedAccountID}
            onSelect={handleSelectAccount}
          />
        </Col>

      
        {/* 4/5 - Area operazioni + visualizzazione grafico */}
        <Col md={10} className="p-4 border-end bg-light">
          {selectedAccountID ? (
            <CreateTable
              clientID={clientID}
              accountID={selectedAccountID}
            />
          ) : (
            <div className="text-center text-muted mt-5">Seleziona un conto per iniziare</div>
          )}
        </Col>
      </Row>
    </Container>
    </>
  )
}

function CreateTable({ clientID, accountID }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(20);

  // Reset visibilità e filtro ogni volta che cambia accountID
  useEffect(() => {
    setVisibleCount(20);
    setFilterType('ALL');
  }, [accountID]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await API.getTransactionsByClientAndAccount(clientID, accountID);
        const sorted = data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
        setTransactions(sorted);
      } catch (error) {
        console.error("Errore durante il caricamento delle transazioni:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientID, accountID]);

  const formatAmount = (type, amount) => {
    const formatted = parseFloat(amount).toFixed(2) + ' €';
    if (type === 'WITHDRAW') return <span className="text-danger">- {formatted}</span>;
    if (type === 'DEPOSIT') return <span className="text-success">+ {formatted}</span>;
    return <span className="text-warning">{formatted}</span>;
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return <span className="text-success">{status}</span>;
    if (status === 'FAILED') return <span className="text-danger">{status}</span>;
    return status;
  };

  const filteredTransactions = filterType === 'ALL'
    ? transactions
    : transactions.filter(tx => tx.transaction_type === filterType);

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTransactions.length;

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col md={6}>
          <h5>Transazioni per conto selezionato</h5>
          <p className="text-muted">IBAN selezionato: <strong>{accountID}</strong></p>
        </Col>
        <Col md={6} className="d-flex justify-content-end align-items-center">
          <Form.Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setVisibleCount(20); // reset visibilità quando cambio filtro
            }}
            style={{ maxWidth: '200px' }}
          >
            <option value="ALL">Tutti i tipi</option>
            <option value="DEPOSIT">Solo Depositi</option>
            <option value="WITHDRAW">Solo Prelievi</option>
            <option value="TRANSFER">Solo Trasferimenti</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : filteredTransactions.length === 0 ? (
        <Alert variant="info">Nessuna transazione trovata per questo filtro.</Alert>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover text-center">
              <thead className="table-light">
                <tr>
                  <th className="text-center">#</th>
                  <th className="text-center">Data</th>
                  <th className="text-center">Tipo</th>
                  <th className="text-center">Importo</th>
                  <th className="text-center">Stato</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((tx, index) => (
                  <tr key={tx.transactionID}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{new Date(tx.transaction_date).toLocaleString()}</td>
                    <td className="text-center">{tx.transaction_type}</td>
                    <td className="text-center">{formatAmount(tx.transaction_type, tx.amount)}</td>
                    <td className="text-center">{getStatusColor(tx.transaction_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="text-center mt-3">
              <Button variant="outline-primary" onClick={() => setVisibleCount(prev => prev + 20)}>
                ... Mostra altre
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default Transaction;
