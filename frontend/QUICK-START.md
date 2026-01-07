# Quick Start Guide - Khalafiati Dashboard

## التثبيت السريع

### 1. تثبيت المكتبات
```bash
cd frontend
npm install
```

### 2. تشغيل المشروع
```bash
npm run dev
```

المشروع سيعمل على: http://localhost:5173

## الصفحات المتاحة

### صفحات عامة (بدون تسجيل دخول)
- `/login` - تسجيل الدخول
- `/register` - تسجيل حساب جديد

### صفحات محمية (تحتاج تسجيل دخول)
- `/dashboard` - لوحة التحكم الرئيسية
- `/categories` - إدارة الأقسام
- `/images` - معرض الصور
- `/upload` - رفع صور جديدة

### صفحات الـ Admin فقط
- `/users` - إدارة المستخدمين
- `/users/:id` - تفاصيل مستخدم

## بيانات تجريبية للاختبار

### حساب Admin
```
Email: admin@example.com
Password: admin123
```

### حساب User عادي
```
Email: user@example.com
Password: user123
```

## المميزات الرئيسية

### 1. Dashboard
- إحصائيات شاملة
- رسوم بيانية تفاعلية
- قائمة الأنشطة الأخيرة

### 2. إدارة المستخدمين (Admin)
- عرض جميع المستخدمين
- البحث والتصفية
- حظر/إلغاء حظر
- حذف المستخدمين

### 3. إدارة الأقسام
- إضافة، تعديل، حذف
- البحث
- عرض عدد الصور في كل قسم

### 4. إدارة الصور
- عرض جميع الصور
- البحث والتصفية حسب القسم
- نقل الصور بين الأقسام
- حذف الصور

### 5. رفع الصور
- رفع صور متعددة
- Drag & Drop
- Preview قبل الرفع
- اختيار القسم

## الأدوات المستخدمة

- **React 19** - Frontend Framework
- **Vite** - Build Tool
- **React Router** - Navigation
- **Axios** - HTTP Client
- **React Icons** - Icons
- **Recharts** - Charts

## البنية

```
src/
├── config/         # API configuration
├── context/        # React Context
├── utils/          # Helper functions
├── components/     # Reusable components
├── pages/          # Page components
└── styles/         # CSS files
```

## ملاحظات مهمة

1. **تأكد من تشغيل Backend**
   - يجب أن يعمل على: http://localhost:5000
   - يجب أن يكون متصل بقاعدة البيانات

2. **CORS**
   - تأكد من تفعيل CORS في Backend
   - السماح للـ Origin: http://localhost:5173

3. **JWT Token**
   - يتم حفظه في localStorage
   - يتم إرساله في Header: Authorization

4. **Auto Logout**
   - عند انتهاء الـ Token (401)
   - يتم التوجيه تلقائياً لصفحة Login

## استكشاف الأخطاء

### المشروع لا يعمل
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules
npm install
npm run dev
```

### خطأ في الاتصال بالـ API
- تحقق من تشغيل Backend
- تحقق من API_BASE_URL في `src/config/api.js`
- تحقق من إعدادات CORS

### خطأ في التسجيل
- تحقق من صحة البيانات
- تحقق من اتصال Backend بقاعدة البيانات

## التطوير

### إضافة صفحة جديدة
1. إنشاء الصفحة في `src/pages/`
2. إضافة CSS في `src/styles/`
3. إضافة Route في `src/App.jsx`

### إضافة مكون جديد
1. إنشاء المكون في `src/components/`
2. إضافة CSS إذا لزم الأمر
3. استيراده حيث تحتاجه

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، راجع:
- README-DASHBOARD.md
- الكود المصدري في `src/`
