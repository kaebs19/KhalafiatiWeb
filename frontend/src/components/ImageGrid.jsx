import { useState } from 'react';
import { FiHeart, FiMessageCircle, FiX, FiUser, FiCalendar } from 'react-icons/fi';
import LikeButton from './LikeButton';
import ReportModal from './ReportModal';
import '../styles/ImageGrid.css';

const ImageGrid = ({ images, columns = 3, gap = 16, onImageClick, showActions = true }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportImageId, setReportImageId] = useState(null);

  const handleImageClick = (image) => {
    if (onImageClick) {
      onImageClick(image);
    } else {
      setSelectedImage(image);
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleReport = (imageId) => {
    setReportImageId(imageId);
    setShowReportModal(true);
  };

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`
  };

  return (
    <>
      <div className="image-grid" style={gridStyle}>
        {images.map((image) => (
          <div
            key={image._id}
            className="image-grid-item"
            onClick={() => handleImageClick(image)}
          >
            <div className="image-container">
              <img
                src={`http://localhost:5001${image.imageUrl}`}
                alt={image.title}
                loading="lazy"
              />
              <div className="image-overlay">
                <div className="overlay-stats">
                  <span className="stat">
                    <FiHeart /> {image.likesCount || 0}
                  </span>
                  <span className="stat">
                    <FiMessageCircle /> {image.views || 0}
                  </span>
                </div>
                {showActions && (
                  <div className="overlay-actions">
                    <LikeButton
                      imageId={image._id}
                      initialLiked={false}
                      initialCount={image.likesCount || 0}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="image-meta">
              <h4 className="image-title">{image.title}</h4>
              {image.uploadedBy && (
                <div className="image-author">
                  <div className="author-avatar">
                    {image.uploadedBy.avatar ? (
                      <img src={image.uploadedBy.avatar} alt="" />
                    ) : (
                      <div className="avatar-placeholder">
                        {image.uploadedBy.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="author-name">
                    {image.uploadedBy.fullName || image.uploadedBy.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={handleCloseModal}>
          <div className="modal-backdrop">
            <button className="modal-close" onClick={handleCloseModal}>
              <FiX />
            </button>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-image-section">
                <img
                  src={`http://localhost:5001${selectedImage.imageUrl}`}
                  alt={selectedImage.title}
                />
              </div>
              <div className="modal-info-section">
                {/* Header */}
                <div className="info-header">
                  {selectedImage.uploadedBy && (
                    <div className="user-info-header">
                      <div className="user-avatar-large">
                        {selectedImage.uploadedBy.avatar ? (
                          <img src={selectedImage.uploadedBy.avatar} alt="" />
                        ) : (
                          <div className="avatar-placeholder">
                            {selectedImage.uploadedBy.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="user-fullname">
                          {selectedImage.uploadedBy.fullName}
                        </div>
                        <div className="user-username">
                          @{selectedImage.uploadedBy.username}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="info-content">
                  <h2 className="image-detail-title">{selectedImage.title}</h2>
                  {selectedImage.description && (
                    <p className="image-detail-description">
                      {selectedImage.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="image-detail-stats">
                    <div className="stat-item">
                      <FiHeart />
                      <span>{selectedImage.likesCount || 0} إعجاب</span>
                    </div>
                    <div className="stat-item">
                      <FiMessageCircle />
                      <span>{selectedImage.views || 0} مشاهدة</span>
                    </div>
                    <div className="stat-item">
                      <FiCalendar />
                      <span>{new Date(selectedImage.createdAt).toLocaleDateString('ar')}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div className="image-tags">
                      {selectedImage.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category */}
                  {selectedImage.category && (
                    <div className="image-category-info">
                      <strong>القسم:</strong> {selectedImage.category.name}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="info-actions">
                  <LikeButton
                    imageId={selectedImage._id}
                    initialLiked={false}
                    initialCount={selectedImage.likesCount || 0}
                  />
                  <button
                    className="report-button"
                    onClick={() => handleReport(selectedImage._id)}
                  >
                    إبلاغ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        type="image"
        itemId={reportImageId}
        itemName={images.find(img => img._id === reportImageId)?.title}
      />
    </>
  );
};

export default ImageGrid;
