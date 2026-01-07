import { useState, useEffect, useRef } from 'react';
import { FiBell, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../styles/NotificationsDropdown.css';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // TODO: استدعاء API الإشعارات
      // const response = await notificationsAPI.getRecent(5);
      // setNotifications(response.data.data.notifications);
      // setUnreadCount(response.data.data.unreadCount);

      // Mock data للاختبار
      setNotifications([
        {
          _id: '1',
          title: 'مستخدم جديد',
          message: 'انضم مستخدم جديد للموقع',
          type: 'user',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'صورة جديدة',
          message: 'تم رفع صورة جديدة في فئة الطبيعة',
          type: 'image',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: '3',
          title: 'بلاغ جديد',
          message: 'تم تقديم بلاغ على صورة',
          type: 'report',
          isRead: true,
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
      setUnreadCount(2);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // TODO: استدعاء API لتحديد كمقروء
      // await notificationsAPI.markAsRead(notificationId);

      // Update UI
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: استدعاء API لتحديد الكل كمقروء
      // await notificationsAPI.markAllAsRead();

      // Update UI
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setIsOpen(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      user: '👤',
      image: '🖼️',
      report: '🚨',
      like: '❤️',
      comment: '💬',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      <button
        className="notifications-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="الإشعارات"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-menu">
          <div className="notifications-header">
            <h3>الإشعارات</h3>
            <div className="notifications-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read">
                  تحديد الكل كمقروء
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="close-button">
                <FiX size={18} />
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <div className="spinner"></div>
                <p>جاري التحميل...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <FiBell size={48} />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <Link to="/notifications" className="view-all-link" onClick={() => setIsOpen(false)}>
              عرض جميع الإشعارات
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
