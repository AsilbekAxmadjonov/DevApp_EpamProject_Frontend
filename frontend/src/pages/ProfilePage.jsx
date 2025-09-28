import { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
import { useFetch } from "../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";

function fmtDate(v) {
  if (!v) return "";
  const s = typeof v === "string" ? v.replace(" ", "T") : v;
  const d = new Date(s);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", bio: "" });

  const { request, loading, error, clearError } = useFetch();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  async function load() {
    if (!auth?.userId) return;
    try {
      const u = await request(`/api/v1/user/${auth.userId}`, "GET");
      setUser(u || null);
      setForm({
        firstName: u?.firstName ?? "",
        lastName: u?.lastName ?? "",
        bio: u?.bio ?? "",
      });

      const myPosts = await request(
        `/api/v1/posts/getAllPostsByUserId?id=${auth.userId}`,
        "GET"
      );
      setPosts(Array.isArray(myPosts) ? myPosts : []);
    } catch {
      console.log();
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId]);

  const saveProfile = async () => {
    try {
      // Swagger shows PUT /api/v1/user/{id} with many fields;
      // send the ones we have + keep current values for required ones.
      await request(`/api/v1/user/${auth.userId}`, "PUT", {
        id: auth.userId,
        firstName: form.firstName,
        lastName: form.lastName,
        username: user?.username, // keep current if required
        email: user?.email,
        phone: user?.phone,
        bio: form.bio,
      });
      toast.success("Profile updated");
      setEditOpen(false);
      load();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (loading && !user) return <Loader />;

  return (
    <Container className="py-4">
      <div className="glass text-white rounded-3xl p-5 mb-4">
        <div className="flex items-center gap-8">
          <div>
            {user?.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="rounded-full w-28 h-28 border border-white/30"
              />
            ) : (
              <PersonCircle size={110} className="opacity-75" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h2 className="m-0">{user?.username ?? auth.username}</h2>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                Edit profile
              </Button>
            </div>

            <div className="flex gap-8 mt-3">
              <div>
                <span className="font-bold">{posts.length}</span> posts
              </div>
            </div>

            <div className="mt-3">
              <div className="font-semibold">
                {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
              </div>
              {user?.bio && <div className="text-white/80">{user.bio}</div>}
            </div>
          </div>
        </div>
      </div>

      <Row className="g-4">
        {posts.map((p) => (
          <Col key={p.id} xs={12} sm={6} md={4}>
            <Card className="glass h-100 text-white">
              {p.image && (
                <Card.Img
                  style={{ width: "100%", objectFit: "cover", height: 220 }}
                  variant="top"
                  src={`data:image/jpg;base64,${p.image}`}
                />
              )}
              <Card.Body>
                <div className="text-sm opacity-70 mb-1">
                  {fmtDate(p.createdAt) || "-"}
                </div>
                <div className="fw-semibold mb-1 truncate">
                  {p.title || "Post"}
                </div>
                <div className="opacity-90 line-clamp-3">{p.content}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {posts.length === 0 && (
          <div className="text-center text-white/70 py-10">No posts yet.</div>
        )}
      </Row>

      {/* Edit profile modal */}
      <Modal show={editOpen} onHide={() => setEditOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First name</Form.Label>
              <Form.Control
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setEditOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={saveProfile}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </Container>
  );
}
