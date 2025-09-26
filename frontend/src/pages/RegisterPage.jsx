import { useState, useEffect } from "react";
import { useFetch } from "../hooks/useFetch";
import { Container, Form, Button, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: ''
  });

  const { request, loading, error, clearError } = useFetch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const formValidation = () => {
    if (
      form.firstName === '' ||
      form.lastName === '' ||
      form.username === '' ||
      form.email === '' ||
      form.password === ''
    ) {
      toast.warning('Пожалуйста, заполните все обязательные поля');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formValidation()) return;

    try {
      const data = await request('/api/v1/auth/register', 'POST', form);
      if (data) {
        toast.success('Пользователь успешно создан');
        navigate('/login');
      }
    } catch (err) {
      console.error('catch', err);
    } finally {
      setForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        phone: ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4" style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Create an account</h2>
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3" controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="johndoe123"
                value={form.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Phone (optional)</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                placeholder="+1234567890"
                value={form.phone}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button type="submit" disabled={loading} variant="primary" className="w-100 mt-4">
              Register
            </Button>
          </Form>
          <p className="mt-4">
            Already have an account?
            <Button disabled={loading} variant="link" onClick={() => navigate("/login")}>
              Log in
            </Button>
          </p>
        </Card.Body>
      </Card>
      <ToastContainer />
    </Container>
  );
}
