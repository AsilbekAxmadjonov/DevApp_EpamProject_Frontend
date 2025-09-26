import { Card, Button, Form, Collapse, Image } from 'react-bootstrap';
import { Heart, HeartFill, Chat, PersonCircle, VolumeUp, VolumeMute } from 'react-bootstrap-icons';
import { useState, useEffect, useContext } from 'react';
import { useFetch } from '../hooks/useFetch';
import { AuthContext } from '../context/AuthContext';

export default function PostCard({ post }) {
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const { request } = useFetch();
  const { userId } = useContext(AuthContext);
  const { firstName, lastName } = useContext(AuthContext);

  // Load speech voices
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  // Fetch comments with author info
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await request(`/api/v1/comments/posts/${post.id}/getCommentsByPost`, 'GET');
        
        // Fetch each author's user info
        const commentsWithAuthor = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const author = await request(`/api/v1/user/${comment.userId}`, 'GET');
              return { ...comment, author };
            } catch (err) {
              console.error('Error fetching user for comment', err);
              return { ...comment, author: null };
            }
          })
        );

        setComments(commentsWithAuthor);
      } catch (err) {
        console.error('Error fetching comments', err);
      }
    };
    fetchComments();
  }, [post.id, request]);

  // Fetch likes count
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likeCount = await request(`/api/v1/likes/post/${post.id}/likesCount`, 'GET');
        setLikesCount(likeCount);
      } catch (err) {
        console.error('Error fetching like counts', err);
      }
    };
    fetchLikes();
  }, [post.id, request]);

  const handleLike = async () => {
    try {
      if (!isLiked) {
        await request(`/api/v1/likes/like`, 'POST', { userId, postId: post.id });
        setLikesCount(prev => prev + 1);
      } else {
        await request(`/api/v1/likes/unlike`, 'POST', { userId, postId: post.id });
        setLikesCount(prev => Math.max(0, prev - 1));
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Error liking/unliking post', err);
    }
  };

  const handleCommentSubmit = async (id) => {
    // e.preventDefault();
    // if (!newComment.trim()) return;

    const commentPayload = { content: newComment };

    try {
      console.log('Posting comment with payload:', commentPayload);
      const comment = await request(`/api/v1/comments/posts/${id}/create`, 'POST', commentPayload);
      console.log('Created comment:', comment);

      // Fetch author info for the new comment
      const author = await request(`/api/v1/user/${comment.userId}`, 'GET');
      setComments(prev => [...prev, { ...comment, author }]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment', err);
      alert('Failed to post comment. Please try again.');
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const speech = new SpeechSynthesisUtterance(`${post.title}. ${post.content}`);
    const voice = voices.find(v => v.lang.startsWith('en'));
    if (voice) speech.voice = voice;
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(speech);
    setIsSpeaking(true);
  };

  return (
    <Card className="mb-4 shadow-lg rounded-3xl overflow-hidden border border-gray-300">
      {post.image && (
        <Card.Img
          style={{ width: '100%', objectFit: 'cover', maxHeight: '400px' }}
          variant="top"
          src={`data:image/jpg;base64,${post.image}`}
        />
      )}

      <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom-0">
        <div>
          <Card.Title className="mb-1">{post.title}</Card.Title>
          <div className="d-flex align-items-center gap-2 border-bottom">
            <h6>{firstName} {lastName}</h6>
            <small className="text-muted font-bold mb-[8px]">{post.username}</small>
          </div>
        </div>
        <small className="text-muted">{new Date(post.createdAt).toLocaleDateString()}</small>
      </Card.Header>

      <Card.Body>
        <Card.Text className="mb-4">{post.content}</Card.Text>

        <div className="d-flex gap-2 mb-3">
          <Button
            variant={isLiked ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={handleLike}
            className="d-flex align-items-center gap-1 rounded-pill shadow-sm"
          >
            {isLiked ? <HeartFill /> : <Heart />}
            <span>{likesCount}</span>
          </Button>

          <Button
            variant={showComments ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="d-flex align-items-center gap-1 rounded-pill shadow-sm"
          >
            <Chat />
            <span>{comments.length}</span>
          </Button>

          <Button
            variant={isSpeaking ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={handleReadAloud}
            className="d-flex align-items-center rounded-pill shadow-sm"
          >
            {isSpeaking ? <VolumeMute /> : <VolumeUp />}
          </Button>
        </div>

        <Collapse in={showComments}>
          <div className="mt-3">
            <div className="mb-3 d-flex flex-column gap-2">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 border rounded-2xl bg-gray-50 d-flex flex-column gap-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {comment.author?.profilePhoto
                      ? <Image src={`data:image/jpg;base64,${comment.author.profilePhoto}`} roundedCircle width={30} height={30} />
                      : <PersonCircle size={30} />}
                    <strong>{comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'Unknown'}</strong>
                    <small className="text-muted ms-auto">{new Date(comment.createdAt).toLocaleDateString()}</small>
                  </div>
                  <p className="mb-0">{comment.content}</p>
                </div>
              ))}
            </div>

            <Form onSubmit={(e) => {e.preventDefault();handleCommentSubmit(post.id)}}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="rounded-2xl shadow-sm"
                />
              </Form.Group>
              <Button type="submit" size="sm" className="rounded-pill shadow-sm">
                Post Comment
              </Button>
            </Form>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
}
