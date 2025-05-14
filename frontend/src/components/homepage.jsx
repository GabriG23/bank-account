import { Navbar, Nav, Container, Card } from 'react-bootstrap';
import agmlogo from '../assets/agm_solutions.png';
import ViewAccount from './viewaccount';

function HomepageOpen(props) { // clientID clientStatus username
  return (
    <>
      <Header username={props.username} />
      <ViewAccount clientID={props.clientID} client_status={props.clientStatus} />
    </>
  );
}

function HomepageClosed(props) { // clientID clientStatus username
    return (
      <>
      <Header username={props.username} />
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Account Cliente Chiuso</Card.Title>
            <Card.Text>
              Il tuo account cliente è stato chiuso. <br />
              Per assistenza, contatta il tuo consulente: <br />
              <strong>gabriele.greco@agmsolutions.net</strong>
            </Card.Text>
          </Card.Body>
        </Card>
      </Container>
      </>
    );
}

function Header(props) {
  return (
    <>
      <Navbar className="custom-navbar" fixed="top">
        <Navbar.Brand className="d-flex align-items-center">
          <img
            src={agmlogo}
            alt="Logo banca"
            style={{ height: '30px', marginRight: '10px' }}
          />
          <span className="h5 mb-0">Bank</span>
        </Navbar.Brand>
        <Nav className="ms-auto">
          <span className="navbar-text text-black">
            Benvenuto{props.username ? `, ${props.username}` : ''}
          </span>
        </Nav>
      </Navbar>
    </>
  );
}

const Homepage = {HomepageClosed, HomepageOpen};
export default Homepage;
