import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiFolder,
  FiImage,
  FiUpload,
  FiLogOut,
  FiMenu,
  FiX,
  FiHeart,
  FiAlertTriangle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard', admin: false },
    { path: '/users', icon: FiUsers, label: 'Users', admin: true },
    { path: '/categories', icon: FiFolder, label: 'Categories', admin: false },
    { path: '/images', icon: FiImage, label: 'Images', admin: false },
    { path: '/favorites', icon: FiHeart, label: 'Favorites', admin: false },
    { path: '/upload', icon: FiUpload, label: 'Upload', admin: false },
    { path: '/reports', icon: FiAlertTriangle, label: 'Reports', admin: true },
  ];

  const filteredMenuItems = user?.role === 'admin'
    ? menuItems
    : menuItems.filter(item => !item.admin);

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <h2>Khalafiati</h2>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <FiLogOut className="sidebar-icon" />
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
