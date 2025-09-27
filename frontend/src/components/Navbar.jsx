import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Button,
} from "react-bootstrap";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <div className="w-100 shadow-sm">
      <BootstrapNavbar expand="lg" className="glass py-2">
        <Container>
          <BootstrapNavbar.Brand
            as={Link}
            to="/"
            className="fw-bold text-white"
          >
            DevLogs
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/home" className="text-white">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/create" className="text-white">
                Create
              </Nav.Link>
              <Nav.Link as={Link} to="/profile" className="text-white">
                Profile
              </Nav.Link>
              <Nav.Link as={Link} to="/bookmarks" className="text-white">
                Bookmarks
              </Nav.Link>
            </Nav>
            <Button
              onClick={handleLogout}
              className="btn-gradient rounded-pill px-4"
            >
              Logout
            </Button>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </div>
  );
}
