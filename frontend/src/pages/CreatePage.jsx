import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function CreatePage() {
  const { userId, token } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!content.trim()) {
      setStatus({ type: "error", text: "Post content cannot be empty." });
      return;
    }

    try {
      setLoading(true);
      // relative URL → Vite proxy handles CORS
      await axios.post(
        "/api/v1/posts",
        { userId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus({ type: "success", text: "Your post was published!" });
      setContent("");
    } catch (error) {
      setStatus({
        type: "error",
        text: error.response?.data?.message || "Could not create post.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-10">
      <div className="w-full max-w-2xl glass rounded-3xl p-12 space-y-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Create a New Post
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={8}
            className="w-full rounded-2xl p-4 bg-transparent border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          {status && (
            <p
              className={`text-sm font-medium text-center px-5 py-3 rounded-3xl border ${
                status.type === "success"
                  ? "bg-green-600/20 text-green-100 border-green-300/30"
                  : "bg-red-600/20 text-red-100 border-red-300/30"
              }`}
            >
              {status.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-1/2 mx-auto py-3 rounded-2xl font-semibold btn-gradient ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
