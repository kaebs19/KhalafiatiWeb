import { useState, useEffect } from 'react';
import { Container, Card, Tabs, Tab, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import '../styles/AdminSettings.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://khalafiati.io/api';

function AdminSettings() {
  const [activeKey, setActiveKey] = useState('privacy-policy');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [initializing, setInitializing] = useState(false);

  const settingKeys = [
    { key: 'privacy-policy', label: 'سياسة الخصوصية' },
    { key: 'terms-of-service', label: 'شروط الاستخدام' },
    { key: 'about-us', label: 'حول التطبيق' },
    { key: 'contact-us', label: 'اتصل بنا' }
  ];

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/settings`);

      if (response.data.success) {
        const settingsMap = {};
        response.data.data.settings.forEach(setting => {
          settingsMap[setting.key] = setting;
        });
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('فشل تحميل الإعدادات', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    if (!window.confirm('هل تريد تهيئة الإعدادات الافتراضية؟ (لن يتم الكتابة على الإعدادات الموجودة)')) {
      return;
    }

    try {
      setInitializing(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/settings/init`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        showMessage(`تم إنشاء ${response.data.data.created} إعدادات افتراضية`, 'success');
        fetchAllSettings();
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
      showMessage(error.response?.data?.message || 'فشل تهيئة الإعدادات', 'danger');
    } finally {
      setInitializing(false);
    }
  };

  const handleSave = async (key) => {
    const setting = settings[key];

    if (!setting?.title?.ar || !setting?.content?.ar) {
      showMessage('الرجاء ملء العنوان والمحتوى بالعربي', 'warning');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${API_URL}/settings/${key}`,
        {
          title: setting.title,
          content: setting.content,
          contactInfo: setting.contactInfo,
          isPublished: setting.isPublished !== false
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        showMessage('تم الحفظ بنجاح', 'success');
        fetchAllSettings();
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      showMessage(error.response?.data?.message || 'فشل حفظ الإعداد', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, field, value, subfield = null) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: subfield
          ? { ...prev[key]?.[field], [subfield]: value }
          : value
      }
    }));
  };

  const showMessage = (text, variant) => {
    setMessage({ text, variant });
    setTimeout(() => setMessage(null), 5000);
  };

  const renderSettingForm = (key) => {
    const setting = settings[key] || {
      title: { ar: '', en: '' },
      content: { ar: '', en: '' },
      contactInfo: key === 'contact-us' ? {
        email: '',
        phone: '',
        address: '',
        socialMedia: { facebook: '', twitter: '', instagram: '', linkedin: '' }
      } : null
    };

    return (
      <div className="setting-form">
        <Form.Group className="mb-3">
          <Form.Label>العنوان بالعربي *</Form.Label>
          <Form.Control
            type="text"
            value={setting.title?.ar || ''}
            onChange={(e) => handleChange(key, 'title', e.target.value, 'ar')}
            placeholder="مثال: سياسة الخصوصية"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>العنوان بالإنجليزي</Form.Label>
          <Form.Control
            type="text"
            value={setting.title?.en || ''}
            onChange={(e) => handleChange(key, 'title', e.target.value, 'en')}
            placeholder="Example: Privacy Policy"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>المحتوى بالعربي *</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={setting.content?.ar || ''}
            onChange={(e) => handleChange(key, 'content', e.target.value, 'ar')}
            placeholder="اكتب المحتوى هنا..."
          />
          <Form.Text className="text-muted">
            يمكنك استخدام HTML للتنسيق
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>المحتوى بالإنجليزي</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={setting.content?.en || ''}
            onChange={(e) => handleChange(key, 'content', e.target.value, 'en')}
            placeholder="Write content here..."
          />
        </Form.Group>

        {key === 'contact-us' && (
          <>
            <h5 className="mt-4 mb-3">معلومات الاتصال</h5>

            <Form.Group className="mb-3">
              <Form.Label>البريد الإلكتروني</Form.Label>
              <Form.Control
                type="email"
                value={setting.contactInfo?.email || ''}
                onChange={(e) => handleChange(key, 'contactInfo', { ...setting.contactInfo, email: e.target.value })}
                placeholder="info@example.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>رقم الهاتف</Form.Label>
              <Form.Control
                type="text"
                value={setting.contactInfo?.phone || ''}
                onChange={(e) => handleChange(key, 'contactInfo', { ...setting.contactInfo, phone: e.target.value })}
                placeholder="+966 XX XXX XXXX"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>العنوان</Form.Label>
              <Form.Control
                type="text"
                value={setting.contactInfo?.address || ''}
                onChange={(e) => handleChange(key, 'contactInfo', { ...setting.contactInfo, address: e.target.value })}
                placeholder="الرياض، المملكة العربية السعودية"
              />
            </Form.Group>

            <h6 className="mt-3 mb-2">وسائل التواصل الاجتماعي</h6>

            <Form.Group className="mb-3">
              <Form.Label>Facebook</Form.Label>
              <Form.Control
                type="url"
                value={setting.contactInfo?.socialMedia?.facebook || ''}
                onChange={(e) => handleChange(key, 'contactInfo', {
                  ...setting.contactInfo,
                  socialMedia: { ...setting.contactInfo?.socialMedia, facebook: e.target.value }
                })}
                placeholder="https://facebook.com/..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Twitter</Form.Label>
              <Form.Control
                type="url"
                value={setting.contactInfo?.socialMedia?.twitter || ''}
                onChange={(e) => handleChange(key, 'contactInfo', {
                  ...setting.contactInfo,
                  socialMedia: { ...setting.contactInfo?.socialMedia, twitter: e.target.value }
                })}
                placeholder="https://twitter.com/..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instagram</Form.Label>
              <Form.Control
                type="url"
                value={setting.contactInfo?.socialMedia?.instagram || ''}
                onChange={(e) => handleChange(key, 'contactInfo', {
                  ...setting.contactInfo,
                  socialMedia: { ...setting.contactInfo?.socialMedia, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>LinkedIn</Form.Label>
              <Form.Control
                type="url"
                value={setting.contactInfo?.socialMedia?.linkedin || ''}
                onChange={(e) => handleChange(key, 'contactInfo', {
                  ...setting.contactInfo,
                  socialMedia: { ...setting.contactInfo?.socialMedia, linkedin: e.target.value }
                })}
                placeholder="https://linkedin.com/..."
              />
            </Form.Group>
          </>
        )}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <Form.Check
            type="checkbox"
            label="منشور"
            checked={setting.isPublished !== false}
            onChange={(e) => handleChange(key, 'isPublished', e.target.checked)}
          />

          <Button
            variant="primary"
            onClick={() => handleSave(key)}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ التغييرات'
            )}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="admin-settings-container">
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">جاري التحميل...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="admin-settings-container">
      <Card className="admin-settings-card shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">إدارة المحتوى</h3>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={initializeSettings}
            disabled={initializing}
          >
            {initializing ? 'جاري التهيئة...' : 'تهيئة الإعدادات الافتراضية'}
          </Button>
        </Card.Header>

        <Card.Body>
          {message && (
            <Alert variant={message.variant} className="mb-3" dismissible onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          <Tabs
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
            className="mb-3"
          >
            {settingKeys.map(({ key, label }) => (
              <Tab key={key} eventKey={key} title={label}>
                {renderSettingForm(key)}
              </Tab>
            ))}
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminSettings;
