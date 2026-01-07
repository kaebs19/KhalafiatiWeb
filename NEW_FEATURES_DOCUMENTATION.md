# 🎯 الميزات الاحترافية الجديدة

## ✨ نظرة عامة

تم إضافة ميزتين احترافيتين أساسيتين:
1. **حذف الحساب** - يمكن للمستخدمين حذف حساباتهم بأمان
2. **إدارة المحتوى** - سياسة الخصوصية، شروط الاستخدام، حول التطبيق، اتصل بنا

---

## 🗑️ الميزة الأولى: حذف الحساب

### الوصف
يمكن للمستخدمين حذف حساباتهم بشكل نهائي مع حذف جميع بياناتهم.

### API Endpoint

```
DELETE /api/auth/account
Authorization: Bearer {token}
```

### Request Body

```json
{
  "password": "user-password",
  "confirmation": "DELETE"
}
```

### Response

#### نجاح (200):
```json
{
  "success": true,
  "message": "Account deleted successfully. We're sorry to see you go."
}
```

#### خطأ - كلمة مرور خاطئة (401):
```json
{
  "success": false,
  "message": "Incorrect password"
}
```

#### خطأ - تأكيد خاطئ (400):
```json
{
  "success": false,
  "message": "Please type DELETE to confirm account deletion"
}
```

### ما يتم حذفه

عند حذف الحساب، يتم حذف:
- ✅ بيانات المستخدم من قاعدة البيانات
- ✅ الصورة الشخصية (avatar)
- ✅ صورة الغلاف (cover)
- ✅ Thumbnail للصورة الشخصية
- ✅ جميع الصور المرفوعة من المستخدم
- ✅ Thumbnails للصور
- ✅ جميع ملفات الصور من السيرفر

### مثال cURL

```bash
curl -X DELETE https://khalafiati.com/api/auth/account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "mypassword123",
    "confirmation": "DELETE"
  }'
```

### مثال JavaScript

```javascript
async function deleteAccount(password) {
  const token = localStorage.getItem('token');

  const response = await fetch('https://khalafiati.com/api/auth/account', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      password: password,
      confirmation: 'DELETE'
    })
  });

  const data = await response.json();

  if (data.success) {
    // حذف Token
    localStorage.removeItem('token');
    // إعادة توجيه للصفحة الرئيسية
    window.location.href = '/';
  } else {
    alert(data.message);
  }
}
```

### مثال React Component

```jsx
function DeleteAccountForm() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (confirmation !== 'DELETE') {
      alert('يرجى كتابة DELETE للتأكيد');
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, confirmation })
      });

      const data = await response.json();

      if (data.success) {
        alert('تم حذف حسابك بنجاح');
        localStorage.removeItem('token');
        window.location.href = '/';
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('حدث خطأ أثناء حذف الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <h3>حذف الحساب</h3>
      <p className="warning">⚠️ تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه!</p>

      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="اكتب DELETE للتأكيد"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading || confirmation !== 'DELETE'}
        className="btn-danger"
      >
        {loading ? 'جاري الحذف...' : 'حذف الحساب نهائياً'}
      </button>
    </form>
  );
}
```

---

## 📄 الميزة الثانية: إدارة المحتوى (Settings)

### الوصف
نظام مرن لإدارة صفحات المحتوى الثابت مثل:
- سياسة الخصوصية
- شروط الاستخدام
- حول التطبيق
- اتصل بنا

### هيكل البيانات

```javascript
{
  key: 'privacy-policy', // فريد
  title: {
    ar: 'سياسة الخصوصية',
    en: 'Privacy Policy'
  },
  content: {
    ar: 'محتوى بالعربي...',
    en: 'English content...'
  },
  contactInfo: {  // اختياري (للاتصل بنا)
    email: 'info@khalafiati.com',
    phone: '+966XXXXXXXXX',
    address: 'العنوان',
    socialMedia: {
      facebook: 'https://facebook.com/...',
      twitter: 'https://twitter.com/...',
      instagram: 'https://instagram.com/...',
      linkedin: 'https://linkedin.com/...'
    }
  },
  isPublished: true,
  updatedBy: 'userId',
  createdAt: '2025-01-02...',
  updatedAt: '2025-01-02...'
}
```

