import { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Spinner } from 'react-bootstrap';
import AccountList from './accountlist';
import API from '../API';

const plotLabels = {
  HISTOGRAM: 'Distribuzione importi',
  LINEPLOT: 'Andamento temporale',
  SCATTER: 'Distribuzione temporale',
};

function Dashboard({ clientID }) {
  const [openAccounts, setOpenAccounts] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);

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
    setSelectedPlot(null); // Reset grafico selezionato
    setAccountDetails(null)
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
        {/* Colonna 1 - Conti attivi */}
        <Col md={2} className="p-3 border-end bg-light">
          <AccountList.AccountListOpen
            clientID={clientID}
            openAccounts={openAccounts}
            setOpenAccounts={setOpenAccounts}
            selectedAccountID={selectedAccountID}
            onSelect={handleSelectAccount}
          />
        </Col>

    <Col md={2} className="p-4 border-end bg-white">
      {selectedAccountID ? (
        <>
          <h6 className="mb-3">Analisi grafica</h6>
          <ListGroup>
            {Object.entries(plotLabels).map(([key, label]) => (
              <ListGroup.Item
                key={key}
                action
                active={selectedPlot === key}
                onClick={() => setSelectedPlot(key)}
                style={{ cursor: 'pointer' }}
              >
                {label}
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

        {/* Colonna 3 - Grafico */}
        <Col md={8} className="p-5">
          {selectedAccountID ? (
            <DataAnalysis
              clientID={clientID}
              accountID={selectedAccountID}
              selectedPlot={selectedPlot}
              accountDetails={accountDetails}
            />
          ) : (
            <div className="text-center text-muted fs-5 mt-5">
              Seleziona un conto per iniziare
            </div>
          )}
        </Col>
      </Row>
    </Container>
        }
        </>
  );
}

function DataAnalysis({ clientID, accountID, selectedPlot, accountDetails }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImageUrl(null);
    setLoading(false);
  }, [accountID]);

  useEffect(() => {
    const fetchPlot = async () => {
      if (!selectedPlot) return;

      setLoading(true);
      setImageUrl(null);

      try {
        let imageBlob;
        if (selectedPlot === 'HISTOGRAM') imageBlob = await API.getHistogram(clientID);
        else if (selectedPlot === 'LINEPLOT') imageBlob = await API.getLinePlot(clientID);
        else if (selectedPlot === 'SCATTER') imageBlob = await API.getScatterPlot(clientID);

        const objectURL = URL.createObjectURL(imageBlob);
        setImageUrl(objectURL);
      } catch (error) {
        console.error('Errore durante il fetch del grafico:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlot();
  }, [selectedPlot, clientID]);

  return (
    <div className="text-center">
      <h5 className="mb-3">Analisi delle Transazioni</h5>

      {accountDetails && (
            <>
      <p className="text-muted">
        Conto selezionato: <strong>{accountDetails.iban}</strong>
      </p>
            </>
          )}


      {loading && (
        <div className="mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!loading && !imageUrl && !selectedPlot && (
        <div className="text-muted mt-5">
          Seleziona un tipo di analisi grafica
        </div>
      )}

      {!loading && !imageUrl && selectedPlot && (
        <div className="text-muted mt-5">
          Nessun grafico disponibile
        </div>
      )}

      {imageUrl && !loading && (
        <img
          src={imageUrl}
          alt={`Grafico ${plotLabels[selectedPlot]}`}
          className="img-fluid shadow-sm rounded mt-4"
          style={{ maxHeight: '500px' }}
        />
      )}
    </div>
  );
}

export default Dashboard;
