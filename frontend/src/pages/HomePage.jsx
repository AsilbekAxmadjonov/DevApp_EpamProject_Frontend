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
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {posts.length === 0 && !loading && (
        <div className="text-center text-white/70 py-10">No posts yet.</div>
      )}
    </div>
  );
}
