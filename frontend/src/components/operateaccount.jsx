import { useState } from 'react';
import { Container, Row, Col, ListGroup, Card, Form, Button, Alert, Spinner} from 'react-bootstrap';
import API from '../API';

function OperateAccount(props) {    // clientID accountID client_status account_status
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [amount, setAmount] = useState('');
  const [targetAccount, setTargetAccount] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (props.account_status !== 'OPEN' && props.account_status !== null) {
    return (
      <>
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Il Conto è chiuso</Card.Title>
            <Card.Text>
                Non puoi effettuare operazioni su un account<br />con stato <strong>{props.account_status}</strong>.
            </Card.Text>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (props.account_status === null) {
    return (
      <>
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Selezionare un Conto</Card.Title>
            <Card.Text>
                Altrimenti non puoi visualizzare lo stato del conto o effettuare operazioni..
            </Card.Text>
          </Card.Body>
        </Card>
      </>
    );
  }

  const handleSubmit = async () => {
    setError('');
    setSuccessMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Inserisci un importo valido e positivo.");
      return;
    }

    if (selectedTransaction === 'TRANSFER' && !targetAccount) {
      setError("Inserisci un account di destinazione valido.");
      return;
    }

    try {
      if (selectedTransaction === 'DEPOSIT') {
        await API.depositToAccount(props.accountID, parsedAmount);
      } else if (selectedTransaction === 'WITHDRAW') {
        await API.withdrawFromAccount(props.accountID, parsedAmount);
      } else if (selectedTransaction === 'TRANSFER') {
        await API.transferToAccount(props.accountID, targetAccount, parsedAmount);
      }
      setSuccessMsg("Operazione eseguita con successo.");
      setAmount('');
      setTargetAccount('');
    } catch (err) {
      setError("Errore durante l'operazione.");
    }
  };

const operationLabels = {
  DEPOSIT: 'DEPOSITO',
  WITHDRAW: 'PRELIEVO',
  TRANSFER: 'BONIFICO',
};

  return (
    <>
    <Container fluid className="mt-5 pt-4">
    <Row>
        <Col md={4} className="border-end">
          <h5>Operazioni disponibili</h5>
          <ListGroup>
            {['DEPOSIT', 'WITHDRAW', 'TRANSFER'].map((op) => (
            <ListGroup.Item
                key={op}
                action
                active={selectedTransaction === op}
                onClick={() => {
                setSelectedTransaction(op);
                setAmount('');
                setTargetAccount('');
                setError('');
                setSuccessMsg('');
                }}
            >
                {operationLabels[op]}
            </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col md={8}>
          {selectedTransaction && (
            <Card>
              <Card.Body>
            <Card.Title>{operationLabels[selectedTransaction]}</Card.Title>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Importo</Form.Label>
                    <Form.Control
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Inserisci importo"
                    />
                  </Form.Group>

                  {selectedTransaction === 'TRANSFER' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Account destinatario</Form.Label>
                      <Form.Control
                        type="text"
                        value={targetAccount}
                        onChange={(e) => setTargetAccount(e.target.value)}
                        placeholder="ID account destinatario"
                      />
                    </Form.Group>
                  )}

                  {error && <Alert variant="danger">{error}</Alert>}
                  {successMsg && <Alert variant="success">{successMsg}</Alert>}

                  <Button onClick={handleSubmit}>Conferma</Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

    </Container>

    <Container>
        <DataAnalysis clientID={props.clientID} accountID={selectedAccountID}/>
    </Container>
    </>
  );
}

export default OperateAccount;