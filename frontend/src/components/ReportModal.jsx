import { useState } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { reportsAPI } from '../config/api';
import Modal from './Modal';
import '../styles/ReportModal.css';

const ReportModal = ({ isOpen, onClose, type, itemId, itemName }) => {
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reasons = [
    { value: 'spam', label: 'محتوى غير مرغوب (Spam)', icon: '🚫' },
    { value: 'inappropriate', label: 'محتوى غير لائق', icon: '⚠️' },
    { value: 'harassment', label: 'تحرش', icon: '😡' },
    { value: 'copyright', label: 'انتهاك حقوق النشر', icon: '©️' },
    { value: 'fake', label: 'محتوى مزيف', icon: '🎭' },
    { value: 'violence', label: 'عنف', icon: '⛔' },
    { value: 'other', label: 'أخرى', icon: '📋' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim() && reason === 'other') {
      alert('يرجى إضافة وصف للسبب "أخرى"');
      return;
    }

    setLoading(true);

    try {
      const reportData = {
        reportType: type,
        ...(type === 'image'
          ? { reportedImageId: itemId }
          : { reportedUserId: itemId }
        ),
        reason,
        description: description.trim()
      };

      const response = await reportsAPI.create(reportData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting report:', error);

      if (error.response?.status === 401) {
        alert('يرجى تسجيل الدخول أولاً');
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || 'خطأ في البيانات المدخلة');
      } else {
        alert('فشل في إرسال البلاغ. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('spam');
    setDescription('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="report-modal">
        {success ? (
          <div className="report-success">
            <div className="success-icon">✅</div>
            <h3>تم إرسال البلاغ بنجاح</h3>
            <p>سيقوم فريقنا بمراجعة البلاغ في أقرب وقت ممكن</p>
          </div>
        ) : (
          <>
            <div className="report-header">
              <FiAlertTriangle className="report-icon" />
              <h2>إبلاغ عن {type === 'image' ? 'صورة' : 'مستخدم'}</h2>
              {itemName && <p className="report-item-name">{itemName}</p>}
            </div>

            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-group">
                <label htmlFor="reason">السبب *</label>
                <div className="reasons-grid">
                  {reasons.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      className={`reason-option ${reason === r.value ? 'selected' : ''}`}
                      onClick={() => setReason(r.value)}
                    >
                      <span className="reason-icon">{r.icon}</span>
                      <span className="reason-label">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  الوصف {reason === 'other' ? '*' : '(اختياري)'}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل إضافية حول البلاغ..."
                  rows={4}
                  maxLength={1000}
                  required={reason === 'other'}
                />
                <div className="char-count">
                  {description.length} / 1000
                </div>
              </div>

              <div className="report-info">
                <FiAlertTriangle />
                <p>
                  سيتم مراجعة البلاغ من قبل فريق الإدارة.
                  البلاغات الكاذبة قد تؤدي إلى حظر حسابك.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="button button-secondary"
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="button button-danger"
                  disabled={loading}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ReportModal;
