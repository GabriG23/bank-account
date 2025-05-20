import { Link, Outlet, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import agmlogo from '../assets/agm_solutions.png';


function Layout({ username }) {
  return (
    <>
      <Header username={username} />
      <main className="fill-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
function Header({ username }) {
  const location = useLocation();

  return (
    <Navbar className="custom-navbar" fixed="top" bg="light">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src={agmlogo} alt="Logo banca" height="30" className="me-2" />
        </Navbar.Brand>
        <Nav className="ms-auto align-items-center">
          <Nav.Link
            as={Link}
            to="/"
            className={`px-2 ${location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/operation"
            className={`px-2 ${location.pathname === "/operation" ? "active" : ""}`}
          >
            Operazioni
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/transaction"
            className={`px-2 ${location.pathname === "/transaction" ? "active" : ""}`}
          >
            Transazioni
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard"
            className={`px-2 ${location.pathname === "/dashboard" ? "active" : ""}`}
          >
            Dashboard
          </Nav.Link>
          <span className="navbar-text ms-3 fw-semibold">
            Benvenuto{username ? `, ${username}` : ""}
          </span>
        </Nav>
      </Container>
    </Navbar>
  );
}

function Footer() {
  return (
    <footer className="bg-light text-dark py-4 mt-auto border-top">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>AGM Solutions</h5>
            <p className="small mb-0">Soluzioni digitali per la tua impresa.</p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h6>Link utili</h6>
            <ul className="list-unstyled small">
              <li><Link to="/" className="text-dark text-decoration-none">Home</Link></li>
              <li><Link to="/operation" className="text-dark text-decoration-none">Operazioni</Link></li>
              <li><Link to="/transaction" className="text-dark text-decoration-none">Transazioni</Link></li>
              <li><Link to="/dashboard" className="text-dark text-decoration-none">Dashboard</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h6>Contatti</h6>
            <p className="small mb-1">Email: info@agmsolutions.net</p>
          </Col>
        </Row>
        <hr />
        <Row className="text-center">
          <Col>
            <p className="small mb-0">
              &copy; {new Date().getFullYear()} AGM Solutions. Tutti i diritti riservati.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Layout;
