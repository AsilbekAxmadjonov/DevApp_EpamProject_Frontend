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
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-12 space-y-10 border border-gray-200">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 text-center rounded-lg">
          Create a New Post
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={8}
            className="w-full border border-gray-300 rounded-2xl p-6 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none shadow-md hover:shadow-lg transition duration-200"
          />

          {status && (
            <p
              className={`text-sm font-medium text-center px-5 py-3 rounded-3xl border ${
                status.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              } shadow-sm`}
            >
              {status.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-1/2 mx-auto py-3 rounded-2xl font-semibold shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              loading
                ? "bg-indigo-300 text-white"
                : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white"
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
