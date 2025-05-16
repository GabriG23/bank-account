import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Modal, Spinner } from 'react-bootstrap';
import API from '../API';
import AccountList from './accountlist'; // Usa quello che ti ho sistemato prima

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
    setSelectedTransaction(null); // resetta operazione
  };

  return (
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

        {/* COLONNA 2 e 3: Area operazioni e form */}
        <Col md={10} className="p-5 d-flex flex-column justify-content-center">
          {selectedAccountID ? (
            <OperationPanel
              selectedAccountID={selectedAccountID}
              selectedTransaction={selectedTransaction}
              setSelectedTransaction={setSelectedTransaction}
            />
          ) : (
            <div className="text-center text-muted mt-5">Seleziona un conto per iniziare</div>
          )}
        </Col>
      </Row>
    </Container>
    </>
  );
}

function OperationPanel({ selectedAccountID, selectedTransaction, setSelectedTransaction }) {
  const [amount, setAmount] = useState('');
  // const [targetAccount, setTargetAccount] = useState('');
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

  const handleSubmit = async () => {
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
    setShowModal(true); // mostra popup di conferma
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
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); // 🟢 Mostra errore dettagliato
      } else {
        setError("Errore durante l'operazione.");
      }
    } finally {
      setShowModal(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Colonna: Operazioni */}
        <Col md={3} className="border-end">
          <h6>Operazioni disponibili</h6>
          <ListGroup>
            {['DEPOSIT', 'WITHDRAW', 'TRANSFER'].map((op) => (
              <ListGroup.Item
                key={op}
                action
                active={selectedTransaction === op}
                onClick={() => {
                  setSelectedTransaction(op);
                  setAmount('');
                  setIban('');
                  setError('');
                  setSuccessMsg('');
                }}
              >
                {operationLabels[op]}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Colonna: Form operazione */}
        <Col md={9}>
          {selectedTransaction ? (
            <Card className="p-4 shadow-sm">
              <Card.Title>{operationLabels[selectedTransaction]} su conto #{selectedAccountID} </Card.Title>
              <Card.Text>

                {accountDetails && (
                    <>
                      <strong>IBAN:</strong> {accountDetails.iban}<br />
                      <strong>Saldo attuale:</strong> €{accountDetails.balance.toFixed(2)}
                    </>
                  )}
                {/* <strong>IBAN:</strong> {accountDetails.iban}<br />
                <strong>Saldo attuale:</strong> €{accountDetails.balance.toFixed(2)} */}
              </Card.Text>
              
              <Form className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Inserisci l'importo</Form.Label>
                  <Form.Control
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Importo"
                  />
                </Form.Group>

                {selectedTransaction === 'TRANSFER' && (
                  <Form.Group className="mb-3">
                    <Form.Label>IBAN del destinatario</Form.Label>
                    <Form.Control
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="IBAN"
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
          
        
        
        
        ) : (
            <div className="text-center mt-5 text-muted">
              Seleziona un'operazione per continuare.
            </div>
          )}
        </Col>
      </Row>


      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
         <Modal.Header closeButton>
          <Modal.Title>Conferma operazione</Modal.Title>
         </Modal.Header>
           <Modal.Body>
             <p>Stai per eseguire <strong>{operationLabels[selectedTransaction]}</strong> di <strong>€{parseFloat(amount).toFixed(2)}</strong>.</p>
           {selectedTransaction === 'TRANSFER' && ( <p>Verso l'IBAN: <strong>{iban}</strong></p>
          )}
          <p>Sei sicuro di voler procedere?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
          <Button variant="success" onClick={handleOperation}>Conferma</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default OperateAccount;
