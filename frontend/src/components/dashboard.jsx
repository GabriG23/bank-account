import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Modal, Spinner } from 'react-bootstrap';
import AccountList from './accountlist'; // Usa quello che ti ho sistemato prima
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

  const handleSelectAccount = (accountID) => {
    setSelectedAccountID(accountID);
    setSelectedPlot(null); // resetta grafico
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
            <DataAnalysis
              clientID={clientID}
              accountID={selectedAccountID}
              selectedPlot={selectedPlot}
              setSelectedPlot={setSelectedPlot}
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

function DataAnalysis({ clientID, accountID, selectedPlot, setSelectedPlot }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPlot = async (plotType) => {
      setSelectedPlot(plotType);
      setLoading(true);
      setImageUrl(null);

      try {
        let imageBlob;

        if (plotType === 'HISTOGRAM') {
          imageBlob = await API.getHistogram(clientID);
        } else if (plotType === 'LINEPLOT') {
          imageBlob = await API.getLinePlot(clientID);
        } else if (plotType === 'SCATTER') {
          imageBlob = await API.getScatterPlot(clientID);
        }

        const imageObjectURL = URL.createObjectURL(imageBlob);
        setImageUrl(imageObjectURL);
      } catch (error) {
        console.error('Errore durante il fetch del grafico:', error);
      } finally {
        setLoading(false);
      }
    };

  return(
    <>
      <Container fluid className="mt-4">
        <Row>
        <Col md={3} className="border-end">
            <h6 className="mb-3">Analisi grafica</h6>
            <ListGroup>
            {Object.entries(plotLabels).map(([key, label]) => (
              <ListGroup.Item
                key={key}
                action
                active={selectedPlot === key}
                onClick={() => fetchPlot(key)}
              >
                {label}
              </ListGroup.Item>
            ))}
          </ListGroup>
        
        </Col>

        {/* 3/5 - Visualizzazione grafico */}
        <Col md={9} className="text-center">
          <h5 className="mb-3">Analisi delle Transazioni</h5>
          <p className="text-muted">Conto selezionato: <strong>{accountID}</strong></p>

          {loading && <Spinner animation="border" variant="primary" className="mt-4" />}

          {imageUrl && !loading && (
            <img
              src={imageUrl}
              alt={`Grafico ${selectedPlot}`}
              className="img-fluid"
              style={{ maxHeight: '500px', marginTop: '20px' }}
            />
          )}
        </Col>
        </Row>
        </Container>
    </>
  )
}

export default Dashboard;
