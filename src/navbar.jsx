import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

function NavBar() {
  const navigate = useNavigate();

  return (
    <Navbar
      expand="md"
      fixed="top"
      collapseOnSelect={true}
      style={{
        background: "rgba(173, 216, 230, 0.3)",
        backdropFilter: "blur(10px)",                 // zrkadlový efekt
        WebkitBackdropFilter: "blur(10px)",           // podpora pre Safari
        borderRadius: "0 0 12px 12px",         /* zaoblené dolné rohy */
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", /* jemný tieň dolu */
        border: "1px solid rgba(255, 255, 255, 0.18)",
      }}
    >
      <Container>
        <Navbar.Brand onClick={() => navigate("")} style={{ cursor: "pointer" }}>RegDiary</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" size="sm" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              onClick={() => navigate("")}
              active={window.location.pathname === "/"}
              eventKey="dashboard"
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate("customerList")}
              active={window.location.pathname === "/customerList"}
              eventKey="customerList"
            >
              Zákazníci
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;