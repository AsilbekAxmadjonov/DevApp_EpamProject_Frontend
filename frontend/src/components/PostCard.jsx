import {
  Card,
  Button,
  Form,
  Collapse,
  Image,
  Dropdown,
  Modal,
} from "react-bootstrap";
import {
  Heart,
  HeartFill,
  Chat,
  PersonCircle,
  VolumeUp,
  VolumeMute,
  ThreeDots,
} from "react-bootstrap-icons";
import { useState, useEffect, useContext } from "react";
import { useFetch } from "../hooks/useFetch";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

/* robust date parser for ISO or "YYYY-MM-DD HH:mm:ss" */
function fmtDate(v) {
  if (!v) return "";
  const s = typeof v === "string" ? v.replace(" ", "T") : v;
  const d = new Date(s);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

export default function PostCard({ post }) {
  // ----- state -----
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [likesCount, setLikesCount] = useState(Number(post.likes) || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  const [editPostOpen, setEditPostOpen] = useState(false);
  const [editPostText, setEditPostText] = useState(post.content || "");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const { request } = useFetch();
  const { userId, username } = useContext(AuthContext);

  const isMyPost =
    Number(post.userId) === Number(userId) || post.username === username;

  // helpers
  const parseCount = (v) => {
    if (Number.isFinite(v)) return v;
    if (typeof v === "string" && !Number.isNaN(+v)) return +v;
    if (v && Number.isFinite(v.count)) return v.count;
    if (v && Number.isFinite(v.total)) return v.total;
    return 0;
  };

  // ----- voices -----
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  // ----- likes count -----
  async function refreshLikesCount() {
    try {
      try {
        const res = await request(
          `/api/v1/likes/post/${post.id}/likesCount`,
          "GET"
        );
        setLikesCount(parseCount(res));
      } catch {
        const res = await request(
          `/api/v1/likes/post/${post.id}/unlikesCount`,
          "GET"
        );
        setLikesCount(parseCount(res));
      }
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => {
    refreshLikesCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  // ----- comments: load only when opened the first time -----
  useEffect(() => {
    // when post changes, reset the cache & UI
    setComments([]);
    setHasLoadedComments(false);
    setShowComments(false);
  }, [post.id]);

  useEffect(() => {
    if (!showComments || hasLoadedComments) return;

    let aborted = false;
    (async () => {
      try {
        const data =
          (await request(
            `/api/v1/comments/posts/${post.id}/getCommentsByPost`,
            "GET"
          )) || [];
        if (!aborted) {
          setComments(Array.isArray(data) ? data : []);
          setHasLoadedComments(true);
        }
      } catch {
        if (!aborted) toast.error("Failed to load comments");
      }
    })();

    return () => {
      aborted = true;
    };
  }, [showComments, hasLoadedComments, post.id, request]);

  // ----- like / unlike -----
  const handleLike = async () => {
    if (likeBusy) return;
    if (!userId) return toast.error("Please log in again.");

    setLikeBusy(true);
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // optimistic UI
    setIsLiked(!prevLiked);
    setLikesCount((c) => Math.max(0, c + (prevLiked ? -1 : +1)));

    try {
      if (!prevLiked) {
        await request(`/api/v1/likes/like`, "POST", {
          userId,
          postId: post.id,
        });
      } else {
        await request(`/api/v1/likes/unlike`, "POST", {
          userId,
          postId: post.id,
        });
      }
      await refreshLikesCount();
    } catch (err) {
      console.error(err);
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error("Failed to update like status");
    } finally {
      setLikeBusy(false);
    }
  };

  // ----- add / edit / delete comment -----
  const handleCommentSubmit = async (id) => {
    if (!newComment.trim()) return;
    try {
      const created = await request(
        `/api/v1/comments/posts/${id}/create`,
        "POST",
        { content: newComment }
      );
      setComments((prev) => [...prev, created]);
      setHasLoadedComments(true);
      setNewComment("");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditingText(c.content);
  };
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingText("");
  };
  const saveEditComment = async (c) => {
    try {
      const upd = await request(`/api/v1/comments/${c.id}/update`, "PUT", {
        content: editingText,
      });
      setComments((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, content: upd?.content ?? editingText } : x
        )
      );
      cancelEditComment();
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    }
  };
  const removeComment = async (c) => {
    try {
      await request(`/api/v1/comments/${c.id}/delete`, "DELETE");
    } catch (err) {
      console.log(err);
    }
    setComments((prev) => prev.filter((x) => x.id !== c.id));
  };

  // ----- TTS -----
  const handleReadAloud = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const speech = new SpeechSynthesisUtterance(
      `${post.title ?? ""}. ${post.content ?? ""}`
    );
    const voice = voices.find((v) => v.lang && v.lang.startsWith("en"));
    if (voice) speech.voice = voice;
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(speech);
    setIsSpeaking(true);
  };

  // ----- edit post -----
  const openEditPost = () => {
    setEditPostText(post.content || "");
    setEditPostOpen(true);
  };
  const saveEditPost = async () => {
    try {
      const updated = await request(`/api/v1/posts/${post.id}`, "PUT", {
        userId,
        content: editPostText,
      });
      post.content = updated?.content ?? editPostText;
      setEditPostOpen(false);
      toast.success("Post updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update post");
    }
  };

  // ----- render -----
  return (
    <Card className="border-0 text-white max-w-[600px] w-full mx-auto rounded-2xl bg-white/10 backdrop-blur-xl shadow-lg ring-1 ring-white/10">
      {/* {post.image && (
        <Card.Img
          style={{ width: "100%", objectFit: "cover", maxHeight: "320px" }}
          variant="top"
          src={`data:image/jpg;base64,${post.image}`}
          className="rounded-t-2xl"
        />
      )} */}

      <Card.Body className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0">
            <Card.Title className="mb-1 text-xl font-semibold truncate">
              {post.title}
            </Card.Title>
            <div className="flex items-center gap-2 border-b border-white/20 pb-1">
              {/* show ONLY the author's username */}
              <h6 className="mb-0 truncate text-white/90">{post.username}</h6>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <small className="opacity-75">{fmtDate(post.createdAt)}</small>
            {isMyPost && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  className="text-white p-0 hover:opacity-80"
                >
                  <ThreeDots />
                </Dropdown.Toggle>
                <Dropdown.Menu className="px-2 rounded-xl bg-white/10 backdrop-blur-xl ring-1 ring-white/10 text-white">
                  <Dropdown.Item
                    onClick={openEditPost}
                    className="rounded-lg text-white hover:bg-white/20"
                  >
                    Edit Post
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="rounded-lg text-red-300 hover:bg-white/20"
                    disabled
                  >
                    Delete Post (soon)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </div>

        <Card.Text className="mb-4 opacity-95 whitespace-pre-wrap">
          {post.content}
        </Card.Text>

        <div className="flex gap-2 mb-2">
          <Button
            variant={isLiked ? "light" : "outline-light"}
            size="sm"
            onClick={handleLike}
            disabled={likeBusy}
            aria-pressed={isLiked}
            className="flex items-center gap-1 rounded-full px-3"
          >
            {isLiked ? <HeartFill /> : <Heart />}
            <span>{likesCount}</span>
          </Button>

          <Button
            variant={showComments ? "light" : "outline-light"}
            size="sm"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1 rounded-full px-3"
          >
            <Chat />
            <span>{comments.length}</span>
          </Button>

          <Button
            variant={isSpeaking ? "light" : "outline-light"}
            size="sm"
            onClick={handleReadAloud}
            className="flex items-center rounded-full px-3"
          >
            {isSpeaking ? <VolumeMute /> : <VolumeUp />}
          </Button>
        </div>

        {/* Keep mounted so list doesn't reset; load only on first open */}
        <Collapse in={showComments} mountOnEnter unmountOnExit={false}>
          <div className="mt-4">
            <div className="mb-3 flex flex-col gap-2">
              {comments.map((c) => {
                const mine = Number(c.userId) === Number(userId);
                const authorName =
                  (c.author &&
                    (`${c.author.firstName ?? ""} ${
                      c.author.lastName ?? ""
                    }`.trim() ||
                      c.author.username)) ||
                  c.username ||
                  (c.user && c.user.username) ||
                  "Unknown";

                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {c.author?.profilePhoto ? (
                        <Image
                          src={`data:image/jpg;base64,${c.author.profilePhoto}`}
                          roundedCircle
                          width={30}
                          height={30}
                          className="object-cover"
                        />
                      ) : (
                        <PersonCircle size={30} className="opacity-75" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center">
                          <strong>{authorName}</strong>
                          <small className="opacity-75 ms-2">
                            {fmtDate(c.createdAt)}
                          </small>
                        </div>

                        {editingCommentId === c.id ? (
                          <div className="mt-2">
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="bg-white/10 text-white border border-white/30 rounded-lg focus:ring-0 focus:border-white/50"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 border-0"
                                onClick={() => saveEditComment(c)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-light"
                                className="rounded-full"
                                onClick={cancelEditComment}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="mb-0 whitespace-pre-wrap">
                            {c.content}
                          </p>
                        )}
                      </div>

                      {mine && editingCommentId !== c.id && (
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            variant="link"
                            className="text-white p-0"
                          >
                            <ThreeDots />
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="px-2 rounded-xl bg-white/10 backdrop-blur-xl ring-1 ring-white/10 text-white">
                            <Dropdown.Item
                              onClick={() => startEditComment(c)}
                              className="rounded-lg text-white hover:bg-white/20"
                            >
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="rounded-lg text-red-300 hover:bg-white/20"
                              onClick={() => removeComment(c)}
                            >
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleCommentSubmit(post.id);
              }}
            >
              <Form.Group className="mb-2">
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="rounded-xl bg-white/10 text-white border border-white/30 focus:ring-0 focus:border-white/50"
                />
              </Form.Group>
              <Button
                type="submit"
                size="sm"
                className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 border-0"
              >
                Post Comment
              </Button>
            </Form>
          </div>
        </Collapse>
      </Card.Body>

      {/* Edit Post Modal — Tailwind glass */}
      <Modal
        show={editPostOpen}
        onHide={() => setEditPostOpen(false)}
        centered
        contentClassName="bg-white/10 backdrop-blur-xl text-white rounded-2xl border border-white/15"
      >
        <Modal.Header
          closeButton
          className="border-white/10 text-white rounded-t-2xl"
        >
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-3">
          <Form.Group>
            <Form.Label className="text-white/80">Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={editPostText}
              onChange={(e) => setEditPostText(e.target.value)}
              className="bg-white/10 text-white border border-white/30 rounded-xl focus:ring-0 focus:border-white/50"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-white/10">
          <Button
            variant="outline-light"
            className="rounded-full"
            onClick={() => setEditPostOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 border-0"
            onClick={saveEditPost}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
