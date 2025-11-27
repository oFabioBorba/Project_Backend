import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  NavDropdown,
  Form,
  Button,
  Image,
} from "react-bootstrap";

export default function MarketplaceNavbar({ user, theme, setTheme, unreadCount }) {
  const [search, setSearch] = useState("");
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
      <Container
        fluid
        className="d-flex justify-content-between align-items-center"
      >
        {/* Logo */}
        <Navbar.Brand
          onClick={() => navigate("/home")}
          style={{
            fontWeight: "bold",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          SpeedTrade
        </Navbar.Brand>

        {/* Campo de busca */}
        <Form
          className="d-flex flex-grow-1 mx-3"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/buscar?titulo=${search}`;
          }}
        >
          <Form.Control
            type="search"
            placeholder="Buscar serviços..."
            className="me-2"
            aria-label="Search"
            style={{ borderRadius: "8px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline-primary" type="submit">
            Buscar
          </Button>
        </Form>

        {/* Avatar, tema e notificações */}
        <Nav className="align-items-center">

          {/* Botão alternar tema */}
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "🌞 Claro" : "🌙 Escuro"}
          </button>

          {/* Ícone de notificações (SVG) */}
          <div
            style={{
              position: "relative",
              marginRight: "16px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/chat")}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 16 16"
              fill="var(--text)"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 
                       6c0 1.098-.5 3.5-1 4v1h12v-1c-.5-.5-1-2.902-1-4a5.002 5.002 0 0 0-4.005-4.901z"/>
            </svg>

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "12px",
                  padding: "2px 6px",
                  fontWeight: "bold",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {/* Avatar menu */}
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
            <NavDropdown.Item onClick={() => navigate("/profile")}>
              Perfil
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={() => navigate("/MyAds")}>
              Meus anúncios
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={() => navigate("/chat")}>
              Minhas conversas
            </NavDropdown.Item>
            <NavDropdown.Divider />

            <NavDropdown.Item
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              Sair
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
