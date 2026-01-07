import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFolder } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { categoriesAPI } from '../config/api';
import { getImageUrl } from '../utils/imageUrl';
import '../styles/Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      setCategories(response.data.data.categories);
      setTotalPages(response.data.data.pagination.pages);
      setTotalCategories(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setThumbnailFile(null);
    setThumbnailPreview(category.thumbnailUrl ? getImageUrl(category.thumbnailUrl) : null);
    setShowModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let category;

      if (selectedCategory) {
        // Update category
        const response = await categoriesAPI.update(selectedCategory._id, formData);
        category = response.data.data.category;
      } else {
        // Create category
        const response = await categoriesAPI.create(formData);
        category = response.data.data.category;
      }

      // Upload thumbnail if selected
      if (thumbnailFile && category._id) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnailFile);

        await categoriesAPI.uploadThumbnail(category._id, formData);
      }

      setShowModal(false);
      setFormData({ name: '', description: '' });
      setThumbnailFile(null);
      setThumbnailPreview(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    try {
      await categoriesAPI.delete(selectedCategory._id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const columns = [
    {
      label: 'Thumbnail',
      field: 'thumbnail',
      render: (category) => {
        const thumbnailUrl = category.thumbnailUrl ? getImageUrl(category.thumbnailUrl) : null;
        return (
          <div className="category-thumbnail-cell">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={category.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="thumbnail-fallback" style={{ display: thumbnailUrl ? 'none' : 'flex' }}>
              <FiFolder />
            </div>
          </div>
        );
      },
    },
    {
      label: 'Name',
      field: 'name',
      render: (category) => (
        <div className="category-cell">
          <span className="category-name">{category.name}</span>
        </div>
      ),
    },
    {
      label: 'Description',
      field: 'description',
      render: (category) => category.description || 'No description',
    },
    {
      label: 'Images Count',
      field: 'imageCount',
      render: (category) => category.imageCount || 0,
    },
    {
      label: 'Created',
      field: 'createdAt',
      render: (category) => new Date(category.createdAt).toLocaleDateString(),
    },
  ];

  const actions = (category) => (
    <>
      <button
        onClick={() => openEditModal(category)}
        className="action-button edit"
        title="Edit Category"
      >
        <FiEdit2 />
      </button>
      <button
        onClick={() => openDeleteModal(category)}
        className="action-button delete"
        title="Delete Category"
      >
        <FiTrash2 />
      </button>
    </>
  );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container">
          <div className="page-header">
            <h1>Categories</h1>
            <button onClick={openCreateModal} className="button button-primary">
              <FiPlus /> Add Category
            </button>
          </div>

          <div className="page-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="page-content">
            <Table
              columns={columns}
              data={categories}
              actions={actions}
              loading={loading}
              emptyMessage="No categories found"
            />

            {!loading && categories.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalCategories}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter category description (optional)"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail">Category Thumbnail</label>
            {thumbnailPreview && (
              <div className="thumbnail-preview">
                <img src={thumbnailPreview} alt="Thumbnail preview" />
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="remove-thumbnail-button"
                  title="Remove thumbnail"
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="file-input"
            />
            <p className="help-text">Upload an image for this category (optional)</p>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="button button-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              {selectedCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Category"
        size="small"
      >
        <div className="modal-message">
          <p>
            Are you sure you want to delete category{' '}
            <strong>{selectedCategory?.name}</strong>?
          </p>
          <p className="warning-text">
            All images in this category will be moved to "Uncategorized".
          </p>
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
    </div>
  );
};

export default Categories;
