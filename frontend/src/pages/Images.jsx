import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiTrash2, FiMove, FiFilter } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { imagesAPI, categoriesAPI } from '../config/api';
import { getImageUrl } from '../utils/imageUrl';
import '../styles/Images.css';

const Images = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const itemsPerPage = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await imagesAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: selectedCategory,
        sortBy: sortBy,
      });

      setImages(response.data.data.images);
      setTotalPages(response.data.data.pagination.pages);
      setTotalImages(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll({ limit: 100 });
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const openDeleteModal = (image) => {
    setSelectedImage(image);
    setShowDeleteModal(true);
  };

  const openMoveModal = (image) => {
    setSelectedImage(image);
    setTargetCategoryId('');
    setShowMoveModal(true);
  };

  const handleDelete = async () => {
    try {
      await imagesAPI.delete(selectedImage._id);
      setShowDeleteModal(false);
      setSelectedImage(null);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleMove = async () => {
    if (!targetCategoryId) {
      alert('Please select a category');
      return;
    }

    try {
      await imagesAPI.move(selectedImage._id, targetCategoryId);
      setShowMoveModal(false);
      setSelectedImage(null);
      setTargetCategoryId('');
      fetchImages();
    } catch (error) {
      console.error('Error moving image:', error);
      alert(error.response?.data?.message || 'Failed to move image');
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container">
          <div className="page-header">
            <h1>Images Gallery</h1>
          </div>

          <div className="page-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="filter-box">
              <FiFilter className="filter-icon" />
              <select value={selectedCategory} onChange={handleCategoryFilter}>
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-box">
              <FiFilter className="filter-icon" />
              <select value={sortBy} onChange={handleSortChange}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostLiked">Most Liked</option>
                <option value="mostViewed">Most Viewed</option>
              </select>
            </div>
          </div>

          <div className="page-content">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="empty-state">
                <p>No images found</p>
              </div>
            ) : (
              <>
                <div className="images-grid">
                  {images.map((image) => (
                    <div key={image._id} className="image-item">
                      <Link to={`/images/${image._id}`} className="image-thumbnail-link">
                        <div className="image-thumbnail">
                          <img
                            src={getImageUrl(image.imageUrl || image.url || image.path)}
                            alt={image.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                            }}
                          />
                          <div className="image-overlay">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                openMoveModal(image);
                              }}
                              className="overlay-button"
                              title="Move to Category"
                            >
                              <FiMove />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                openDeleteModal(image);
                              }}
                              className="overlay-button delete"
                              title="Delete Image"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </Link>
                      <div className="image-details">
                        <h4 className="image-title">{image.title}</h4>
                        <p className="image-category">
                          {image.category?.name || 'Uncategorized'}
                        </p>
                        <p className="image-uploader">
                          By{' '}
                          {image.uploadedBy ? (
                            <Link
                              to={`/users/${image.uploadedBy._id}`}
                              className="user-link"
                            >
                              {image.uploadedBy.username}
                            </Link>
                          ) : (
                            'Unknown'
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalImages}
                  itemsPerPage={itemsPerPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Image"
        size="small"
      >
        <div className="modal-message">
          <p>
            Are you sure you want to delete <strong>{selectedImage?.title}</strong>?
          </p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="button button-secondary"
          >
            Cancel
          </button>
          <button onClick={handleDelete} className="button button-danger">
            Delete
          </button>
        </div>
      </Modal>

      {/* Move Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Move Image to Category"
      >
        <div className="move-modal-content">
          <p>
            Move <strong>{selectedImage?.title}</strong> to:
          </p>
          <div className="form-group">
            <label htmlFor="targetCategory">Select Category</label>
            <select
              id="targetCategory"
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="form-select"
            >
              <option value="">Select a category</option>
              {categories
                .filter((cat) => cat._id !== selectedImage?.category?._id)
                .map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button
            onClick={() => setShowMoveModal(false)}
            className="button button-secondary"
          >
            Cancel
          </button>
          <button onClick={handleMove} className="button button-primary">
            Move
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Images;
