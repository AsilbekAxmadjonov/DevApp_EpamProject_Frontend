import { useEffect, useState, useContext } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { useFetch } from "../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const auth = useContext(AuthContext);
  const { request, loading, error, clearError } = useFetch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const formValidation = () => {
    if (!form.username || !form.password) {
      toast.warning("Please fill in all fields");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formValidation()) return;

    try {
      const jsonPayload = { username: form.username, password: form.password };
      const data = await request("/api/v1/auth/login", "POST", jsonPayload);

      if (data) {
        auth.login(
          data.userId,
          data.token,
          data.username,
          data.firstName || "",
          data.lastName || ""
        );
        toast.success("Logged in successfully");
        navigate("/");
      }
    } catch (err) {
      toast.error("Login failed. Check your credentials.");
      throw err;
    } finally {
      setForm({ username: "", password: "" });
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <Container className="d-flex align-items-center justify-content-center">
        <Card className="glass p-4 text-white" style={{ width: 420 }}>
          <Card.Body>
            <h2 className="text-center mb-4 fw-bold">Welcome to DevLogs</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  required
                  className="bg-transparent text-white"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                  className="bg-transparent text-white"
                />
              </Form.Group>

              <Button
                type="submit"
                disabled={loading}
                className="w-100 mt-2 btn-gradient rounded-pill py-2"
              >
                {loading ? "Signing in…" : "Log In"}
              </Button>
            </Form>

            <p className="mt-4 text-center">
              Don't have an account?{" "}
              <Button
                disabled={loading}
                variant="link"
                className="text-white"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </p>
          </Card.Body>
        </Card>
      </Container>
      <ToastContainer />
    </div>
  );
}
