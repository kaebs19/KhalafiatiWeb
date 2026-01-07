import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiEye, FiCalendar, FiFolder, FiUser, FiMessageCircle } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { imagesAPI } from '../config/api';
import { getImageUrl, getAvatarUrl } from '../utils/imageUrl';
import { useAuth } from '../context/AuthContext';
import '../styles/ImageDetail.css';

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchImageDetails();
  }, [id]);

  const fetchImageDetails = async () => {
    setLoading(true);
    try {
      const response = await imagesAPI.getById(id);
      const imageData = response.data.data.image;
      setImage(imageData);
      setLikesCount(imageData.likesCount || 0);
      setIsLiked(imageData.isLikedByUser || false);
    } catch (error) {
      console.error('Error fetching image:', error);
      alert('Failed to load image details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await imagesAPI.unlike(id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await imagesAPI.like(id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like status');
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading image...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="empty-state">
            <p>Image not found</p>
            <button onClick={() => navigate('/images')} className="back-button">
              Go Back to Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container">
          <button onClick={() => navigate('/images')} className="back-button">
            <FiArrowLeft />
            Back to Gallery
          </button>

          <div className="image-detail-container">
            {/* Main Image */}
            <div className="image-display">
              <img
                src={getImageUrl(image.imageUrl || image.url || image.path)}
                alt={image.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }}
              />
            </div>

            {/* Image Info Sidebar */}
            <div className="image-info-sidebar">
              {/* User Info */}
              <div className="uploader-section">
                <Link to={`/users/${image.uploadedBy?._id}`} className="uploader-card">
                  <div className="uploader-avatar">
                    {getAvatarUrl(image.uploadedBy) ? (
                      <img src={getAvatarUrl(image.uploadedBy)} alt={image.uploadedBy?.username} />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <div className="uploader-info">
                    <span className="uploader-name">{image.uploadedBy?.username || 'Unknown'}</span>
                    <span className="uploader-role">{image.uploadedBy?.role || 'user'}</span>
                  </div>
                </Link>
              </div>

              {/* Title & Description */}
              <div className="image-details-section">
                <h1 className="image-detail-title">{image.title}</h1>
                {image.description && (
                  <p className="image-detail-description">{image.description}</p>
                )}
              </div>

              {/* Stats */}
              <div className="image-stats-section">
                <div className="stat-item">
                  <FiHeart className={isLiked ? 'liked' : ''} />
                  <span>{likesCount} Likes</span>
                </div>
                <div className="stat-item">
                  <FiEye />
                  <span>{image.views || 0} Views</span>
                </div>
                <div className="stat-item">
                  <FiMessageCircle />
                  <span>{image.commentsCount || 0} Comments</span>
                </div>
              </div>

              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`like-button ${isLiked ? 'liked' : ''}`}
              >
                <FiHeart />
                {isLiked ? 'Unlike' : 'Like'}
              </button>

              {/* Meta Info */}
              <div className="image-meta-section">
                {image.category && (
                  <div className="meta-item">
                    <FiFolder />
                    <span>{image.category.name}</span>
                  </div>
                )}
                <div className="meta-item">
                  <FiCalendar />
                  <span>Uploaded {new Date(image.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tags */}
              {image.tags && image.tags.length > 0 && (
                <div className="tags-section">
                  <h3>Tags</h3>
                  <div className="tags-list">
                    {image.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;
