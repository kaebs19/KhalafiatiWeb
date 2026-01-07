# 🖼️ API رفع الصورة الشخصية - جاهز للاستخدام!

## ✅ الحالة: مكتمل بنجاح

الـ API **موجود ويعمل بشكل كامل**! لم تكن هناك حاجة لإضافة أي كود جديد.

---

## 🚀 البدء السريع

### الخطوة 1️⃣: تسجيل الدخول للحصول على Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**النتيجة:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

انسخ الـ `token` من الـ response.

---

### الخطوة 2️⃣: رفع الصورة الشخصية

#### الطريقة الأولى: PUT /api/auth/profile/avatar (مُوصى به)

```bash
curl -X PUT http://localhost:5000/api/auth/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/your/image.jpg"
```

#### الطريقة الثانية: POST /api/auth/avatar

```bash
curl -X POST http://localhost:5000/api/auth/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/your/image.jpg"
```

#### الطريقة الثالثة: PUT /api/auth/profile (شامل)

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/your/image.jpg" \
  -F "fullName=John Doe" \
  -F "bio=Web Developer"
```

**النتيجة:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "user123",
      "avatar": "avatar-1735876543257-385595422.jpeg",
      "avatarUrl": "/uploads/avatars/avatar-1735876543257-385595422.jpeg",
      ...
    }
  }
}
```

---

### الخطوة 3️⃣: عرض الصورة

الصورة متاحة على:
```
http://localhost:5000/uploads/avatars/{filename}
```

أو استخدم `avatarUrl` من الـ response:
```
http://localhost:5000{avatarUrl}
```

---

## 📱 كود iOS / Swift

```swift
func uploadAvatar(image: UIImage, token: String) {
    let url = URL(string: "http://localhost:5000/api/auth/profile/avatar")!
    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let boundary = UUID().uuidString
    request.setValue("multipart/form-data; boundary=\(boundary)",
                     forHTTPHeaderField: "Content-Type")

    var body = Data()

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
        guard let data = data, error == nil else {
            print("Error: \(error?.localizedDescription ?? "Unknown error")")
            return
        }

        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            print("Response:", json)
            if let success = json["success"] as? Bool, success {
                print("✅ Avatar uploaded successfully!")
            }
        }
    }.resume()
}
```

---

## 🌐 كود JavaScript / React

```javascript
async function uploadAvatar(imageFile, token) {
  const formData = new FormData();
  formData.append('avatar', imageFile);

  try {
    const response = await fetch('http://localhost:5000/api/auth/profile/avatar', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Avatar uploaded:', data.data.user.avatarUrl);
      return data.data.user;
    } else {
      console.error('❌ Upload failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// مثال على الاستخدام في React Component
function AvatarUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      const user = await uploadAvatar(selectedFile, token);
      alert('تم رفع الصورة بنجاح!');
      console.log('New avatar URL:', user.avatarUrl);
    } catch (error) {
      alert('فشل رفع الصورة: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? 'جاري الرفع...' : 'رفع الصورة'}
      </button>
    </div>
  );
}
```

---

## 🧪 أدوات الاختبار المتوفرة

### 1. صفحة HTML تفاعلية
```bash
open test-avatar-upload.html
```

**المميزات:**
- واجهة عربية بسيطة
- 3 خيارات endpoints
- معاينة الصورة بعد الرفع
- حفظ Token تلقائياً

### 2. سكريبت Node.js
```bash
node test-avatar-api.js
```

**الاستخدام:**
1. عدّل `TOKEN` و `IMAGE_PATH` في الملف
2. شغّل السكريبت
3. سيقوم باختبار جميع الـ endpoints

### 3. Postman
راجع ملف `AVATAR_UPLOAD_API.md` للتعليمات المفصلة

---

## 📋 المواصفات التقنية

