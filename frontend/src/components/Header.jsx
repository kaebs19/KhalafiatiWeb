import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import NotificationsDropdown from './NotificationsDropdown';
import { getAvatarUrl } from '../utils/imageUrl';
import '../styles/Header.css';

// Header component with user avatar support
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Close menu when clicking outside
  const handleClickOutside = () => {
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  };

  return (
    <header className="header" onClick={handleClickOutside}>
      <div className="header-content">
        <div className="header-left">
          <h1 className="page-title">Welcome back, {user?.username}!</h1>
        </div>

        <div className="header-right">
          <NotificationsDropdown />

          <div className="user-menu" onClick={(e) => e.stopPropagation()}>
            <div className="user-menu-trigger" onClick={toggleUserMenu}>
              <div className="user-avatar">
                {getAvatarUrl(user) ? (
                  <img
                    src={getAvatarUrl(user)}
                    alt={user?.username}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('fallback');
                    }}
                  />
                ) : null}
                <FiUser className="avatar-icon" />
              </div>
              <div className="user-info">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <FiChevronDown className={`dropdown-icon ${showUserMenu ? 'open' : ''}`} />
            </div>

            {showUserMenu && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={() => navigate('/settings')}>
                  <FiSettings />
                  <span>Settings</span>
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
