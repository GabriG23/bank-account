import { Container, Card } from 'react-bootstrap';

function HomepageClosed(props) { // clientID clientStatus username
    return (
      <>
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Account Cliente Chiuso</Card.Title>
            <Card.Text>
              Il tuo account cliente è stato chiuso. <br />
              Per assistenza, contatta il tuo consulente: <br />
              <strong>info@agmsolutions.net</strong>
            </Card.Text>
          </Card.Body>
        </Card>
      </Container>
      </>
    );
}

export default HomepageClosed;
