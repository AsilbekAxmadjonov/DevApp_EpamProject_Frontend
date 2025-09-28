import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";

export default function RightSidebar() {
  const { userId, username, firstName, lastName } = useContext(AuthContext);
  const { request } = useFetch();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        if (!userId) return;
        const u = await request(`/api/v1/user/${userId}`, "GET");
        setUser(u || null);

        const myPosts = await request(
          `/api/v1/posts/getAllPostsByUserId?id=${userId}`,
          "GET"
        );
        setPosts(Array.isArray(myPosts) ? myPosts : myPosts?.data ?? []);
      } catch {
        /* ignore */
      }
    })();
  }, [userId, request]);

  const displayName =
    user?.firstName || firstName || ""
      ? `${user?.firstName ?? firstName ?? ""} ${
          user?.lastName ?? lastName ?? ""
        }`.trim()
      : username;

  return (
    <aside className="sticky top-0 h-screen w-80 glass text-white p-4">
      <div className="flex items-center gap-4">
        {user?.image ? (
          <img
            src={user.image}
            alt="avatar"
            className="w-16 h-16 rounded-full border border-white/30"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/20" />
        )}
        <div>
          <div className="text-lg font-semibold">
            {user?.username || username}
          </div>
          <div className="text-white/70">{displayName}</div>
        </div>
      </div>

      <div className="mt-4 flex gap-6">
        <div className="text-center">
          <div className="text-xl font-bold">{posts.length}</div>
          <div className="text-white/70 text-sm">Posts</div>
        </div>
        {/* future: followers / following */}
      </div>

      <div className="mt-6">
        <div className="text-sm uppercase tracking-wide text-white/60 mb-2">
          Recent posts
        </div>
        <div className="space-y-2">
          {posts.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="text-white/85 truncate border border-white/10 rounded-xl px-3 py-2"
            >
              {p.title || p.content}
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-white/50">No posts yet.</div>
          )}
        </div>
      </div>
    </aside>
  );
}
