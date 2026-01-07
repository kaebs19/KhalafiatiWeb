import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiImage, FiHeart, FiCalendar, FiMail, FiUser } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { usersAPI, imagesAPI } from '../config/api';
import { getAvatarUrl, getCoverUrl, getImageUrl } from '../utils/imageUrl';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchUserImages();
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getById(id);
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserImages = async () => {
    setImagesLoading(true);
    try {
      const response = await imagesAPI.getAll({
        uploadedBy: id,
        limit: 50
      });
      setUserImages(response.data.data.images);
    } catch (error) {
      console.error('Error fetching user images:', error);
    } finally {
      setImagesLoading(false);
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
            <p>Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="empty-state">
            <p>User not found</p>
            <button onClick={() => navigate('/users')} className="back-button">
              Go Back
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
          <button onClick={() => navigate('/users')} className="back-button">
            <FiArrowLeft />
            Back to Users
          </button>

          {/* User Profile Header */}
          <div className="profile-header">
            {/* Cover Image */}
            <div className="profile-cover">
              {getCoverUrl(user) ? (
                <img
                  src={getCoverUrl(user)}
                  alt="Cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1200x300?text=No+Cover+Image';
                  }}
                />
              ) : (
                <div className="cover-placeholder">
                  <span>No Cover Image</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="profile-info-section">
              <div className="profile-avatar-container">
                <div className="profile-avatar">
                  {getAvatarUrl(user) ? (
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.username}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="avatar-fallback-large"
                    style={{ display: getAvatarUrl(user) ? 'none' : 'flex' }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="profile-details">
                <div className="profile-name-section">
                  <h1 className="profile-username">{user.username}</h1>
                  {user.fullName && user.fullName !== user.username && (
                    <p className="profile-fullname">{user.fullName}</p>
                  )}
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </div>

                {user.bio && (
                  <p className="profile-bio">{user.bio}</p>
                )}

                <div className="profile-meta">
                  <div className="meta-item">
                    <FiMail />
                    <span>{user.email}</span>
                  </div>
                  <div className="meta-item">
                    <FiCalendar />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {user.status && (
                    <div className="meta-item">
                      <FiUser />
                      <span className={`status-badge ${user.status}`}>
                        {user.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {user.socialMedia && Object.values(user.socialMedia).some(val => val) && (
                  <div className="social-media-links">
                    <h3>Social Media:</h3>
                    <div className="social-links">
                      {user.socialMedia.facebook && (
                        <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                          Facebook
                        </a>
                      )}
                      {user.socialMedia.twitter && (
                        <a href={user.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                          Twitter
                        </a>
                      )}
                      {user.socialMedia.instagram && (
                        <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                          Instagram
                        </a>
                      )}
                      {user.socialMedia.website && (
                        <a href={user.socialMedia.website} target="_blank" rel="noopener noreferrer">
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-icon">
                <FiImage />
              </div>
              <div className="stat-info">
                <h3>{user.uploadCount || userImages.length || 0}</h3>
                <p>Images Uploaded</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FiHeart />
              </div>
              <div className="stat-info">
                <h3>{user.stats?.totalLikes || user.totalLikes || 0}</h3>
                <p>Total Likes</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FiImage />
              </div>
              <div className="stat-info">
                <h3>{user.stats?.imagesCount || user.imagesCount || 0}</h3>
                <p>Total Images</p>
              </div>
            </div>
          </div>

          {/* User Images Gallery */}
          <div className="user-images-section">
            <h2 className="section-title">
              <FiImage />
              User Images ({userImages.length})
            </h2>

            {imagesLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading images...</p>
              </div>
            ) : userImages.length === 0 ? (
              <div className="empty-state">
                <FiImage size={48} />
                <p>No images uploaded yet</p>
              </div>
            ) : (
              <div className="user-images-grid">
                {userImages.map((image) => (
                  <div key={image._id} className="user-image-item">
                    <div className="image-thumbnail">
                      <img
                        src={getImageUrl(image.imageUrl || image.url || image.path)}
                        alt={image.title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image';
                        }}
                      />
                    </div>
                    <div className="image-info">
                      <h4>{image.title}</h4>
                      <div className="image-stats">
                        <span>
                          <FiHeart /> {image.likesCount || 0}
                        </span>
                        <span>
                          👁️ {image.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
