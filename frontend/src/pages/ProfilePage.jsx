import { useState, useEffect, useContext, useRef } from "react";
import { Container, Card, Row, Col, Button, Form } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
import { useFetch } from "../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    image: "",
  });
  const { request, loading, error, clearError } = useFetch();
  const auth = useContext(AuthContext);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (auth) {
      setUser({
        firstName: auth.firstName || "",
        lastName: auth.lastName || "",
        username: auth.username || "",
        bio: auth.bio || "",
        image: auth.image || "",
      });
    }
  }, [auth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setUser((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        image: user.image,
      };
      const data = await request(
        `/api/v1/user/${auth.userId}`,
        "PUT",
        updatedUser,
        { Authorization: `Bearer ${auth.token}` }
      );
      setUser((prev) => ({ ...prev, ...data }));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      if (auth.login) {
        auth.login(
          auth.userId,
          auth.token,
          data.username,
          data.firstName,
          data.lastName,
          data.bio,
          data.image
        );
      }
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-4">
      <Card className="glass text-white">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={2} className="text-center mb-3 mb-md-0">
              <div
                style={{ cursor: isEditing ? "pointer" : "default" }}
                onClick={() => isEditing && fileInputRef.current.click()}
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt="Profile"
                    className="rounded-circle border border-white/30"
                    width={90}
                    height={90}
                  />
                ) : (
                  <PersonCircle size={90} className="opacity-75" />
                )}
              </div>
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              )}
            </Col>

            <Col md={8}>
              {!isEditing ? (
                <div>
                  <h4 className="mb-1">{user.username}</h4>
                  <p className="opacity-75 mb-2">
                    {user.firstName} {user.lastName}
                  </p>
                  {user.bio && <p className="mb-0">{user.bio}</p>}
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={user.firstName}
                      onChange={handleInputChange}
                      required
                      className="bg-transparent text-white"
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={user.lastName}
                      onChange={handleInputChange}
                      required
                      className="bg-transparent text-white"
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={user.username}
                      onChange={handleInputChange}
                      required
                      className="bg-transparent text-white"
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="bio"
                      value={user.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="bg-transparent text-white"
                    />
                  </Form.Group>
                  <div className="d-flex gap-2 mt-2">
                    <Button
                      variant="outline-light"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="light" type="submit" disabled={loading}>
                      {loading ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                </Form>
              )}
            </Col>

            <Col md={2} className="text-end">
              {!isEditing && (
                <Button
                  variant="light"
                  className="rounded-pill"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <ToastContainer />
    </Container>
  );
}
