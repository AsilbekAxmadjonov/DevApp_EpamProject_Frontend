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
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(Number(post.likes) || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
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

  const parseCount = (v) => {
    if (Number.isFinite(v)) return v;
    if (typeof v === "string" && !Number.isNaN(+v)) return +v;
    if (v && Number.isFinite(v.count)) return v.count;
    if (v && Number.isFinite(v.total)) return v.total;
    return 0;
  };

  // voices
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  // load comments once per post (no flicker)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data =
          (await request(
            `/api/v1/comments/posts/${post.id}/getCommentsByPost`,
            "GET"
          )) || [];
        if (!ignore) setComments(data);
      } catch {
        toast.error("Failed to load comments");
      }
    })();
    return () => {
      ignore = true;
    };
  }, [post.id, request]);

  // likes count (support either likesCount or unlikesCount route)
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

  // like / unlike
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

  // add comment (append locally; keep panel open)
  const handleCommentSubmit = async (id) => {
    if (!newComment.trim()) return;
    try {
      const created = await request(
        `/api/v1/comments/posts/${id}/create`,
        "POST",
        { content: newComment }
      );
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  // TTS
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

  return (
    <Card className="shadow-lg border-0 glass text-white max-w-[500px] w-full mx-auto">
      {post.image && (
        <Card.Img
          style={{ width: "100%", objectFit: "cover", maxHeight: "320px" }}
          variant="top"
          src={`data:image/jpg;base64,${post.image}`}
        />
      )}

      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="min-w-0">
            <Card.Title className="mb-1">{post.title}</Card.Title>
            <div className="d-flex align-items-center gap-2 border-bottom border-white/25 pb-1">
              {/* show ONLY the author's username */}
              <h6 className="mb-0 truncate">{post.username}</h6>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <small className="opacity-75">{fmtDate(post.createdAt)}</small>
            {isMyPost && (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-white p-0">
                  <ThreeDots />
                </Dropdown.Toggle>
                <Dropdown.Menu className="px-2">
                  <Dropdown.Item onClick={openEditPost}>
                    Edit Post
                  </Dropdown.Item>
                  <Dropdown.Item className="text-danger" disabled>
                    Delete Post (soon)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </div>

        <Card.Text className="mb-3 opacity-95 whitespace-pre-wrap">
          {post.content}
        </Card.Text>

        <div className="d-flex gap-2 mb-2">
          <Button
            variant={isLiked ? "light" : "outline-light"}
            size="sm"
            onClick={handleLike}
            disabled={likeBusy}
            aria-pressed={isLiked}
            className="d-flex align-items-center gap-1 rounded-pill"
          >
            {isLiked ? <HeartFill /> : <Heart />}
            <span>{likesCount}</span>
          </Button>

          <Button
            variant={showComments ? "light" : "outline-light"}
            size="sm"
            onClick={() => setShowComments((v) => !v)}
            className="d-flex align-items-center gap-1 rounded-pill"
          >
            <Chat />
            <span>{comments.length}</span>
          </Button>

          <Button
            variant={isSpeaking ? "light" : "outline-light"}
            size="sm"
            onClick={handleReadAloud}
            className="d-flex align-items-center rounded-pill"
          >
            {isSpeaking ? <VolumeMute /> : <VolumeUp />}
          </Button>
        </div>

        {/* Keep content mounted; avoid flicker */}
        <Collapse in={showComments} mountOnEnter>
          <div className="mt-3">
            <div className="mb-3 d-flex flex-column gap-2">
              {comments.map((c) => {
                const mine = Number(c.userId) === Number(userId);
                return (
                  <div key={c.id} className="p-3 rounded-3 glass">
                    <div className="d-flex align-items-start gap-2 mb-1">
                      {c.author?.profilePhoto ? (
                        <Image
                          src={`data:image/jpg;base64,${c.author.profilePhoto}`}
                          roundedCircle
                          width={30}
                          height={30}
                        />
                      ) : (
                        <PersonCircle size={30} className="opacity-75" />
                      )}
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <strong>
                            {c.author
                              ? `${c.author.firstName ?? ""} ${
                                  c.author.lastName ?? ""
                                }`.trim() || c.author.username
                              : "Unknown"}
                          </strong>
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
                              className="bg-transparent text-white"
                            />
                            <div className="d-flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="light"
                                onClick={() => saveEditComment(c)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-light"
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
                          <Dropdown.Menu className="px-2">
                            <Dropdown.Item onClick={() => startEditComment(c)}>
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="text-danger"
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
                  className="rounded-3 bg-transparent text-white"
                />
              </Form.Group>
              <Button
                type="submit"
                size="sm"
                className="rounded-pill btn-gradient"
              >
                Post Comment
              </Button>
            </Form>
          </div>
        </Collapse>
      </Card.Body>

      <Modal show={editPostOpen} onHide={() => setEditPostOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={editPostText}
              onChange={(e) => setEditPostText(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setEditPostOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEditPost}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
