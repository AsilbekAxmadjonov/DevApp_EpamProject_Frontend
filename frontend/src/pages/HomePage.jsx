import { Col, Row, Container } from "react-bootstrap";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import Loader from "../components/Loader";
import { toast } from "react-toastify"; // ✅ make sure toastify is installed & configured

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const { request, error, loading } = useFetch();

  // Handle errors from useFetch
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await request("/api/v1/posts", "GET");

        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("Invalid posts response:", data);
          setPosts([]);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        toast.error("Failed to load posts");
      }
    };

    fetchPosts();
  }, [request]);

  if (loading) return <Loader />;

  return (
    <Container className="py-4">
      <h1 className="mb-4">Недавние посты</h1>

      <Row>
        {posts.map((post) => (
          <Col key={post.id} xs={12} sm={6} md={4} className="mb-4">
            <PostCard post={post} />
          </Col>
        ))}
      </Row>

      {posts.length === 0 && !loading && (
        <div className="text-center">
          <h2>No posts here yet</h2>
        </div>
      )}
    </Container>
  );
}
