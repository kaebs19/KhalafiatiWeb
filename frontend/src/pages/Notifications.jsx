import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiFilter } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { notificationsAPI } from '../config/api';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all'); // all, user, image, report, like, comment

  useEffect(() => {
    fetchNotifications();
  }, [filter, selectedType]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};

      // Filter by read status
      if (filter === 'unread') {
        params.isRead = 'false';
      } else if (filter === 'read') {
        params.isRead = 'true';
      }

      // Filter by type
      if (selectedType !== 'all') {
        params.type = selectedType;
      }

      const response = await notificationsAPI.getAll(params);
      setNotifications(response.data.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('فشل تحديد الإشعارات كمقروءة');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار?')) return;

    try {
      await notificationsAPI.delete(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('فشل حذف الإشعار');
    }
  };

  const deleteAllRead = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الإشعارات المقروءة?')) return;

    try {
      await notificationsAPI.clearReadNotifications();
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      alert('فشل حذف الإشعارات');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      user: { emoji: '👤', color: '#10b981' },
      image: { emoji: '🖼️', color: '#3b82f6' },
      report: { emoji: '🚨', color: '#ef4444' },
      like: { emoji: '❤️', color: '#ec4899' },
      comment: { emoji: '💬', color: '#8b5cf6' },
      system: { emoji: '⚙️', color: '#64748b' }
    };
    return icons[type] || icons.system;
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
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container">
          <div className="page-header">
            <div className="header-content">
              <div className="header-title">
                <FiBell size={28} />
                <div>
                  <h1>الإشعارات</h1>
                  {unreadCount > 0 && (
                    <span className="unread-count">{unreadCount} إشعار غير مقروء</span>
                  )}
                </div>
              </div>
              <div className="header-actions">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="button button-secondary">
                    <FiCheck /> تحديد الكل كمقروء
                  </button>
                )}
                {notifications.some(n => n.isRead) && (
                  <button onClick={deleteAllRead} className="button button-outline">
                    <FiTrash2 /> حذف المقروءة
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="notifications-filters">
            <div className="filter-group">
              <label><FiFilter /> الحالة:</label>
              <div className="filter-buttons">
                <button
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => setFilter('all')}
                >
                  الكل ({notifications.length})
                </button>
                <button
                  className={filter === 'unread' ? 'active' : ''}
                  onClick={() => setFilter('unread')}
                >
                  غير المقروءة ({unreadCount})
                </button>
                <button
                  className={filter === 'read' ? 'active' : ''}
                  onClick={() => setFilter('read')}
                >
                  المقروءة ({notifications.length - unreadCount})
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>النوع:</label>
              <div className="filter-buttons">
                <button
                  className={selectedType === 'all' ? 'active' : ''}
                  onClick={() => setSelectedType('all')}
                >
                  الكل
                </button>
                <button
                  className={selectedType === 'user' ? 'active' : ''}
                  onClick={() => setSelectedType('user')}
                >
                  👤 مستخدمين
                </button>
                <button
                  className={selectedType === 'image' ? 'active' : ''}
                  onClick={() => setSelectedType('image')}
                >
                  🖼️ صور
                </button>
                <button
                  className={selectedType === 'report' ? 'active' : ''}
                  onClick={() => setSelectedType('report')}
                >
                  🚨 بلاغات
                </button>
                <button
                  className={selectedType === 'like' ? 'active' : ''}
                  onClick={() => setSelectedType('like')}
                >
                  ❤️ إعجابات
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>جاري تحميل الإشعارات...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <FiBell size={64} />
                <h3>لا توجد إشعارات</h3>
                <p>ستظهر هنا جميع إشعاراتك الجديدة</p>
              </div>
            ) : (
              <div className="notifications-list-page">
                {notifications.map(notification => {
                  const icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification._id}
                      className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                    >
                      <div
                        className="notification-icon"
                        style={{ background: `${icon.color}15`, color: icon.color }}
                      >
                        {icon.emoji}
                      </div>
                      <div className="notification-body">
                        <div className="notification-header">
                          <h3>{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="unread-badge">جديد</span>
                          )}
                        </div>
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <div className="notification-actions">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="action-button"
                            title="تحديد كمقروء"
                          >
                            <FiCheck />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="action-button delete"
                          title="حذف"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
