import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Modal} from 'react-bootstrap';
import API from '../API';
import AccountList from './accountlist';

const operationLabels = {
  DEPOSIT: 'DEPOSITO',
  WITHDRAW: 'PRELIEVO',
  TRANSFER: 'BONIFICO',
};

function OperateAccount({ clientID }) {
  const [openAccounts, setOpenAccounts] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleSelectAccount = (accountID) => {
    setSelectedAccountID(accountID);
    setSelectedTransaction(null);
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
{ !openAccounts || openAccounts.length === 0 ? <AccountList.NoActiveAccounts /> :
  

    <Container fluid className="pt-5">
      <Row className="min-vh-75">
        {/* 1/5 - Conti attivi */}
        <Col md={2} className="p-3 border-end bg-light">
          <AccountList.AccountListOpen
            clientID={clientID}
            openAccounts={openAccounts}
            setOpenAccounts={setOpenAccounts}
            selectedAccountID={selectedAccountID}
            onSelect={handleSelectAccount}
          />
        </Col>

    {/* 1/5 - Bottoni operazioni */}
    <Col md={2} className="p-4 border-end bg-white">
      {selectedAccountID ? (
        <>
          <h6 className="mb-3">Operazioni disponibili</h6>
          <ListGroup>
            {['DEPOSIT', 'WITHDRAW', 'TRANSFER'].map((op) => (
              <ListGroup.Item
                key={op}
                action
                active={selectedTransaction === op}
                onClick={() => setSelectedTransaction(op)}
                style={{ cursor: 'pointer' }}
              >
                {operationLabels[op]}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      ) : (
        <div className="text-center text-muted fs-6 mt-5">
          Seleziona un conto per iniziare.
        </div>
      )}
    </Col>

        {/* 3/5 - Form operazione */}
        <Col md={8} className="p-5">
          {selectedAccountID ? (
            <OperationPanel
              selectedAccountID={selectedAccountID}
              selectedTransaction={selectedTransaction}
            />
          ) : (
            <div className="text-center text-muted fs-5 mt-5">
              Seleziona un conto per iniziare.
            </div>
          )}
        </Col>
      </Row>
    </Container>
          }
  </>
  );
}

function OperationPanel({ selectedAccountID, selectedTransaction }) {
  const [amount, setAmount] = useState('');
  const [iban, setIban] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    setAmount('');
    setIban('');
    setError('');
    setSuccessMsg('');
  }, [selectedTransaction]);

  const handleSubmit = () => {
    setError('');
    setSuccessMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Inserisci un importo valido e positivo.");
      return;
    }

    if (selectedTransaction === 'TRANSFER' && !iban) {
      setError("Inserisci un IBAN valido.");
      return;
    }

    setShowModal(true);
  };

  const handleOperation = async () => {
    const parsedAmount = parseFloat(amount);

    try {
      if (selectedTransaction === 'DEPOSIT') {
        await API.depositToAccount(selectedAccountID, parsedAmount);
      } else if (selectedTransaction === 'WITHDRAW') {
        await API.withdrawFromAccount(selectedAccountID, parsedAmount);
      } else if (selectedTransaction === 'TRANSFER') {
        await API.transferToAccount(selectedAccountID, iban, parsedAmount);
      }

      setSuccessMsg("Operazione eseguita con successo.");
      setAmount('');
      setIban('');
      await fetchDetails();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Errore durante l'operazione.");
      }
    } finally {
      setShowModal(false);
    }
  };

  if (!selectedTransaction) {
    return (
      <div className="text-center mt-5 text-muted fs-5">
        Seleziona un'operazione per continuare.
      </div>
    );
  }

  return (
    <>
      <Card className="p-4 shadow-sm">
        <Card.Title>
          {operationLabels[selectedTransaction]} sul conto selezionato
        </Card.Title>
        <Card.Text>
          {accountDetails && (
            <>
              <strong>IBAN:</strong> {accountDetails.iban}<br />
              <strong>Saldo attuale:</strong> €{accountDetails.balance.toFixed(2)}<br />
              <strong>Tipo di conto:</strong> {accountDetails.account_type === 'DEBT' ? 'DEBITO' : 'CREDITO'}<br />
              <strong>Info:</strong> {accountDetails.account_type === 'DEBT' ? 'Il conto può andare in negativo fino a -1000€, prelievi illimitati' : 'Il conto non può andare in negativo, prelievi limitati a 500€'}
            </>
          )}
        </Card.Text>

        <Form className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Importo</Form.Label>
            <Form.Control
              type="number"
              placeholder="Inserisci l'importo"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>

          {selectedTransaction === 'TRANSFER' && (
            <Form.Group className="mb-3">
              <Form.Label>IBAN destinatario</Form.Label>
              <Form.Control
                type="text"
                placeholder="IBAN"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
              />
            </Form.Group>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <Button variant="primary" onClick={handleSubmit}>
            Conferma
          </Button>
        </Form>
      </Card>

      {/* Modal conferma */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Conferma operazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Stai per eseguire <strong>{operationLabels[selectedTransaction]}</strong> di{' '}
            <strong>€{parseFloat(amount).toFixed(2)}</strong>.
          </p>
          {selectedTransaction === 'TRANSFER' && (
            <p>Verso l'IBAN: <strong>{iban}</strong></p>
          )}
          <p>Sei sicuro di voler procedere?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
          <Button variant="success" onClick={handleOperation}>Conferma</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OperateAccount;
