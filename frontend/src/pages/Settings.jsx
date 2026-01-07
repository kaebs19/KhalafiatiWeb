import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FiUser,
  FiLock,
  FiGlobe,
  FiCamera,
  FiSave,
  FiAlertCircle,
  FiCheck,
  FiMail,
  FiShield,
  FiFileText,
  FiExternalLink
} from 'react-icons/fi';
import { authAPI } from '../config/api';
import { getAvatarUrl } from '../utils/imageUrl';
import '../styles/Settings.css';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile State
  const [profileData, setProfileData] = useState({
    username: '',
    fullName: '',
    email: '',
    bio: '',
    avatarUrl: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Khalafiati',
    siteDescription: 'منصة مشاركة الصور الإبداعية',
    siteLogo: '',
    primaryColor: '#4f46e5',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || user.avatar || ''
      });
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage('error', 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Cover Upload
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showMessage('error', 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update Profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', profileData.username);
      formData.append('fullName', profileData.fullName);
      formData.append('email', profileData.email);
      formData.append('bio', profileData.bio);

      // Add avatar if changed
      const avatarInput = document.getElementById('avatar-upload');
      if (avatarInput?.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
      }

      // Add cover if changed
      const coverInput = document.getElementById('cover-upload');
      if (coverInput?.files[0]) {
        formData.append('cover', coverInput.files[0]);
      }

      const response = await authAPI.updateProfile(formData);

      if (response.data.success) {
        updateUser(response.data.user);
        showMessage('success', 'تم تحديث الملف الشخصي بنجاح');
        setAvatarPreview(null);
        setCoverPreview(null);
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  // Update Password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (securityData.newPassword !== securityData.confirmPassword) {
      showMessage('error', 'كلمات المرور الجديدة غير متطابقة');
      return;
    }

    if (securityData.newPassword.length < 6) {
      showMessage('error', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.changePassword({
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });

      if (response.data.success) {
        showMessage('success', 'تم تغيير كلمة المرور بنجاح');
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'كلمة المرور الحالية غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  // Update Site Settings
  const handleSiteSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would call an admin API endpoint
      // const response = await adminAPI.updateSiteSettings(siteSettings);

      // For now, just show success message
      showMessage('success', 'تم تحديث إعدادات الموقع بنجاح');

      // In production, you would:
      // if (response.data.success) {
      //   showMessage('success', 'تم تحديث إعدادات الموقع بنجاح');
      // }
    } catch (error) {
      showMessage('error', 'حدث خطأ أثناء تحديث إعدادات الموقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-wrapper">
          <div className="settings-page">
            {/* Page Header */}
            <div className="page-header">
              <h1>⚙️ الإعدادات</h1>
              <p>إدارة معلوماتك الشخصية وإعدادات النظام</p>
            </div>

            {/* Message Alert */}
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="settings-tabs">
              <button
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser />
                <span>الملف الشخصي</span>
              </button>
              <button
                className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FiLock />
                <span>الأمان</span>
              </button>
              {user?.role === 'admin' && (
                <button
                  className={`tab-button ${activeTab === 'site' ? 'active' : ''}`}
                  onClick={() => setActiveTab('site')}
                >
                  <FiGlobe />
                  <span>إعدادات الموقع</span>
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="settings-content">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="settings-form">
                  <div className="form-section">
                    <h2>📸 الصور الشخصية</h2>

                    {/* Avatar Upload */}
                    <div className="image-upload-group">
                      <div className="upload-item">
                        <label>صورة الملف الشخصي</label>
                        <div className="avatar-upload-wrapper">
                          <div className="avatar-preview-large">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar Preview" />
                            ) : profileData.avatarUrl ? (
                              <img src={getAvatarUrl(user)} alt="Current Avatar" />
                            ) : (
                              <div className="avatar-placeholder">
                                <FiUser size={40} />
                              </div>
                            )}
                          </div>
                          <div className="upload-actions">
                            <input
                              type="file"
                              id="avatar-upload"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              hidden
                            />
                            <label htmlFor="avatar-upload" className="upload-button">
                              <FiCamera />
                              <span>تغيير الصورة</span>
                            </label>
                            <p className="upload-hint">PNG, JPG أقل من 5MB</p>
                          </div>
                        </div>
                      </div>

                      {/* Cover Upload */}
                      <div className="upload-item">
                        <label>صورة الغلاف</label>
                        <div className="cover-upload-wrapper">
                          <div className="cover-preview">
                            {coverPreview ? (
                              <img src={coverPreview} alt="Cover Preview" />
                            ) : user?.coverUrl ? (
                              <img src={getAvatarUrl({ avatarUrl: user.coverUrl })} alt="Current Cover" />
                            ) : (
                              <div className="cover-placeholder">
                                <FiCamera size={40} />
                                <p>لا توجد صورة غلاف</p>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            id="cover-upload"
                            accept="image/*"
                            onChange={handleCoverChange}
                            hidden
                          />
                          <label htmlFor="cover-upload" className="upload-button">
                            <FiCamera />
                            <span>تغيير صورة الغلاف</span>
                          </label>
                          <p className="upload-hint">PNG, JPG أقل من 10MB - المقاس الموصى به: 1920x400</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h2>ℹ️ المعلومات الأساسية</h2>

                    <div className="form-group">
                      <label htmlFor="username">
                        <FiUser />
                        اسم المستخدم
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fullName">
                        <FiUser />
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">
                        <FiMail />
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bio">
                        📝 نبذة عنك
                      </label>
                      <textarea
                        id="bio"
                        rows="4"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="اكتب نبذة قصيرة عنك..."
                      />
                      <small>{profileData.bio.length}/200 حرف</small>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      <FiSave />
                      <span>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordUpdate} className="settings-form">
                  <div className="form-section">
                    <h2>🔒 تغيير كلمة المرور</h2>

                    <div className="form-group">
                      <label htmlFor="currentPassword">
                        <FiLock />
                        كلمة المرور الحالية
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">
                        <FiLock />
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                      <small>يجب أن تكون 6 أحرف على الأقل</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">
                        <FiLock />
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h2>🛡️ الأمان الإضافي</h2>
                    <div className="security-info">
                      <div className="info-card">
                        <FiShield size={24} />
                        <div>
                          <h3>المصادقة الثنائية (2FA)</h3>
                          <p>ميزة قريباً - ستتمكن من تفعيل المصادقة الثنائية لحماية إضافية</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      <FiSave />
                      <span>{loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Site Settings Tab (Admin Only) */}
              {activeTab === 'site' && user?.role === 'admin' && (
                <form onSubmit={handleSiteSettingsUpdate} className="settings-form">
                  <div className="form-section">
                    <h2>🌐 معلومات الموقع</h2>

                    <div className="form-group">
                      <label htmlFor="siteName">
                        <FiGlobe />
                        اسم الموقع
                      </label>
                      <input
                        type="text"
                        id="siteName"
                        value={siteSettings.siteName}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="siteDescription">
                        📝 وصف الموقع
                      </label>
                      <textarea
                        id="siteDescription"
                        rows="3"
                        value={siteSettings.siteDescription}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="primaryColor">
                        🎨 اللون الأساسي
                      </label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          id="primaryColor"
                          value={siteSettings.primaryColor}
                          onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                        />
                        <span>{siteSettings.primaryColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h2>📄 صفحات المحتوى</h2>
                    <p className="section-description">صفحات المعلومات القانونية والعامة</p>

                    <div className="content-pages-links">
                      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="content-page-link">
                        <FiFileText size={20} />
                        <span>سياسة الخصوصية</span>
                        <FiExternalLink size={16} />
                      </a>

                      <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="content-page-link">
                        <FiFileText size={20} />
                        <span>شروط الاستخدام</span>
                        <FiExternalLink size={16} />
                      </a>

                      <a href="/about-us" target="_blank" rel="noopener noreferrer" className="content-page-link">
                        <FiFileText size={20} />
                        <span>حول التطبيق</span>
                        <FiExternalLink size={16} />
                      </a>

                      <a href="/contact-us" target="_blank" rel="noopener noreferrer" className="content-page-link">
                        <FiFileText size={20} />
                        <span>اتصل بنا</span>
                        <FiExternalLink size={16} />
                      </a>

                      {user?.role === 'admin' && (
                        <a href="/admin/settings" className="content-page-link admin-link">
                          <FiFileText size={20} />
                          <span>إدارة المحتوى (Admin)</span>
                          <FiExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="form-section">
                    <h2>🔗 وسائل التواصل الاجتماعي</h2>

                    <div className="form-group">
                      <label htmlFor="facebookUrl">
                        📘 Facebook
                      </label>
                      <input
                        type="url"
                        id="facebookUrl"
                        value={siteSettings.facebookUrl}
                        onChange={(e) => setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="twitterUrl">
                        🐦 Twitter/X
                      </label>
                      <input
                        type="url"
                        id="twitterUrl"
                        value={siteSettings.twitterUrl}
                        onChange={(e) => setSiteSettings({ ...siteSettings, twitterUrl: e.target.value })}
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="instagramUrl">
                        📷 Instagram
                      </label>
                      <input
                        type="url"
                        id="instagramUrl"
                        value={siteSettings.instagramUrl}
                        onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/yourhandle"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      <FiSave />
                      <span>{loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
