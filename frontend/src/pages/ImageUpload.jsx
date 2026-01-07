import { useState, useEffect, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { imagesAPI, categoriesAPI } from '../config/api';
import '../styles/ImageUpload.css';

const ImageUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll({ limit: 100 });
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    const filesWithPreview = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setSelectedFiles([...selectedFiles, ...filesWithPreview]);
    setError('');
  };

  const handleRemoveFile = (id) => {
    setSelectedFiles(selectedFiles.filter((file) => file.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please drop valid image files');
      return;
    }

    const filesWithPreview = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setSelectedFiles([...selectedFiles, ...filesWithPreview]);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }


    setUploading(true);
    setError('');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const formDataToSend = new FormData();
        formDataToSend.append('image', selectedFiles[i].file);
        // Auto-generate title from filename
        const filename = selectedFiles[i].file.name.replace(/\.[^/.]+$/, '');
        formDataToSend.append('title', filename);
        if (formData.categoryId) {
          formDataToSend.append('categoryId', formData.categoryId);
        }

        await imagesAPI.upload(formDataToSend);
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Reset form
      setFormData({ categoryId: '' });
      setSelectedFiles([]);
      setUploadProgress(0);

      // Redirect to images page
      setTimeout(() => {
        navigate('/images');
      }, 1000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container">
          <div className="page-header">
            <h1>Upload Images</h1>
          </div>

          <div className="upload-container">
            <form onSubmit={handleSubmit} className="upload-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-section">
                <h3>Image Details</h3>

                <div className="form-group">
                  <label htmlFor="category">Category (Optional)</label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>Select Images</h3>

                <div
                  className="drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <FiUpload className="drop-icon" />
                  <p>Click to browse or drag and drop images here</p>
                  <p className="drop-hint">Support: JPG, PNG, GIF, WebP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="preview-grid">
                    {selectedFiles.map((file) => (
                      <div key={file.id} className="preview-item">
                        <img src={file.preview} alt="Preview" />
                        <button
                          type="button"
                          className="remove-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(file.id);
                          }}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p>Uploading... {uploadProgress}%</p>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/images')}
                  className="button button-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={uploading || selectedFiles.length === 0}
                >
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