---

## 🔓 API Endpoints (عامة)

### 1. الحصول على جميع الإعدادات

```
GET /api/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "_id": "...",
        "key": "privacy-policy",
        "title": {
          "ar": "سياسة الخصوصية",
          "en": "Privacy Policy"
        },
        "content": {
          "ar": "...",
          "en": "..."
        },
        "isPublished": true,
        "createdAt": "...",
        "updatedAt": "..."
      },
      ...
    ]
  }
}
```

### 2. الحصول على إعداد محدد

```
GET /api/settings/:key
```

**مثال:**
```
GET /api/settings/privacy-policy
GET /api/settings/terms-of-service
GET /api/settings/about-us
GET /api/settings/contact-us
```

**Response:**
```json
{
  "success": true,
  "data": {
    "setting": {
      "_id": "...",
      "key": "privacy-policy",
      "title": {
        "ar": "سياسة الخصوصية",
        "en": "Privacy Policy"
      },
      "content": {
        "ar": "محتوى سياسة الخصوصية...",
        "en": "Privacy policy content..."
      },
      "isPublished": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

## 🔐 API Endpoints (Admin فقط)

### 3. إنشاء/تحديث إعداد

```
PUT /api/settings/:key
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "title": {
    "ar": "سياسة الخصوصية",
    "en": "Privacy Policy"
  },
  "content": {
    "ar": "نحن نحترم خصوصيتك...",
    "en": "We respect your privacy..."
  },
  "contactInfo": {  // اختياري
    "email": "support@khalafiati.com",
    "phone": "+966 XX XXX XXXX"
  },
  "isPublished": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "data": {
    "setting": { ... }
  }
}
```

### 4. حذف إعداد

```
DELETE /api/settings/:key
Authorization: Bearer {admin-token}
```

**Response:**
```json
{
  "success": true,
  "message": "Setting deleted successfully"
}
```

### 5. تهيئة الإعدادات الافتراضية

```
POST /api/settings/init
Authorization: Bearer {admin-token}
```

**الوصف:** ينشئ الإعدادات الافتراضية الأربعة إذا لم تكن موجودة.

**Response:**
```json
{
  "success": true,
  "message": "Initialized 4 default settings",
  "data": {
    "created": 4,
    "settings": [ ... ]
  }
}
```

---

## 💻 أمثلة الاستخدام

### React - عرض سياسة الخصوصية

```jsx
function PrivacyPolicy() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://khalafiati.com/api/settings/privacy-policy')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPolicy(data.data.setting);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>جاري التحميل...</div>;
  if (!policy) return <div>لم يتم العثور على سياسة الخصوصية</div>;

  return (
    <div className="policy-page">
      <h1>{policy.title.ar}</h1>
      <div dangerouslySetInnerHTML={{ __html: policy.content.ar }} />
      <small>آخر تحديث: {new Date(policy.updatedAt).toLocaleDateString('ar')}</small>
    </div>
  );
}
```

### React - صفحة اتصل بنا

```jsx
function ContactUs() {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    fetch('https://khalafiati.com/api/settings/contact-us')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setContact(data.data.setting);
        }
      });
  }, []);

  if (!contact) return null;

  return (
    <div className="contact-page">
      <h1>{contact.title.ar}</h1>
      <div dangerouslySetInnerHTML={{ __html: contact.content.ar }} />

      {contact.contactInfo && (
        <div className="contact-info">
          {contact.contactInfo.email && (
            <p>📧 البريد الإلكتروني: {contact.contactInfo.email}</p>
          )}
          {contact.contactInfo.phone && (
            <p>📱 الهاتف: {contact.contactInfo.phone}</p>
          )}
          {contact.contactInfo.address && (
            <p>📍 العنوان: {contact.contactInfo.address}</p>
          )}

          {contact.contactInfo.socialMedia && (
            <div className="social-media">
              <h3>تابعنا:</h3>
              {contact.contactInfo.socialMedia.facebook && (
                <a href={contact.contactInfo.socialMedia.facebook}>Facebook</a>
              )}
              {contact.contactInfo.socialMedia.twitter && (
                <a href={contact.contactInfo.socialMedia.twitter}>Twitter</a>
              )}
              {contact.contactInfo.socialMedia.instagram && (
                <a href={contact.contactInfo.socialMedia.instagram}>Instagram</a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### React - Admin Panel - تحديث الإعدادات

```jsx
function AdminSettingsEditor() {
  const [key, setKey] = useState('privacy-policy');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [loading, setLoading] = useState(false);

  // تحميل البيانات الحالية
  useEffect(() => {
    fetch(`/api/settings/${key}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const setting = data.data.setting;
          setTitleAr(setting.title.ar);
          setTitleEn(setting.title.en);
          setContentAr(setting.content.ar);
          setContentEn(setting.content.en);
        }
      });
  }, [key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: { ar: titleAr, en: titleEn },
          content: { ar: contentAr, en: contentEn }
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('تم التحديث بنجاح');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={key} onChange={(e) => setKey(e.target.value)}>
        <option value="privacy-policy">سياسة الخصوصية</option>
        <option value="terms-of-service">شروط الاستخدام</option>
        <option value="about-us">حول التطبيق</option>
        <option value="contact-us">اتصل بنا</option>
      </select>

      <input
        placeholder="العنوان بالعربي"
        value={titleAr}
        onChange={(e) => setTitleAr(e.target.value)}
        required
      />

      <input
        placeholder="العنوان بالإنجليزي"
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
      />

      <textarea
        placeholder="المحتوى بالعربي"
        value={contentAr}
        onChange={(e) => setContentAr(e.target.value)}
        rows={10}
        required
      />

      <textarea
        placeholder="المحتوى بالإنجليزي"
        value={contentEn}
        onChange={(e) => setContentEn(e.target.value)}
        rows={10}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
      </button>
    </form>
  );
}
```

---

## 🔑 الصلاحيات

### User (مستخدم عادي):
- ✅ حذف الحساب الخاص به
- ✅ قراءة جميع الإعدادات العامة
- ❌ تعديل الإعدادات

### Admin (مدير):
- ✅ جميع صلاحيات المستخدم
- ✅ إنشاء/تعديل/حذف الإعدادات
- ✅ تهيئة الإعدادات الافتراضية

---

## 📋 الملفات الجديدة

```
backend/
├── models/
│   └── AppSettings.js              # نموذج البيانات
├── controllers/
│   ├── authController.js           # محدّث (deleteAccount)
│   └── settingsController.js       # جديد
├── routes/
│   ├── authRoutes.js              # محدّث (DELETE /account)
│   └── settingsRoutes.js          # جديد
├── middleware/
│   └── auth.js                    # محدّث (admin middleware)
└── server.js                      # محدّث (settings routes)
```

---

## 🧪 الاختبار

### 1. اختبار حذف الحساب

```bash
# تسجيل دخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# حذف الحساب
curl -X DELETE http://localhost:5000/api/auth/account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"123456","confirmation":"DELETE"}'
```

### 2. اختبار الإعدادات

```bash
# الحصول على جميع الإعدادات
curl http://localhost:5000/api/settings

# الحصول على سياسة الخصوصية
curl http://localhost:5000/api/settings/privacy-policy

# تهيئة الإعدادات (Admin)
curl -X POST http://localhost:5000/api/settings/init \
  -H "Authorization: Bearer ADMIN_TOKEN"

# تحديث إعداد (Admin)
curl -X PUT http://localhost:5000/api/settings/privacy-policy \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": {"ar":"سياسة الخصوصية","en":"Privacy Policy"},
    "content": {"ar":"محتوى جديد...","en":"New content..."}
  }'
```

---

## ✅ الخلاصة

| الميزة | الحالة |
|--------|--------|
| حذف الحساب | ✅ جاهز |
| Settings Model | ✅ جاهز |
| Settings Controller | ✅ جاهز |
| Settings Routes | ✅ جاهز |
| Admin Middleware | ✅ جاهز |
| التوثيق | ✅ مكتمل |

**الحالة**: ✅ جاهز للنشر
**التاريخ**: 2025-01-02
