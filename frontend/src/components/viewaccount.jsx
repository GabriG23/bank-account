import { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Card, Spinner } from 'react-bootstrap';
import API from '../API';
import '../App.css';
import OperateAccount from './operateaccount';
// import OperateAccount from './operateaccount';

function ViewAccount(props) { // props: clientID client_status 
  const [accountIDs, setAccountIDs] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);

  useEffect(() => {
    const fetchAccountIDs = async () => {
      try {
        const data = await API.getClientAccountIDs(props.clientID);
        setAccountIDs(data);
      } catch (error) {
        console.error("Errore nel recupero degli account ID", error);
      }
    };

    fetchAccountIDs();
  }, [props.clientID]);

  const handleSelect = async (accountID) => {
    setSelectedAccountID(accountID);
    setLoadingDetails(true);
    try {
      const [details] = await Promise.all([
        API.getAccountInfo(accountID),
        new Promise((resolve) => setTimeout(resolve, 500)), // minimo 500ms di attesa
      ]);
      setAccountStatus(details.account_status)
      setAccountDetails(details);
    } catch (error) {
      console.error("Errore nel recupero dei dettagli dell'account", error);
    }
    setLoadingDetails(false);
  };

  return (
    <>
    <Container fluid className="mt-5 pt-4">
      <Row className="d-flex align-items-stretch">
        <Col md={4} className="p-3 border-end h-200">
          <h5>Lista Conti</h5>
          <ListGroup>
            {accountIDs.map((account) => (
              <ListGroup.Item
                key={account.accountID}
                action
                active={selectedAccountID?.accountID === account.accountID}
                onClick={() => handleSelect(account.accountID)}
              >
                IBAN: #{account.accountID}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col md={8} className="p-3 h-200">
            <h5>Dettagli account</h5>
            {loadingDetails && (
            <div className="mt-3 text-center">
              <Spinner animation="border" size="sm" /> Caricamento...
            </div>
          )}
          {accountDetails && !loadingDetails && (
            
            <Card className="mt-4">
              <Card.Body>
                <p><strong>IBAN:</strong> {selectedAccountID}</p>
                <p><strong>Saldo:</strong> €{accountDetails.balance.toFixed(2)}</p>
                <p><strong>Data apertura:</strong> {new Date(accountDetails.opening_date).toLocaleDateString()}</p>
                <p><strong>Tipo:</strong> {accountDetails.account_type}</p>
                <p><strong>Stato:</strong> {accountDetails.account_status}</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
    <OperateAccount clientID={props.clientID} accountID={selectedAccountID} client_status={props.clientStatus} account_status={accountStatus}/>
    </>
  );
}

export default ViewAccount;
