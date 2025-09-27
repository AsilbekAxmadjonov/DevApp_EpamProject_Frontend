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

export default function PostCard({ post }) {
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [editPostOpen, setEditPostOpen] = useState(false);
  const [editPostText, setEditPostText] = useState(post.content || "");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const { request } = useFetch();
  const { userId, firstName, lastName, username } = useContext(AuthContext);

  const isMyPost =
    Number(post.userId) === Number(userId) || post.username === username;

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const commentsData = await request(
          `/api/v1/comments/posts/${post.id}/getCommentsByPost`,
          "GET"
        );
        const withAuthors = await Promise.all(
          (commentsData || []).map(async (comment) => {
            try {
              const author = await request(
                `/api/v1/user/${comment.userId}`,
                "GET"
              );
              return { ...comment, author };
            } catch {
              return { ...comment, author: null };
            }
          })
        );
        setComments(withAuthors);
      } catch {
        toast.error("Failed to load comments");
      }
    })();
  }, [post.id, request]);

  useEffect(() => {
    (async () => {
      try {
        const likeCount = await request(
          `/api/v1/likes/post/${post.id}/likesCount`,
          "GET"
        );
        setLikesCount(Number.isFinite(likeCount) ? likeCount : 0);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [post.id, request]);

  const handleLike = async () => {
    try {
      if (!isLiked) {
        await request(`/api/v1/likes/like`, "POST", {
          userId,
          postId: post.id,
        });
        setLikesCount((prev) => prev + 1);
      } else {
        await request(`/api/v1/likes/unlike`, "POST", {
          userId,
          postId: post.id,
        });
        setLikesCount((prev) => Math.max(0, prev - 1));
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update like status");
    }
  };

  const handleCommentSubmit = async (id) => {
    if (!newComment.trim()) return;
    try {
      const created = await request(
        `/api/v1/comments/posts/${id}/create`,
        "POST",
        { content: newComment }
      );
      const author = await request(`/api/v1/user/${created.userId}`, "GET");
      setComments((prev) => [...prev, { ...created, author }]);
      setNewComment("");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const speech = new SpeechSynthesisUtterance(
      `${post.title ?? ""}. ${post.content ?? ""}`
    );
    const voice = voices.find((v) => v.lang.startsWith("en"));
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
  const deletePost = async () => {
    toast.info("Coming soon...");
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
      setComments((prev) => prev.filter((x) => x.id !== c.id));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <Card className="shadow-lg border-0 glass text-white">
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
              <h6 className="mb-0 truncate">
                {firstName} {lastName}
              </h6>
              <small className="opacity-75">{post.username}</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <small className="opacity-75">
              {new Date(post.createdAt).toLocaleDateString()}
            </small>
            {isMyPost && (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-white p-0">
                  <ThreeDots />
                </Dropdown.Toggle>
                <Dropdown.Menu className="px-2">
                  <Dropdown.Item onClick={openEditPost}>
                    Edit Post
                  </Dropdown.Item>
                  <Dropdown.Item onClick={deletePost} className="text-danger">
                    Delete Post
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
            className="d-flex align-items-center gap-1 rounded-pill"
          >
            {isLiked ? <HeartFill /> : <Heart />}
            <span>{likesCount}</span>
          </Button>

          <Button
            variant={showComments ? "light" : "outline-light"}
            size="sm"
            onClick={() => setShowComments(!showComments)}
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

        <Collapse in={showComments}>
          <div className="mt-3">
            <div className="mb-3 d-flex flex-column gap-2">
              {comments.map((comment) => {
                const mine = Number(comment.userId) === Number(userId);
                return (
                  <div key={comment.id} className="p-3 rounded-3 glass">
                    <div className="d-flex align-items-start gap-2 mb-1">
                      {comment.author?.profilePhoto ? (
                        <Image
                          src={`data:image/jpg;base64,${comment.author.profilePhoto}`}
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
                            {comment.author
                              ? `${comment.author.firstName} ${comment.author.lastName}`
                              : "Unknown"}
                          </strong>
                          <small className="opacity-75 ms-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </small>
                        </div>

                        {editingCommentId === comment.id ? (
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
                                onClick={() => saveEditComment(comment)}
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
                            {comment.content}
                          </p>
                        )}
                      </div>

                      {mine && editingCommentId !== comment.id && (
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            variant="link"
                            className="text-white p-0"
                          >
                            <ThreeDots />
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="px-2">
                            <Dropdown.Item
                              onClick={() => startEditComment(comment)}
                            >
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="text-danger"
                              onClick={() => removeComment(comment)}
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

      {/* Edit Post Modal */}
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
