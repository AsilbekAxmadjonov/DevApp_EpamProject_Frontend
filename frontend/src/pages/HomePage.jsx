import { Col, Row, Container } from "react-bootstrap";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const { request, error, loading } = useFetch();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    (async () => {
      try {
        const data = await request("/api/v1/posts", "GET");
        setPosts(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load posts");
      }
    })();
  }, [request]);

  if (loading) return <Loader />;

  return (
    <div className="py-5">
      <Container>
        <div className="glass text-white p-4 rounded-4 mb-4">
          <h1 className="mb-1">Recent Posts</h1>
          <p className="mb-0 opacity-75">
            See what the community is building today.
          </p>
        </div>

        <Row>
          {posts.map((post) => (
            <Col key={post.id} xs={12} md={6} lg={4} className="mb-4">
              <PostCard post={post} />
            </Col>
          ))}
        </Row>

        {posts.length === 0 && !loading && (
          <div className="text-center text-white-50">
            <h4>No posts here yet</h4>
          </div>
        )}
      </Container>
    </div>
  );
}
