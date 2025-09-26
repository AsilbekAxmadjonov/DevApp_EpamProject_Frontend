import { useEffect, useState, useContext } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { useFetch } from '../hooks/useFetch';
import { useNavigate } from 'react-router';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const auth = useContext(AuthContext);
  const { request, loading, error, clearError } = useFetch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const formValidation = () => {
    if (form.username === '' || form.password === '') {
      toast.warning('Пожалуйста, заполните все поля');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formValidation()) return;

    try {
      const data = await request('/api/v1/auth/login', 'POST', {
        username: form.username,
        password: form.password,
      });

      if (data) {
        console.log('Login data:', data);
        // Pass all user info to auth context
       const res =  auth.login(
          data.userId,
          data.token,
          data.username,
          data.firstName || '',
          data.lastName || ''
        );
        console.log('Login response:', res);

        toast.success('User logged in successfully');
        navigate('/'); // redirect after login
      }
    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setForm({ username: '', password: '' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4" style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Welcome to DevLogs</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter your username"
                value={form.username}
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

            <Button type="submit" disabled={loading} variant="primary" className="w-100 mt-4">
              Log In
            </Button>
          </Form>
          <p className="mt-4">
            Don't have an account?
            <Button
              disabled={loading}
              variant="link"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </p>
        </Card.Body>
      </Card>
      <ToastContainer />
    </Container>
  );
}
