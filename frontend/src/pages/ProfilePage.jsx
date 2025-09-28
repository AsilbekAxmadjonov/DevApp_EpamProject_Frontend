import { useState, useEffect, useContext } from "react";
import { Container, Button, Modal, Form } from "react-bootstrap";
import { PersonCircle, Camera } from "react-bootstrap-icons";
import { useFetch } from "../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";

// function fmtDate(v) {
//   if (!v) return "";
//   const s = typeof v === "string" ? v.replace(" ", "T") : v;
//   const d = new Date(s);
//   return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
// }

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", bio: "" });
  const [photoB64, setPhotoB64] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");

  const { request, loading, error, clearError } = useFetch();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const pickImage = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const base64 = String(dataUrl).split(",")[1] || "";
      setPhotoB64(base64);
      setPreviewSrc(dataUrl);
    };
    reader.readAsDataURL(f);
  };

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
      setPreviewSrc(
        u?.profilePhoto
          ? `data:image/jpg;base64,${u.profilePhoto}`
          : u?.image || ""
      );

      const myPosts = await request(
        `/api/v1/posts/getAllPostsByUserId?id=${auth.userId}`,
        "GET"
      );
      setPosts(Array.isArray(myPosts) ? myPosts : myPosts?.data ?? []);
    } catch {
      console.log("Failed to load profile data");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId]);

  const saveProfile = async () => {
    try {
      const payload = {
        id: auth.userId,
        firstName: form.firstName,
        lastName: form.lastName,
        username: user?.username,
        email: user?.email,
        phone: user?.phone,
        bio: form.bio,
      };
      if (photoB64) payload.profilePhoto = photoB64;

      await request(`/api/v1/user/${auth.userId}`, "PUT", payload);
      toast.success("Profile updated");
      setEditOpen(false);
      load();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (loading && !user) return <Loader />;

  const avatarSrc =
    previewSrc ||
    (user?.profilePhoto
      ? `data:image/jpg;base64,${user.profilePhoto}`
      : user?.image || "");

  return (
    <Container className="py-6">
      {/* Header */}
      <div className="text-white rounded-3xl p-6 mb-6 bg-white/5 backdrop-blur-xl ring-1 ring-white/10">
        <div className="flex items-center gap-8">
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="rounded-full w-28 h-28 object-cover ring-1 ring-white/20"
              />
            ) : (
              <PersonCircle size={110} className="opacity-75" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h2 className="m-0 text-2xl font-semibold">
                {user?.username ?? auth.username}
              </h2>
              <Button
                variant="outline-light"
                size="sm"
                className="rounded-full"
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

      {/* All user's posts with edit (via PostCard) */}
      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={{ ...p, username: user?.username || p.username }}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center text-white/70 py-10">No posts yet.</div>
        )}
      </div>

      {/* Edit profile modal — Tailwind glass */}
      <Modal
        show={editOpen}
        onHide={() => setEditOpen(false)}
        centered
        contentClassName="bg-white/10 backdrop-blur-xl text-white rounded-2xl border border-white/15"
      >
        <Modal.Header closeButton className="border-white/10 rounded-t-2xl">
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="preview"
                  className="rounded-full w-20 h-20 object-cover ring-1 ring-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20" />
              )}
              <label
                className="absolute -bottom-2 -right-2 cursor-pointer bg-white/20 hover:bg-white/30 text-white p-2 rounded-full ring-1 ring-white/20"
                title="Change photo"
              >
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={pickImage}
                  hidden
                />
              </label>
            </div>
            <div className="opacity-80">Profile photo</div>
          </div>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-white/80">First name</Form.Label>
              <Form.Control
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                className="bg-white/10 text-white border border-white/30 rounded-xl focus:ring-0 focus:border-white/50"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-white/80">Last name</Form.Label>
              <Form.Control
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                className="bg-white/10 text-white border border-white/30 rounded-xl focus:ring-0 focus:border-white/50"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="text-white/80">Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
                className="bg-white/10 text-white border border-white/30 rounded-xl focus:ring-0 focus:border-white/50"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-white/10">
          <Button
            variant="outline-light"
            className="rounded-full"
            onClick={() => setEditOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 border-0"
            onClick={saveProfile}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </Container>
  );
}
