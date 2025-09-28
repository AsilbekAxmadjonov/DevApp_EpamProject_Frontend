import { useState, useEffect } from "react";
import { useFetch } from "../hooks/useFetch";
import { Container, Form, Button, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const { request, loading, error, clearError } = useFetch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const formValidation = () => {
    const { firstName, lastName, username, email, password } = form;
    if (!firstName || !lastName || !username || !email || !password) {
      toast.warning("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formValidation()) return;

    try {
      const data = await request("/api/v1/auth/register", "POST", form);
      if (data) {
        toast.success("Account created successfully");
        navigate("/login");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setForm({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        phone: "",
      });
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <Container className="d-flex align-items-center justify-content-center">
        style={{ width: 420 }}
        <Card
          style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
          className="glass p-4 text-white"
        >
          <Card.Body>
            <h2 className="text-center mb-4 fw-bold">Create an account</h2>
            <Form onSubmit={handleRegister}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      className="bg-transparent text-white"
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, firstName: e.target.value }))
                      }
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      className="bg-transparent text-white"
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lastName: e.target.value }))
                      }
                      required
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  className="bg-transparent text-white"
                  type="text"
                  name="username"
                  placeholder="johndoe123"
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, username: e.target.value }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  className="bg-transparent text-white"
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  className="bg-transparent text-white"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="phone">
                <Form.Label>Phone (optional)</Form.Label>
                <Form.Control
                  className="bg-transparent text-white"
                  type="text"
                  name="phone"
                  placeholder="+1234567890"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </Form.Group>

              <Button
                type="submit"
                disabled={loading}
                className="w-100 mt-2 btn-gradient rounded-pill py-2"
              >
                {loading ? "Creating…" : "Register"}
              </Button>
            </Form>

            <p className="mt-4 text-center">
              Already have an account?{" "}
              <Button
                disabled={loading}
                variant="link"
                className="text-white"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
            </p>
          </Card.Body>
        </Card>
      </Container>
      <ToastContainer />
    </div>
  );
}
