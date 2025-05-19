import { useState, useEffect } from 'react';
import { Container, ListGroup, Card, Spinner } from 'react-bootstrap';
import API from '../API';

function AccountListOpen({ clientID, openAccounts, setOpenAccounts, selectedAccountID, onSelect }) {
  const [loadingAccounts, setLoadingAccounts] = useState(true);

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

  if (loadingAccounts) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" />
        <div>Caricamento in corso...</div>
      </div>
    );
  }

  if (!openAccounts || openAccounts.length === 0) {
    return <NoActiveAccounts />;
  }

  return (
    <ActiveAccountList
      accounts={openAccounts}
      selectedAccountID={selectedAccountID}
      onSelect={onSelect}
    />
  );
}

function ActiveAccountList({ accounts, selectedAccountID, onSelect }) {
  return (
    <>
      <h5 className="text-center mb-3">Conti Attivi</h5>
      <ListGroup variant="flush">
        {accounts.map((account, index) => (
          <ListGroup.Item
            key={account.accountID}
            action
            active={selectedAccountID === account.accountID}
            onClick={() => onSelect(account.accountID)}
            className="text-center rounded shadow-sm mb-2"
          >
            Conto: #{index + 1}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}

function NoActiveAccounts() {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <Card className="text-center p-4">
        <Card.Body>
          <Card.Title>Non hai conti aperti</Card.Title>
          <Card.Text>
            Non hai conti correnti o carte di debito. <br />
            Per effettuare operazioni, apri un conto.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

// Secondo componente per stampare tutti gli account (non solo attivi)
function AccountListAll({ tipo, accounts, selectedAccountID, onSelect }) {
  return (
    <>
      <h5 className="text-center mb-3">{tipo}</h5>
      <ListGroup variant="flush">
        {accounts.map((account, index) => (
          <ListGroup.Item
            key={account.accountID}
            action
            active={selectedAccountID === account.accountID}
            onClick={() => onSelect(account.accountID)}
            className="text-center rounded shadow-sm mb-2"
          >
            Conto: #{index + 1}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}

const AccountList = { AccountListOpen, AccountListAll, NoActiveAccounts };

export default AccountList;