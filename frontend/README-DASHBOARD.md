# Khalafiati Dashboard - Frontend

لوحة تحكم احترافية كاملة مبنية باستخدام React + Vite

## المميزات

### 1. نظام المصادقة (Authentication)
- تسجيل الدخول (Login)
- تسجيل حساب جديد (Register)
- حماية الصفحات (Protected Routes)
- JWT Token Management
- Auto-logout عند انتهاء الجلسة

### 2. لوحة التحكم (Dashboard)
- إحصائيات شاملة (Users, Categories, Images)
- Charts تفاعلية باستخدام Recharts:
  - Bar Chart للنمو الشهري
  - Line Chart لنشاط المستخدمين
  - Pie Chart لتوزيع المستخدمين
- قائمة الأنشطة الأخيرة

### 3. إدارة المستخدمين (Users Management)
- عرض جميع المستخدمين مع Pagination
- البحث عن المستخدمين
- عرض تفاصيل المستخدم
- حظر/إلغاء حظر المستخدمين
- حذف المستخدمين
- (للـ Admin فقط)

### 4. إدارة الأقسام (Categories Management)
- عرض جميع الأقسام
- إضافة قسم جديد
- تعديل قسم
- حذف قسم
- البحث والتصفية

### 5. إدارة الصور (Images Management)
- عرض الصور في Grid جميل
- البحث عن الصور
- التصفية حسب القسم
- نقل الصور بين الأقسام
- حذف الصور
- Preview عند الـ Hover

### 6. رفع الصور (Image Upload)
- رفع صور متعددة
- Drag & Drop Support
- Preview قبل الرفع
- Progress Bar
- اختيار القسم

## البنية التقنية

### الملفات الأساسية

```
src/
├── config/
│   └── api.js                  # Axios instance + API endpoints
├── context/
│   └── AuthContext.jsx         # Authentication context
├── utils/
│   └── localStorage.js         # Local storage helpers
├── components/
│   ├── Header.jsx              # Header component
│   ├── Sidebar.jsx             # Sidebar navigation
│   ├── ProtectedRoute.jsx      # Route protection
│   ├── StatsCard.jsx           # Statistics card
│   ├── Table.jsx               # Reusable table
│   ├── Modal.jsx               # Modal component
│   └── Pagination.jsx          # Pagination component
├── pages/
│   ├── Login.jsx               # Login page
│   ├── Register.jsx            # Register page
│   ├── Dashboard.jsx           # Dashboard with stats
│   ├── Users.jsx               # Users management
│   ├── UserDetails.jsx         # User details
│   ├── Categories.jsx          # Categories CRUD
│   ├── Images.jsx              # Images management
│   └── ImageUpload.jsx         # Upload images
├── styles/
│   ├── Auth.css                # Auth pages styles
│   ├── Dashboard.css           # Dashboard styles
│   ├── Users.css               # Users page styles
│   ├── UserDetails.css         # User details styles
│   ├── Categories.css          # Categories styles
│   ├── Images.css              # Images gallery styles
│   ├── ImageUpload.css         # Upload page styles
│   ├── Sidebar.css             # Sidebar styles
│   ├── Header.css              # Header styles
│   ├── StatsCard.css           # Stats card styles
│   ├── Table.css               # Table styles
│   ├── Modal.css               # Modal styles
│   └── Pagination.css          # Pagination styles
├── App.jsx                     # Main app with routing
├── App.css                     # Global app styles
├── main.jsx                    # Entry point
└── index.css                   # Global styles
```

## التثبيت والتشغيل

### 1. تثبيت المكتبات
```bash
cd frontend
npm install
```

المكتبات المستخدمة:
- `react` - مكتبة React
- `react-router-dom` - التنقل بين الصفحات
- `axios` - HTTP requests
- `react-icons` - الأيقونات
- `recharts` - الرسوم البيانية

### 2. تشغيل المشروع
```bash
npm run dev
```

سيعمل المشروع على: `http://localhost:5173`

### 3. بناء المشروع للإنتاج
```bash
npm run build
```

## API Configuration

الـ API Base URL محدد في `src/config/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - تسجيل حساب جديد
- `GET /api/auth/profile` - الحصول على بيانات المستخدم

#### Users
- `GET /api/users` - جلب المستخدمين
- `GET /api/users/:id` - جلب مستخدم محدد
- `PUT /api/users/:id` - تحديث مستخدم
- `DELETE /api/users/:id` - حذف مستخدم
- `PATCH /api/users/:id/ban` - حظر/إلغاء حظر

#### Categories
- `GET /api/categories` - جلب الأقسام
- `GET /api/categories/:id` - جلب قسم محدد
- `POST /api/categories` - إنشاء قسم جديد
- `PUT /api/categories/:id` - تحديث قسم
- `DELETE /api/categories/:id` - حذف قسم

#### Images
- `GET /api/images` - جلب الصور
- `GET /api/images/:id` - جلب صورة محددة
- `POST /api/images/upload` - رفع صورة
- `PUT /api/images/:id` - تحديث صورة
- `DELETE /api/images/:id` - حذف صورة
- `PATCH /api/images/:id/move` - نقل صورة لقسم آخر

#### Stats
- `GET /api/stats/dashboard` - جلب إحصائيات Dashboard

## المميزات التقنية

### 1. Responsive Design
- يعمل على جميع الشاشات (Desktop, Tablet, Mobile)
- Sidebar قابل للإغلاق على الشاشات الصغيرة
- Tables و Grids متجاوبة

### 2. State Management
- React Context API للـ Authentication
- Local State للصفحات
- localStorage للبيانات المستمرة

### 3. Error Handling
- Error Messages واضحة
- Auto-redirect عند انتهاء الجلسة
- Validation للـ Forms

### 4. Loading States
- Spinner أثناء التحميل
- Disabled buttons أثناء الإرسال
- Progress bar للرفع

### 5. Security
- Protected Routes
- JWT Token في Headers
- Auto-logout عند 401

## الألوان المستخدمة

- Primary: `#4f46e5` (Indigo)
- Secondary: `#e2e8f0` (Slate)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)
- Warning: `#f59e0b` (Orange)
- Background: `#f5f7fa`

## الأيقونات

جميع الأيقونات من `react-icons/fi` (Feather Icons)

## المتصفحات المدعومة

- Chrome (آخر إصدارين)
- Firefox (آخر إصدارين)
- Safari (آخر إصدارين)
- Edge (آخر إصدارين)

## الترخيص

MIT License

---

**ملاحظات:**
- تأكد من تشغيل الـ Backend على `http://localhost:5000`
- جميع الصفحات محمية ما عدا Login و Register
- صفحة Users متاحة للـ Admin فقط
