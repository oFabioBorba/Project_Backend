import { useNavigate } from "react-router-dom"; 
import React from "react";
import { Navbar, Container, Nav, NavDropdown, Form, Button, Image } from "react-bootstrap";

export default function MarketplaceNavbar({ user, theme, setTheme }) {
   const navigate = useNavigate();

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className="w-100"
      style={{
        backgroundColor: "var(--card)",
        zIndex: 9999,
        padding: "0.5rem 1rem",
        boxShadow: "var(--shadow)",
      }}
    >
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Logo */}
        <Navbar.Brand onClick={() => navigate("/home")} style={{ fontWeight: "bold", color: "var(--text)", cursor:"pointer" }}>
          SpeedTrade
        </Navbar.Brand>

        {/* Campo de busca */}
        <Form className="d-flex flex-grow-1 mx-3">
          <Form.Control
            type="search"
            placeholder="Buscar serviços..."
            className="me-2"
            aria-label="Search"
            style={{ borderRadius: "8px" }}
          />
          <Button variant="outline-primary">Buscar</Button>
        </Form>

        {/* Avatar e tema */}
        <Nav className="align-items-center">
          {/* Botão alternar tema */}
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "🌞 Claro" : "🌙 Escuro"}
          </button>

          {/* Avatar / Dropdown */}
          <NavDropdown
            title={
              <Image
                src={user.photoUrl || "/default-avatar.png"}
                roundedCircle
                width={40}
                height={40}
              />
            }
            id="user-dropdown"
            align="end"
          >
            <NavDropdown.Item onClick={() => navigate("/profile")}>Perfil</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item>Meus anúncios</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={() => {localStorage.removeItem("token") ; navigate("/");}}>Sair</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
