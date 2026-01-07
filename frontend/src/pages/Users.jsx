import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiTrash2, FiAlertCircle, FiCheck, FiPlus } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { usersAPI, authAPI } from '../config/api';
import { getAvatarUrl } from '../utils/imageUrl';
import '../styles/Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'user'
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.pages);
      setTotalUsers(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewUser = (user) => {
    navigate(`/users/${user._id}`);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(formData);
      setShowCreateModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'user'
      });
      fetchUsers();
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await usersAPI.delete(selectedUser._id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleBanUser = async () => {
    try {
      await usersAPI.toggleBan(selectedUser._id);
      setShowBanModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error banning/unbanning user:', error);
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const openCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'user'
    });
    setShowCreateModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const columns = [
    {
      label: 'Username',
      field: 'username',
      render: (user) => {
        const avatarUrl = getAvatarUrl(user);
        return (
          <div className="user-cell">
            <div className="user-avatar-small">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.username}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="avatar-fallback" style={{ display: avatarUrl ? 'none' : 'flex' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="user-info-cell">
              <span className="user-name">{user.username}</span>
              {user.fullName && user.fullName !== user.username && (
                <span className="user-fullname">{user.fullName}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      label: 'Email',
      field: 'email',
    },
    {
      label: 'Role',
      field: 'role',
      render: (user) => (
        <span className={`role-badge ${user.role}`}>
          {user.role}
        </span>
      ),
    },
    {
      label: 'Status',
      field: 'isBanned',
      render: (user) => (
        <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
          {user.isBanned ? 'Banned' : 'Active'}
        </span>
      ),
    },
    {
      label: 'Stats',
      field: 'stats',
      render: (user) => (
        <div className="user-stats-cell">
          <span className="stat-item" title="Images">
            📷 {user.stats?.imagesCount || user.imagesCount || 0}
          </span>
          <span className="stat-item" title="Total Likes">
            ❤️ {user.stats?.totalLikes || user.totalLikes || 0}
          </span>
          <span className="stat-item" title="Total Views">
            👁️ {user.stats?.totalViews || user.totalViews || 0}
          </span>
        </div>
      ),
    },
    {
      label: 'Joined',
      field: 'createdAt',
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  const actions = (user) => (
    <>
      <button
        onClick={() => handleViewUser(user)}
        className="action-button view"
        title="View Details"
      >
        <FiEye />
      </button>
      <button
        onClick={() => openBanModal(user)}
        className={`action-button ${user.isBanned ? 'unban' : 'ban'}`}
        title={user.isBanned ? 'Unban User' : 'Ban User'}
      >
        {user.isBanned ? <FiCheck /> : <FiAlertCircle />}
      </button>
      <button
        onClick={() => openDeleteModal(user)}
        className="action-button delete"
        title="Delete User"
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
            <h1>Users Management</h1>
            <button onClick={openCreateModal} className="button button-primary">
              <FiPlus /> Add User
            </button>
          </div>

          <div className="page-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="page-content">
            <Table
              columns={columns}
              data={users}
              actions={actions}
              loading={loading}
              emptyMessage="No users found"
            />

            {!loading && users.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalUsers}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="user-form">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password (min 6 characters)"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="button button-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="small"
      >
        <div className="modal-message">
          <p>Are you sure you want to delete user <strong>{selectedUser?.username}</strong>?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="button button-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteUser}
            className="button button-danger"
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Ban/Unban Confirmation Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        title={selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
        size="small"
      >
        <div className="modal-message">
          <p>
            Are you sure you want to {selectedUser?.isBanned ? 'unban' : 'ban'} user{' '}
            <strong>{selectedUser?.username}</strong>?
          </p>
        </div>
        <div className="modal-actions">
          <button
            onClick={() => setShowBanModal(false)}
            className="button button-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleBanUser}
            className={`button ${selectedUser?.isBanned ? 'button-success' : 'button-warning'}`}
          >
            {selectedUser?.isBanned ? 'Unban' : 'Ban'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
