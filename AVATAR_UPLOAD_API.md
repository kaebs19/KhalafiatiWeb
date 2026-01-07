# 🖼️ دليل استخدام API رفع الصورة الشخصية

## ✅ الحل الموجود حالياً

لديك **3 طرق** لرفع الصورة الشخصية (Avatar):

---

## 1️⃣ PUT /api/auth/profile/avatar (مُوصى به لـ iOS)

**الطريقة الأفضل للتطبيقات** - مخصصة لرفع الصورة الشخصية فقط

### المواصفات:
- **Method**: `PUT`
- **Endpoint**: `/api/auth/profile/avatar`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer {token}`
- **Field Name**: `avatar`
- **Max Size**: 2MB
- **Allowed Types**: jpeg, jpg, png, gif, webp

### مثال cURL:
```bash
curl -X PUT http://localhost:5000/api/auth/profile/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### مثال JavaScript:
```javascript
const formData = new FormData();
formData.append('avatar', imageFile);

const response = await fetch('http://localhost:5000/api/auth/profile/avatar', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log(data);
```

### مثال Swift (iOS):
```swift
let url = URL(string: "http://localhost:5000/api/auth/profile/avatar")!
var request = URLRequest(url: url)
request.httpMethod = "PUT"
request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

let boundary = UUID().uuidString
request.setValue("multipart/form-data; boundary=\(boundary)",
                 forHTTPHeaderField: "Content-Type")

var body = Data()

// Add avatar image
if let imageData = image.jpegData(compressionQuality: 0.8) {
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"avatar\"; filename=\"avatar.jpg\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
    body.append(imageData)
    body.append("\r\n".data(using: .utf8)!)
}

body.append("--\(boundary)--\r\n".data(using: .utf8)!)
request.httpBody = body

URLSession.shared.dataTask(with: request) { data, response, error in
    // Handle response
}.resume()
```

### الاستجابة الناجحة:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user": {
      "_id": "123...",
      "username": "user123",
      "email": "user@example.com",
      "fullName": "User Name",
      "avatar": "avatar-1234567890.jpg",
      "avatarUrl": "/uploads/avatars/avatar-1234567890.jpg",
      "role": "user",
      "createdAt": "2025-01-02T12:00:00.000Z",
      "updatedAt": "2025-01-02T12:30:00.000Z"
    }
  }
}
```

---

## 2️⃣ POST /api/auth/avatar (طريقة بديلة)

نفس الطريقة الأولى لكن باستخدام POST بدلاً من PUT

### المواصفات:
- **Method**: `POST`
- **Endpoint**: `/api/auth/avatar`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer {token}`
- **Field Name**: `avatar`

### مثال:
```bash
curl -X POST http://localhost:5000/api/auth/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

---

## 3️⃣ PUT /api/auth/profile (تحديث شامل)

**لتحديث الملف الشخصي كاملاً** - يمكن رفع avatar و cover معاً

### المواصفات:
- **Method**: `PUT`
- **Endpoint**: `/api/auth/profile`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer {token}`
- **Fields**:
  - `avatar` (اختياري) - الصورة الشخصية
  - `cover` (اختياري) - صورة الغلاف
  - `username` (اختياري) - اسم المستخدم
  - `email` (اختياري) - البريد الإلكتروني
  - `fullName` (اختياري) - الاسم الكامل
  - `bio` (اختياري) - النبذة الشخصية
  - `socialMedia` (اختياري) - روابط وسائل التواصل

### مثال:
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "cover=@/path/to/cover.jpg" \
  -F "fullName=John Doe" \
  -F "bio=Web Developer"
```

### مثال JavaScript (تحديث شامل):
```javascript
const formData = new FormData();
formData.append('avatar', avatarFile);
formData.append('cover', coverFile);
formData.append('fullName', 'John Doe');
formData.append('bio', 'Web Developer');
formData.append('socialMedia', JSON.stringify({
  facebook: 'https://facebook.com/...',
  twitter: 'https://twitter.com/...',
  instagram: 'https://instagram.com/...'
}));

const response = await fetch('http://localhost:5000/api/auth/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## 🧪 اختبار API

### 1. باستخدام صفحة HTML للتجربة:
افتح الملف `test-avatar-upload.html` في المتصفح:
```bash
open test-avatar-upload.html
```

### 2. باستخدام Postman:
1. أنشئ طلب جديد
2. اختر `PUT` كـ Method
3. أدخل URL: `http://localhost:5000/api/auth/profile/avatar`
4. اذهب إلى **Headers** وأضف:
   - Key: `Authorization`
   - Value: `Bearer YOUR_JWT_TOKEN`
5. اذهب إلى **Body**
6. اختر `form-data`
7. أضف:
   - Key: `avatar` (غيّر النوع إلى File)
   - Value: اختر صورة من جهازك
8. اضغط **Send**

### 3. الحصول على Token:
أولاً، قم بتسجيل الدخول:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

ستحصل على Response يحتوي على `token`، استخدمه في رفع الصورة.

---

## ⚠️ معالجة الأخطاء

### خطأ 400 - File too large:
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB."
}
```
**الحل**: استخدم صورة أصغر من 2MB

### خطأ 400 - Only image files allowed:
```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```
**الحل**: استخدم ملف صورة بصيغة صحيحة

### خطأ 401 - Unauthorized:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```
**الحل**: تأكد من إرسال Token صحيح في Header

### خطأ 404 - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```
**الحل**: Token غير صالح أو المستخدم محذوف

---

## 📁 هيكل الملفات

```
backend/
├── controllers/
│   └── authController.js       # يحتوي على uploadAvatar و uploadCoverImage
├── routes/
│   └── authRoutes.js           # Routes المعرفة
├── middleware/
│   ├── auth.js                 # Middleware للحماية
│   └── upload.js               # Multer configuration
├── models/
│   └── User.js                 # User schema
└── uploads/
    ├── avatars/                # مجلد الصور الشخصية
    └── covers/                 # مجلد صور الأغلفة
```

---

## 🔧 التطوير المستقبلي (اختياري)

إذا أردت إضافة ميزات إضافية:

### 1. ضغط الصور تلقائياً:
```bash
npm install sharp
```

### 2. رفع للسحابة (Cloudinary):
```bash
npm install cloudinary
```

### 3. التحقق من أبعاد الصورة:
```javascript
// في middleware/upload.js
const sharp = require('sharp');

const checkImageDimensions = async (req, res, next) => {
  if (req.file) {
    const metadata = await sharp(req.file.path).metadata();
    if (metadata.width > 2000 || metadata.height > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Image dimensions too large. Max: 2000x2000'
      });
    }
  }
  next();
};
```

---

## ✅ الملخص

- ✅ **3 endpoints جاهزة للاستخدام**
- ✅ **Multipart form-data متاح**
- ✅ **معالجة الأخطاء موجودة**
- ✅ **حذف الصور القديمة تلقائياً**
- ✅ **حماية بالـ JWT**
- ✅ **صفحة تجربة HTML جاهزة**

الـ API جاهز تماماً للاستخدام! 🎉
