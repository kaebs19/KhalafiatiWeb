# Khalafiati Dashboard - Project Structure

## البنية الكاملة للمشروع

```
frontend/
├── public/                     # Static files
├── src/
│   ├── config/                 # Configuration files
│   │   └── api.js             # Axios instance + API endpoints
│   │
│   ├── context/               # React Context
│   │   └── AuthContext.jsx   # Authentication context
│   │
│   ├── utils/                 # Utility functions
│   │   └── localStorage.js   # Local storage helpers
│   │
│   ├── components/            # Reusable components
│   │   ├── Header.jsx         # Header with user info
│   │   ├── Sidebar.jsx        # Sidebar navigation
│   │   ├── ProtectedRoute.jsx # Route protection HOC
│   │   ├── StatsCard.jsx      # Statistics card component
│   │   ├── Table.jsx          # Reusable table component
│   │   ├── Modal.jsx          # Modal component
│   │   └── Pagination.jsx     # Pagination component
│   │
│   ├── pages/                 # Page components
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Register page
│   │   ├── Dashboard.jsx      # Main dashboard with stats
│   │   ├── Users.jsx          # Users management (Admin)
│   │   ├── UserDetails.jsx    # User details page
│   │   ├── Categories.jsx     # Categories CRUD
│   │   ├── Images.jsx         # Images gallery
│   │   └── ImageUpload.jsx    # Upload images page
│   │
│   ├── styles/                # CSS files
│   │   ├── Auth.css           # Authentication pages
│   │   ├── Dashboard.css      # Dashboard styles
│   │   ├── Users.css          # Users page
│   │   ├── UserDetails.css    # User details page
│   │   ├── Categories.css     # Categories page
│   │   ├── Images.css         # Images gallery
│   │   ├── ImageUpload.css    # Upload page
│   │   ├── Sidebar.css        # Sidebar styles
│   │   ├── Header.css         # Header styles
│   │   ├── StatsCard.css      # Stats card styles
│   │   ├── Table.css          # Table styles
│   │   ├── Modal.css          # Modal styles
│   │   └── Pagination.css     # Pagination styles
│   │
│   ├── App.jsx                # Main app with routing
│   ├── App.css                # Global app styles
│   ├── main.jsx               # Entry point
│   └── index.css              # Global CSS reset
│
├── .env.example               # Environment variables example
├── .gitignore                 # Git ignore file
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
├── README-DASHBOARD.md        # Complete documentation
├── QUICK-START.md             # Quick start guide
└── PROJECT-STRUCTURE.md       # This file
```

## الملفات حسب الوظيفة

### Configuration (1 file)
- `src/config/api.js` - Axios instance with interceptors and API endpoints

### Context (1 file)
- `src/context/AuthContext.jsx` - Authentication state management

### Utilities (1 file)
- `src/utils/localStorage.js` - Local storage helper functions

### Components (7 files)
- `src/components/Header.jsx` - Top header with user info and notifications
- `src/components/Sidebar.jsx` - Side navigation menu
- `src/components/ProtectedRoute.jsx` - HOC for route protection
- `src/components/StatsCard.jsx` - Statistics display card
- `src/components/Table.jsx` - Reusable data table
- `src/components/Modal.jsx` - Modal dialog component
- `src/components/Pagination.jsx` - Pagination controls

### Pages (8 files)
- `src/pages/Login.jsx` - User login
- `src/pages/Register.jsx` - User registration
- `src/pages/Dashboard.jsx` - Main dashboard with charts
- `src/pages/Users.jsx` - Users management (Admin only)
- `src/pages/UserDetails.jsx` - User profile and details
- `src/pages/Categories.jsx` - Categories CRUD operations
- `src/pages/Images.jsx` - Images gallery and management
- `src/pages/ImageUpload.jsx` - Upload new images

### Styles (13 files)
- Component styles: Sidebar, Header, StatsCard, Table, Modal, Pagination
- Page styles: Auth, Dashboard, Users, UserDetails, Categories, Images, ImageUpload

### Core Files (3 files)
- `src/App.jsx` - Main application with React Router
- `src/main.jsx` - Application entry point
- `src/index.css` - Global styles and CSS reset

### Documentation (3 files)
- `README-DASHBOARD.md` - Complete documentation
- `QUICK-START.md` - Quick start guide
- `PROJECT-STRUCTURE.md` - This file

## إحصائيات المشروع

- **Total Files**: 36 files
- **React Components**: 15 components
- **CSS Files**: 15 stylesheets
- **Config/Utils**: 3 files
- **Documentation**: 3 files

## تقنيات مستخدمة

### Frontend Framework
- React 19 (Latest)
- React Hooks (useState, useEffect, useContext)
- React Context API

### Routing
- React Router DOM v7
- Protected Routes
- Dynamic Routes

### HTTP Client
- Axios
- Request/Response Interceptors
- Auto token handling

### UI Components
- React Icons (Feather Icons)
- Recharts (Charts library)
- Custom CSS (No UI framework)

### Build Tool
- Vite (Fast build tool)
- ESLint (Code linting)

## المميزات الرئيسية

### 1. Authentication System
✅ Login/Register pages
✅ JWT token management
✅ Protected routes
✅ Auto logout on token expiry
✅ User context

### 2. Dashboard
✅ Statistics cards
✅ Bar chart (Growth overview)
✅ Line chart (User activity)
✅ Pie chart (User distribution)
✅ Recent activity feed

### 3. User Management (Admin)
✅ List all users with pagination
✅ Search users
✅ View user details
✅ Ban/Unban users
✅ Delete users

### 4. Categories Management
✅ CRUD operations
✅ Search functionality
✅ Image count per category

### 5. Images Management
✅ Grid view with thumbnails
✅ Search and filter
✅ Move images between categories
✅ Delete images
✅ Hover effects

### 6. Image Upload
✅ Multiple file upload
✅ Drag and drop
✅ Preview before upload
✅ Progress indicator
✅ Category selection

## Responsive Design

✅ Desktop (1200px+)
✅ Tablet (768px - 1199px)
✅ Mobile (< 768px)

## Browser Support

✅ Chrome (Latest 2 versions)
✅ Firefox (Latest 2 versions)
✅ Safari (Latest 2 versions)
✅ Edge (Latest 2 versions)

## Color Palette

- **Primary**: #4f46e5 (Indigo)
- **Success**: #10b981 (Green)
- **Danger**: #ef4444 (Red)
- **Warning**: #f59e0b (Orange)
- **Info**: #3b82f6 (Blue)
- **Background**: #f5f7fa
- **Text**: #1e293b

## الخطوات التالية

1. ✅ تثبيت المكتبات: `npm install`
2. ✅ تشغيل المشروع: `npm run dev`
3. ✅ فتح المتصفح: http://localhost:5173
4. ✅ تسجيل الدخول أو إنشاء حساب

## ملاحظات مهمة

⚠️ تأكد من تشغيل Backend على http://localhost:5000
⚠️ تأكد من تفعيل CORS في Backend
⚠️ راجع README-DASHBOARD.md للتفاصيل الكاملة
