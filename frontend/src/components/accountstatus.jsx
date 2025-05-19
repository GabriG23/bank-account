import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import API from '../API';
import AccountList from './accountlist';

function AccountStatus({ clientID }) {
  const [accountIDs, setAccountIDs] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchAccountIDs = async () => {
      try {
        const data = await API.getClientAccountIDs(clientID);
        setAccountIDs(data);
      } catch (error) {
        console.error("Errore nel recupero degli account ID", error);
      }
    };

    fetchAccountIDs();
  }, [clientID]);

  const handleSelect = async (accountID) => {
    setSelectedAccountID(accountID);
    setLoadingDetails(true);
    try {
      const [details] = await Promise.all([
        API.getAccountInfo(accountID),
        new Promise((resolve) => setTimeout(resolve, 500)), // Per UX: evita flash
      ]);
      setAccountDetails(details);
    } catch (error) {
      console.error("Errore nel recupero dei dettagli dell'account", error);
    }
    setLoadingDetails(false);
  };

  return (
    <Container fluid className="pt-5">
      <Row className="min-vh-75">
        {/* Lista conti - sinistra */}
        <Col md={4} className="p-4 border-end bg-light">
          <AccountList.AccountListAll
            tipo="Lista di tutti i conti"
            accounts={accountIDs}
            selectedAccountID={selectedAccountID}
            onSelect={handleSelect}
          />
        </Col>

        {/* Dettagli account - destra */}
        <Col md={8} className="p-5 d-flex flex-column justify-content-center align-items-center">
          <h4 className="text-center mb-4">Dettagli Account</h4>

          {loadingDetails ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" />
              <div>Caricamento...</div>
            </div>
          ) : accountDetails ? (
            <Card
              className="shadow-sm w-100"
              style={{
                maxWidth: '800px',
                backgroundColor: accountDetails.account_status === 'OPEN' ? '#d1e7dd' : '#f8d7da',
              }}
            >
              <Card.Body className="fs-5 text-center">
                <p><strong>IBAN:</strong> {accountDetails.iban}</p>
                <p><strong>Saldo:</strong> €{accountDetails.balance.toFixed(2)}</p>
                <p><strong>Data apertura:</strong> {new Date(accountDetails.opening_date).toLocaleDateString()}</p>
                <p><strong>Tipo:</strong> {accountDetails.account_type === 'DEBT' ? 'DEBITO' : 'CREDITO'}</p>
                <p><strong>Stato:</strong> {accountDetails.account_status === 'OPEN' ? 'APERTO' : 'CHIUSO'}</p>
              </Card.Body>
            </Card>
          ) : (
            <div className="text-muted text-center fs-5 mt-5">
              Seleziona un account per vedere i dettagli.
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default AccountStatus;
