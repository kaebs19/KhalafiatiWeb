import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiCalendar, FiShield, FiImage } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { usersAPI, imagesAPI } from '../config/api';
import '../styles/UserDetails.css';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
    fetchUserImages();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await usersAPI.getById(id);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserImages = async () => {
    try {
      const response = await imagesAPI.getAll({ userId: id });
      setUserImages(response.data.data.images || []);
    } catch (error) {
      console.error('Error fetching user images:', error);
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
            <p>Loading user details...</p>
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
          <div className="error-container">
            <p>User not found</p>
            <button onClick={() => navigate('/users')} className="button">
              Back to Users
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
          <div className="page-header">
            <button onClick={() => navigate('/users')} className="back-button">
              <FiArrowLeft />
              Back to Users
            </button>
          </div>

          <div className="user-details-container">
            <div className="user-details-card">
              <div className="user-profile">
                <div className="user-avatar-large">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <h2>{user.username}</h2>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
                <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
                  {user.isBanned ? 'Banned' : 'Active'}
                </span>
              </div>

              <div className="user-info-grid">
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FiCalendar className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Joined</span>
                    <span className="info-value">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <FiShield className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Role</span>
                    <span className="info-value">{user.role}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FiImage className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Total Images</span>
                    <span className="info-value">{userImages.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="user-images-section">
              <h3>User Images</h3>
              {userImages.length === 0 ? (
                <p className="empty-message">No images uploaded yet</p>
              ) : (
                <div className="images-grid">
                  {userImages.map((image) => (
                    <div key={image._id} className="image-card">
                      <img src={image.url} alt={image.title} />
                      <div className="image-info">
                        <p className="image-title">{image.title}</p>
                        <p className="image-category">{image.category?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
