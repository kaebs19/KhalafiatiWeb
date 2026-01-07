import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { likesAPI } from '../config/api';
import '../styles/LikeButton.css';

const LikeButton = ({ imageId, initialLiked = false, initialCount = 0, onLikeChange }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Check like status when component mounts
    checkLikeStatus();
  }, [imageId]);

  const checkLikeStatus = async () => {
    try {
      const response = await likesAPI.checkLikeStatus(imageId);
      if (response.data.success) {
        setLiked(response.data.data.liked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent parent click events

    if (loading) return;

    setLoading(true);
    setAnimate(true);

    try {
      const response = await likesAPI.toggleLike(imageId);

      if (response.data.success) {
        const newLiked = response.data.data.liked;
        const newCount = response.data.data.likesCount;

        setLiked(newLiked);
        setCount(newCount);

        // Trigger animation
        setTimeout(() => setAnimate(false), 300);

        // Notify parent component
        if (onLikeChange) {
          onLikeChange(newLiked, newCount);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);

      // Check if user is not authenticated
      if (error.response?.status === 401) {
        alert('يرجى تسجيل الدخول أولاً');
        window.location.href = '/login';
      } else {
        alert('فشل في تسجيل الإعجاب. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`like-button ${liked ? 'liked' : ''} ${animate ? 'animate' : ''} ${loading ? 'loading' : ''}`}
      title={liked ? 'إلغاء الإعجاب' : 'إعجاب'}
    >
      <FiHeart className={`like-icon ${liked ? 'filled' : ''}`} />
      {count > 0 && <span className="like-count">{count}</span>}
    </button>
  );
};

export default LikeButton;
