import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiSearch, FiEye, FiCheck, FiX, FiTrash2, FiUserX, FiImage } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { reportsAPI, usersAPI, imagesAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Reports.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://khalafiati.io/api';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [statistics, setStatistics] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        reportType: typeFilter,
      });

      setReports(response.data.data.reports);
      setTotalPages(response.data.data.pagination.pages);
      setTotalReports(response.data.data.pagination.total);
      setStatistics(response.data.data.statistics?.byStatus || {});
    } catch (error) {
      console.error('Error fetching reports:', error);
      if (error.response?.status === 403) {
        alert('غير مصرح لك بالوصول إلى هذه الصفحة');
        window.location.href = '/dashboard';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (reportId, newStatus, adminNotes = '') => {
    setActionLoading(true);
    try {
      await reportsAPI.updateStatus(reportId, {
        status: newStatus,
        adminNotes: adminNotes
      });

      alert('تم تحديث حالة البلاغ بنجاح');
      setShowDetailModal(false);
      fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('فشل في تحديث حالة البلاغ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البلاغ؟')) {
      return;
    }
    setActionLoading(true);
    try {
      await reportsAPI.delete(reportId);
      alert('تم حذف البلاغ بنجاح');
      setShowDetailModal(false);
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('فشل في حذف البلاغ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async (userId, username) => {
    if (!window.confirm(`هل أنت متأكد من حظر المستخدم "${username}"؟`)) {
      return;
    }
    setActionLoading(true);
    try {
      await usersAPI.toggleBan(userId);
      alert('تم حظر المستخدم بنجاح');
      fetchReports();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('فشل في حظر المستخدم');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteImage = async (imageId, imageTitle) => {
    if (!window.confirm(`هل أنت متأكد من حذف الصورة "${imageTitle}"؟`)) {
      return;
    }
    setActionLoading(true);
    try {
      await imagesAPI.delete(imageId);
      alert('تم حذف الصورة بنجاح');
      // Update report status to resolved
      if (selectedReport) {
        await reportsAPI.updateStatus(selectedReport._id, {
          status: 'resolved',
          adminNotes: 'تم حذف الصورة المُبلَّغ عنها'
        });
      }
      setShowDetailModal(false);
      fetchReports();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('فشل في حذف الصورة');
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If already absolute URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise, prepend API base URL (without /api suffix)
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  };

  const getReasonLabel = (reason) => {
    const reasons = {
      spam: 'محتوى غير مرغوب',
      inappropriate: 'محتوى غير لائق',
      harassment: 'تحرش',
      copyright: 'انتهاك حقوق النشر',
      fake: 'محتوى مزيف',
      violence: 'عنف',
      other: 'أخرى'
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'قيد الانتظار', class: 'warning' },
      reviewed: { label: 'تمت المراجعة', class: 'info' },
      resolved: { label: 'تم الحل', class: 'success' },
      rejected: { label: 'مرفوض', class: 'danger' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge badge-${badge.class}`}>{badge.label}</span>;
  };

  const columns = [
    {
      label: 'النوع',
      field: 'reportType',
      render: (report) => (
        <span className={`type-badge ${report.reportType}`}>
          {report.reportType === 'image' ? 'صورة' : 'مستخدم'}
        </span>
      ),
    },
    {
      label: 'السبب',
      field: 'reason',
      render: (report) => getReasonLabel(report.reason),
    },
    {
      label: 'المُبلِّغ',
      field: 'reportedBy',
      render: (report) => (
        <div className="user-cell">
          {report.reportedBy?.username || 'غير معروف'}
        </div>
      ),
    },
    {
      label: 'المحتوى المُبلَّغ عنه',
      field: 'reported',
      render: (report) => {
        if (report.reportType === 'image') {
          return report.reportedImage?.title || 'صورة محذوفة';
        } else {
          return report.reportedUser?.username || 'مستخدم محذوف';
        }
      },
    },
    {
      label: 'الحالة',
      field: 'status',
      render: (report) => getStatusBadge(report.status),
    },
    {
      label: 'التاريخ',
      field: 'createdAt',
      render: (report) => new Date(report.createdAt).toLocaleDateString('ar'),
    },
  ];

  const actions = (report) => (
    <button
      onClick={() => handleViewReport(report)}
      className="action-button view"
      title="عرض التفاصيل"
    >
      <FiEye />
    </button>
  );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container reports-page">
          <div className="page-header">
            <div className="page-title-section">
              <FiAlertTriangle className="page-icon" />
              <div>
                <h1>إدارة البلاغات</h1>
                <p className="page-subtitle">{totalReports} بلاغ</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-cards">
            <div className="stat-card warning">
              <div className="stat-value">{statistics.pending || 0}</div>
              <div className="stat-label">قيد الانتظار</div>
            </div>
            <div className="stat-card info">
              <div className="stat-value">{statistics.reviewed || 0}</div>
              <div className="stat-label">تمت المراجعة</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{statistics.resolved || 0}</div>
              <div className="stat-label">تم الحل</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-value">{statistics.rejected || 0}</div>
              <div className="stat-label">مرفوض</div>
            </div>
          </div>

          {/* Filters */}
          <div className="page-toolbar">
            <div className="filters">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="">كل الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="reviewed">تمت المراجعة</option>
                <option value="resolved">تم الحل</option>
                <option value="rejected">مرفوض</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="">كل الأنواع</option>
                <option value="image">صور</option>
                <option value="user">مستخدمين</option>
              </select>
            </div>
          </div>

          <div className="page-content">
            <Table
              columns={columns}
              data={reports}
              actions={actions}
              loading={loading}
              emptyMessage="لا توجد بلاغات"
            />

            {!loading && reports.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalReports}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="تفاصيل البلاغ"
          size="large"
        >
          <div className="report-detail">
            <div className="detail-section">
              <h3>معلومات البلاغ</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">النوع:</span>
                  <span className={`type-badge ${selectedReport.reportType}`}>
                    {selectedReport.reportType === 'image' ? 'صورة' : 'مستخدم'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">السبب:</span>
                  <span>{getReasonLabel(selectedReport.reason)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">الحالة:</span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div className="detail-item">
                  <span className="detail-label">التاريخ:</span>
                  <span>{new Date(selectedReport.createdAt).toLocaleString('ar')}</span>
                </div>
              </div>
            </div>

            {selectedReport.description && (
              <div className="detail-section">
                <h3>الوصف</h3>
                <p className="report-description">{selectedReport.description}</p>
              </div>
            )}

            <div className="detail-section">
              <h3>المُبلِّغ</h3>
              <div className="user-info">
                <div className="user-avatar">
                  {selectedReport.reportedBy?.avatar ? (
                    <img src={selectedReport.reportedBy.avatar} alt="" />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedReport.reportedBy?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="user-name">{selectedReport.reportedBy?.fullName}</div>
                  <div className="user-email">@{selectedReport.reportedBy?.username}</div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>المحتوى المُبلَّغ عنه</h3>
              {selectedReport.reportType === 'image' ? (
                selectedReport.reportedImage ? (
                  <div className="reported-image">
                    <img
                      src={getImageUrl(selectedReport.reportedImage.imageUrl)}
                      alt={selectedReport.reportedImage.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    <div className="image-info">
                      <strong>{selectedReport.reportedImage.title}</strong>
                      <span>بواسطة: {selectedReport.reportedImage.uploadedBy?.username}</span>
                    </div>
                    <div className="image-actions">
                      <button
                        onClick={() => handleDeleteImage(selectedReport.reportedImage._id, selectedReport.reportedImage.title)}
                        className="button button-danger button-small"
                        disabled={actionLoading}
                      >
                        <FiTrash2 /> حذف الصورة
                      </button>
                      {selectedReport.reportedImage.uploadedBy && selectedReport.reportedImage.uploadedBy.status !== 'banned' && (
                        <button
                          onClick={() => handleBanUser(selectedReport.reportedImage.uploadedBy._id, selectedReport.reportedImage.uploadedBy.username)}
                          className="button button-warning button-small"
                          disabled={actionLoading}
                        >
                          <FiUserX /> حظر صاحب الصورة
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="deleted-content">تم حذف الصورة</p>
                )
              ) : (
                selectedReport.reportedUser ? (
                  <div className="user-info-container">
                    <div className="user-info">
                      <div className="user-avatar">
                        {selectedReport.reportedUser.avatar ? (
                          <img src={getImageUrl(selectedReport.reportedUser.avatarUrl || selectedReport.reportedUser.avatar)} alt="" />
                        ) : (
                          <div className="avatar-placeholder">
                            {selectedReport.reportedUser.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="user-name">{selectedReport.reportedUser.fullName}</div>
                        <div className="user-email">@{selectedReport.reportedUser.username}</div>
                        <div className="user-status">
                          الحالة: {selectedReport.reportedUser.status === 'active' ? 'نشط' : 'محظور'}
                        </div>
                      </div>
                    </div>
                    {selectedReport.reportedUser.status !== 'banned' && (
                      <div className="user-actions">
                        <button
                          onClick={() => handleBanUser(selectedReport.reportedUser._id, selectedReport.reportedUser.username)}
                          className="button button-warning button-small"
                          disabled={actionLoading}
                        >
                          <FiUserX /> حظر المستخدم
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="deleted-content">تم حذف المستخدم</p>
                )
              )}
            </div>

            {selectedReport.reviewedBy && (
              <div className="detail-section">
                <h3>تمت المراجعة بواسطة</h3>
                <p>{selectedReport.reviewedBy.fullName} في {new Date(selectedReport.reviewedAt).toLocaleString('ar')}</p>
                {selectedReport.adminNotes && (
                  <div className="admin-notes">
                    <strong>ملاحظات المشرف:</strong>
                    <p>{selectedReport.adminNotes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              {selectedReport.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport._id, 'reviewed')}
                    className="button button-info"
                    disabled={actionLoading}
                  >
                    <FiEye /> تمت المراجعة
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                    className="button button-success"
                    disabled={actionLoading}
                  >
                    <FiCheck /> حل البلاغ
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport._id, 'rejected')}
                    className="button button-danger"
                    disabled={actionLoading}
                  >
                    <FiX /> رفض البلاغ
                  </button>
                </>
              )}
              {selectedReport.status !== 'pending' && selectedReport.status !== 'resolved' && (
                <button
                  onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                  className="button button-success"
                  disabled={actionLoading}
                >
                  <FiCheck /> حل البلاغ
                </button>
              )}
              <button
                onClick={() => handleDeleteReport(selectedReport._id)}
                className="button button-danger-outline"
                disabled={actionLoading}
              >
                <FiTrash2 /> حذف البلاغ
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Reports;