| المواصفة | القيمة |
|----------|--------|
| Endpoints | `PUT /api/auth/profile/avatar`, `POST /api/auth/avatar`, `PUT /api/auth/profile` |
| Method | PUT / POST |
| Content-Type | multipart/form-data |
| Field Name | `avatar` |
| Max File Size | 2MB (avatars), 5MB (covers), 10MB (profile) |
| Allowed Types | jpeg, jpg, png, gif, webp |
| Authentication | JWT Bearer Token |
| Response Format | JSON |

---

## 📁 الملفات ذات الصلة

```
khalafiati/
├── backend/
│   ├── controllers/
│   │   └── authController.js           # سطر 553: uploadAvatar
│   ├── middleware/
│   │   ├── auth.js                     # JWT protection
│   │   └── upload.js                   # سطر 113: uploadAvatar middleware
│   ├── routes/
│   │   └── authRoutes.js               # سطر 34 و 36: avatar routes
│   └── uploads/
│       └── avatars/                    # مجلد حفظ الصور
│
├── test-avatar-upload.html             # صفحة اختبار HTML
├── test-avatar-api.js                  # سكريبت اختبار Node.js
├── AVATAR_UPLOAD_API.md                # دليل مفصل
├── SOLUTION_SUMMARY.md                 # ملخص الحل
├── CREATE_TEST_IMAGE.md                # كيفية إنشاء صورة تجريبية
└── README_AVATAR_API.md                # هذا الملف
```

---

## ❓ الأسئلة الشائعة

### س: هل أحتاج إلى إضافة أي كود جديد؟
**ج:** لا! الـ API موجود ويعمل بالكامل.

### س: أي endpoint يجب أن أستخدم؟
**ج:** استخدم `PUT /api/auth/profile/avatar` - إنه الأفضل والأكثر وضوحاً.

### س: هل يمكن رفع صورة الغلاف أيضاً؟
**ج:** نعم! استخدم `PUT /api/auth/profile` مع fields `avatar` و `cover`.

### س: كيف أحذف الصورة الشخصية؟
**ج:** حالياً لا يوجد endpoint محدد للحذف، لكن يمكنك:
- رفع صورة جديدة (ستحذف القديمة تلقائياً)
- أو أرسل `avatar: null` في `PUT /api/auth/me`

### س: أين تُحفظ الصور؟
**ج:** في `backend/uploads/avatars/`

### س: كيف أعرض الصورة في التطبيق؟
**ج:** استخدم `http://localhost:5000${user.avatarUrl}`

---

## 🔒 الأمان

- ✅ مصادقة JWT مطلوبة لجميع عمليات الرفع
- ✅ التحقق من نوع الملف (صور فقط)
- ✅ حد أقصى لحجم الملف
- ✅ أسماء ملفات عشوائية لمنع الاستبدال
- ✅ حذف الصورة القديمة تلقائياً لتوفير المساحة

---

## 🎯 الخطوات التالية (اختياري)

إذا أردت تحسين النظام مستقبلاً:

1. **ضغط الصور:**
   ```bash
   npm install sharp
   ```

2. **رفع للسحابة (Cloudinary):**
   ```bash
   npm install cloudinary
   ```

3. **إضافة endpoint للحذف:**
   ```javascript
   // DELETE /api/auth/avatar
   ```

4. **إضافة معاينة صغيرة (thumbnail):**
   ```javascript
   // إنشاء نسخة مصغرة تلقائياً
   ```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع `AVATAR_UPLOAD_API.md` للتفاصيل الكاملة
2. راجع `SOLUTION_SUMMARY.md` لفهم كيف يعمل النظام
3. افتح ملف HTML للاختبار السريع

---

## ✅ الملخص

| المتطلب | الحالة |
|---------|--------|
| Endpoint رفع الصورة | ✅ موجود |
| Multipart form-data | ✅ مدعوم |
| JWT Authentication | ✅ موجود |
| معالجة الأخطاء | ✅ موجود |
| حذف الصورة القديمة | ✅ تلقائي |
| أدوات اختبار | ✅ متوفرة |
| توثيق | ✅ مكتمل |

**النتيجة النهائية:** الـ API جاهز 100% للاستخدام! 🎉

---

تاريخ: 2025-01-02
الحالة: ✅ مكتمل ومختبر
