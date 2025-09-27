import { Card, Button, Form, Collapse, Image } from "react-bootstrap";
import {
  Heart,
  HeartFill,
  Chat,
  PersonCircle,
  VolumeUp,
  VolumeMute,
} from "react-bootstrap-icons";
import { useState, useEffect, useContext } from "react";
import { useFetch } from "../hooks/useFetch";
import { AuthContext } from "../context/AuthContext";

export default function PostCard({ post }) {
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const { request } = useFetch();
  const { userId, firstName, lastName } = useContext(AuthContext);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await request(
          `/api/v1/comments/posts/${post.id}/getCommentsByPost`,
          "GET"
        );
        const commentsWithAuthor = await Promise.all(
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
        setComments(commentsWithAuthor);
      } catch (err) {
        console.log(err);
      }
    };
    fetchComments();
  }, [post.id, request]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likeCount = await request(
          `/api/v1/likes/post/${post.id}/likesCount`,
          "GET"
        );
        setLikesCount(Number.isFinite(likeCount) ? likeCount : 0);
      } catch (err) {
        console.log(err);
      }
    };
    fetchLikes();
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
      console.log(err);
    }
  };

  const handleCommentSubmit = async (id) => {
    const commentPayload = { content: newComment };
    if (!newComment.trim()) return;

    try {
      const comment = await request(
        `/api/v1/comments/posts/${id}/create`,
        "POST",
        commentPayload
      );
      const author = await request(`/api/v1/user/${comment.userId}`, "GET");
      setComments((prev) => [...prev, { ...comment, author }]);
      setNewComment("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    } else {
      const speech = new SpeechSynthesisUtterance(
        `${post.title}. ${post.content}`
      );
      const voice = voices.find((v) => v.lang.startsWith("en"));
      if (voice) speech.voice = voice;
      speech.onend = () => setIsSpeaking(false);
      speech.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(speech);
    }
    setIsSpeaking((s) => !s);
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
          <div>
            <Card.Title className="mb-1">{post.title}</Card.Title>
            <div className="d-flex align-items-center gap-2 border-bottom border-white/25 pb-1">
              <h6 className="mb-0">
                {firstName} {lastName}
              </h6>
              <small className="opacity-75">{post.username}</small>
            </div>
          </div>
          <small className="opacity-75">
            {new Date(post.createdAt).toLocaleDateString()}
          </small>
        </div>

        <Card.Text className="mb-3 opacity-95">{post.content}</Card.Text>

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
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-3 glass">
                  <div className="d-flex align-items-center gap-2 mb-1">
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
                    <strong>
                      {comment.author
                        ? `${comment.author.firstName} ${comment.author.lastName}`
                        : "Unknown"}
                    </strong>
                    <small className="opacity-75 ms-auto">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="mb-0">{comment.content}</p>
                </div>
              ))}
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
    </Card>
  );
}
