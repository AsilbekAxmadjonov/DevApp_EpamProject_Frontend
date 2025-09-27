import { useState, useEffect, useContext } from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
import { useFetch } from "../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const { request, loading, error, clearError } = useFetch();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    (async () => {
      try {
        if (!auth?.userId) return;
        const u = await request(`/api/v1/user/${auth.userId}`, "GET");
        setUser(u || null);

        const myPosts = await request(
          `/api/v1/posts/getAllPostsByUserId?id=${auth.userId}`,
          "GET"
        );
        setPosts(Array.isArray(myPosts) ? myPosts : []);
      } catch {
        /* ignore */
      }
    })();
  }, [auth?.userId, request]);

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
              {/* future edit profile here */}
            </div>

            <div className="flex gap-8 mt-3">
              <div>
                <span className="font-bold">{posts.length}</span> posts
              </div>
              {/* followers / following can be added later */}
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
            <Card className="glass h-100">
              {p.image && (
                <Card.Img
                  style={{ width: "100%", objectFit: "cover", height: 220 }}
                  variant="top"
                  src={`data:image/jpg;base64,${p.image}`}
                />
              )}
              <Card.Body className="text-white">
                <div className="text-sm opacity-70 mb-1">
                  {new Date(p.createdAt).toLocaleDateString()}
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

      <ToastContainer />
    </Container>
  );
}
