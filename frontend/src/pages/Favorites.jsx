import { useState, useEffect } from 'react';
import { FiHeart, FiImage as FiImageIcon } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import LikeButton from '../components/LikeButton';
import { likesAPI } from '../config/api';
import '../styles/Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchFavorites();
  }, [currentPage]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await likesAPI.getMyLikes({
        page: currentPage,
        limit: itemsPerPage
      });

      if (response.data.success) {
        setFavorites(response.data.data.images || []);
        setTotalPages(response.data.data.pagination.pages);
        setTotalItems(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = () => {
    // Refresh the list after unliking
    fetchFavorites();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container favorites-page">
          <div className="page-header">
            <div className="page-title-section">
              <FiHeart className="page-icon" />
              <div>
                <h1>صوري المفضلة</h1>
                <p className="page-subtitle">
                  {totalItems} صورة مفضلة
                </p>
              </div>
            </div>
          </div>

          <div className="page-content">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>جاري التحميل...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="empty-state">
                <FiHeart className="empty-icon" />
                <h3>لا توجد صور مفضلة بعد</h3>
                <p>ابدأ بإضافة صور إلى المفضلة لتظهر هنا</p>
                <a href="/images" className="button button-primary">
                  تصفح الصور
                </a>
              </div>
            ) : (
              <>
                <div className="favorites-grid">
                  {favorites.map((image) => (
                    <div key={image._id} className="favorite-card">
                      <div className="image-wrapper">
                        <img
                          src={`http://localhost:5001${image.imageUrl}`}
                          alt={image.title}
                          loading="lazy"
                        />
                        <div className="image-overlay">
                          <div className="image-actions">
                            <LikeButton
                              imageId={image._id}
                              initialLiked={true}
                              initialCount={image.likesCount}
                              onLikeChange={handleUnlike}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="favorite-info">
                        <h3 className="image-title">{image.title}</h3>
                        {image.description && (
                          <p className="image-description">
                            {image.description.length > 80
                              ? `${image.description.substring(0, 80)}...`
                              : image.description}
                          </p>
                        )}
                        <div className="image-meta">
                          <span className="meta-item">
                            <FiImageIcon />
                            {image.category?.name || 'غير مصنف'}
                          </span>
                          <span className="meta-item">
                            <FiHeart />
                            {image.likesCount} إعجاب
                          </span>
                        </div>
                        {image.uploadedBy && (
                          <div className="uploader-info">
                            <div className="uploader-avatar">
                              {image.uploadedBy.avatar ? (
                                <img src={image.uploadedBy.avatar} alt={image.uploadedBy.username} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {image.uploadedBy.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="uploader-name">
                              {image.uploadedBy.fullName || image.uploadedBy.username}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
