# 🔧 تقرير إصلاح مشاكل iOS API

**التاريخ:** 1 يناير 2026
**الحالة:** ✅ تم الإصلاح والرفع على السيرفر

---

## 📋 ملخص المشاكل المُصلحة

### ✅ المشاكل الثلاث:
1. ✅ صورة المستخدم - خطأ 404
2. ✅ البلاغ - خطأ 400 Bad Request
3. ✅ عدد الإشعارات - Decoding Error

---

## 🔴 المشكلة #1: صورة المستخدم 404

### الخطأ:
```
❌ Avatar load failed for @admin: Status Code: 404
URL: https://khalafiati.io/avatar-1767070347255-309323517.jpeg
```

### السبب:
التطبيق iOS كان يحصل على `avatar` بدلاً من `avatarUrl`:
- `avatar`: `"avatar-1767070347255-309323517.jpeg"` ❌
- `avatarUrl`: `"/uploads/avatars/avatar-1767070347255-309323517.jpeg"` ✅

### الحل:
**الصورة موجودة على السيرفر!** المشكلة في المسار فقط.

#### للمبرمج iOS:
يجب استخدام حقل `avatarUrl` من الـ Response بدلاً من `avatar`:

```swift
// ❌ خطأ - لا تستخدم
let avatarPath = user.avatar
// "avatar-1767070347255-309323517.jpeg"

// ✅ صحيح - استخدم avatarUrl
let avatarPath = user.avatarUrl
// "/uploads/avatars/avatar-1767070347255-309323517.jpeg"

// ثم بناء الـ URL الكامل
let fullURL = "https://khalafiati.io\(avatarPath)"
```

#### Response Format:
```json
{
  "user": {
    "_id": "...",
    "username": "admin",
    "avatar": "avatar-1767070347255-309323517.jpeg",
    "avatarUrl": "/uploads/avatars/avatar-1767070347255-309323517.jpeg",
    "coverImage": null,
    "coverImageUrl": null
  }
}
```

#### نفس الشيء للـ coverImage:
```swift
// استخدم coverImageUrl وليس coverImage
let coverPath = user.coverImageUrl
```

---

## 🔴 المشكلة #2: البلاغ 400 Bad Request

### الخطأ:
```
❌ فشل إرسال البلاغ: responseValidationFailed
Status Code: 400
```

### السبب:
**عدم توافق في أسماء الحقول:**

**التطبيق iOS يرسل:**
```json
{
  "targetType": "Image",
  "targetId": "67746f6b3a4b3a001122eedd",
  "reason": "inappropriate",
  "description": "محتوى غير لائق"
}
```

**الـ API كان يتوقع:**
```json
{
  "reportType": "image",
  "reportedImageId": "67746f6b3a4b3a001122eedd",
  "reason": "inappropriate",
  "description": "محتوى غير لائق"
}
```

### الحل:
✅ **تم تحديث API لدعم كلا الصيغتين!**

**الملف:** `backend/controllers/reportController.js`

```javascript
// الكود الجديد يدعم iOS format
if (targetType && targetId) {
  reportType = targetType.toLowerCase(); // "Image" -> "image"
  if (reportType === 'image') {
    reportedImageId = targetId;
  } else if (reportType === 'user') {
    reportedUserId = targetId;
  }
}
```

#### الآن التطبيق iOS يمكنه الإرسال بهذا الشكل:
```swift
let reportData = [
    "targetType": "Image",        // Capital I
    "targetId": imageId,
    "reason": "inappropriate",
    "description": description
]
```

#### Response المتوقع:
```json
{
  "success": true,
  "message": "Report submitted successfully. Our team will review it shortly.",
  "data": {
    "report": {
      "_id": "...",
      "reportType": "image",
      "reason": "inappropriate",
      "status": "pending",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 🔴 المشكلة #3: عدد الإشعارات Decoding Error

### الخطأ:
```
❌ فشل تحميل عدد غير المقروءة: DecodingError.keyNotFound
Key: "unreadCount"
```

### السبب:
**الـ API كان يُرجع `count` بدلاً من `unreadCount`:**

**قبل الإصلاح:**
```json
{
  "success": true,
  "data": {
    "count": 5    // ❌ خطأ
  }
}
```

**بعد الإصلاح:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5    // ✅ صحيح
  }
}
```

### الحل:
✅ **تم تحديث Response**

**الملف:** `backend/controllers/notificationController.js`

```javascript
// Before
data: {
  count    // ❌
}

// After
data: {
  unreadCount: count    // ✅
}
```

#### للتطبيق iOS:
```swift
struct UnreadCountResponse: Codable {
    let success: Bool
    let data: UnreadCountData
}

struct UnreadCountData: Codable {
    let unreadCount: Int    // ✅ سيعمل الآن
}
```

#### الـ Endpoint:
```
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

## 📊 ملخص التعديلات

### الملفات المعدلة:
```
✅ backend/controllers/reportController.js
   - دعم iOS format (targetType, targetId)

✅ backend/controllers/notificationController.js
   - تغيير count إلى unreadCount
```

### الملفات المرفوعة:
```bash
✅ rsync controllers/ -> السيرفر
✅ pm2 restart khalafiati-api
```

### حالة السيرفر:
```
✅ Backend: Online (2 instances)
✅ PM2: Restart Count: 8
✅ Status: Production Ready
```

---

## 📱 توصيات لمبرمج iOS

### 1. Avatar URLs
```swift
// دائماً استخدم avatarUrl وليس avatar
extension User {
    var fullAvatarURL: URL? {
        guard let avatarUrl = self.avatarUrl else { return nil }
        return URL(string: "https://khalafiati.io\(avatarUrl)")
    }

    var fullCoverURL: URL? {
        guard let coverUrl = self.coverImageUrl else { return nil }
        return URL(string: "https://khalafiati.io\(coverUrl)")
    }
}
```

### 2. Report Format
```swift
// الصيغة الحالية تعمل بشكل صحيح
struct ReportRequest: Codable {
    let targetType: String    // "Image" or "User"
    let targetId: String
    let reason: String        // "inappropriate", "spam", etc.
    let description: String?
}
```

### 3. Notification Badge
```swift
// تحديث الـ Badge
func updateNotificationBadge() {
    APIClient.shared.getUnreadCount { result in
        switch result {
        case .success(let response):
            DispatchQueue.main.async {
                UIApplication.shared.applicationIconBadgeNumber =
                    response.data.unreadCount
            }
        case .failure(let error):
            print("Failed to update badge: \(error)")
        }
    }
}
```

---

## 🧪 اختبارات مقترحة

### Test 1: Avatar Loading
```swift
// اختبر تحميل الصور
func testAvatarLoading() {
    APIClient.shared.getProfile { result in
        guard case .success(let response) = result else { return }

        let user = response.data.user
        print("Avatar: \(user.avatar ?? "none")")
        print("Avatar URL: \(user.avatarUrl ?? "none")")

        // يجب أن يكون avatarUrl يبدأ بـ /uploads/
        assert(user.avatarUrl?.hasPrefix("/uploads/") == true)
    }
}
```

### Test 2: Report Submission
```swift
func testReportSubmission() {
    let report = ReportRequest(
        targetType: "Image",
        targetId: "test-image-id",
        reason: "inappropriate",
        description: "Test report"
    )

    APIClient.shared.submitReport(report) { result in
        switch result {
        case .success(let response):
            print("✅ Report created: \(response.data.report.id)")
        case .failure(let error):
            print("❌ Failed: \(error)")
        }
    }
}
```

### Test 3: Unread Count
```swift
func testUnreadCount() {
    APIClient.shared.getUnreadCount { result in
        guard case .success(let response) = result else { return }

        let count = response.data.unreadCount
        print("Unread notifications: \(count)")

        // تحديث الـ Badge
        UIApplication.shared.applicationIconBadgeNumber = count
    }
}
```

---

## 📖 Response Models المحدثة

### User Model
```swift
struct User: Codable {
    let id: String
    let username: String
    let email: String
    let fullName: String
    let role: String
    let avatar: String?           // filename only
    let avatarUrl: String?        // ✅ استخدم هذا
    let coverImage: String?       // filename only
    let coverImageUrl: String?    // ✅ استخدم هذا
    let bio: String?
    let uploadCount: Int
    let createdAt: Date
}
```

### Report Model
```swift
struct ReportRequest: Codable {
    let targetType: String    // "Image" or "User"
    let targetId: String
    let reason: String
    let description: String?
}

struct ReportResponse: Codable {
    let success: Bool
    let message: String
    let data: ReportData
}

struct ReportData: Codable {
    let report: Report
}

struct Report: Codable {
    let id: String
    let reportType: String
    let reason: String
    let status: String        // pending, reviewed, resolved, rejected
    let description: String?
    let createdAt: Date
}
```

### Notification Model
```swift
struct UnreadCountResponse: Codable {
    let success: Bool
    let data: UnreadCountData
}

struct UnreadCountData: Codable {
    let unreadCount: Int      // ✅ محدث
}

struct NotificationResponse: Codable {
    let success: Bool
    let data: NotificationData
}

struct NotificationData: Codable {
    let notifications: [Notification]
    let pagination: Pagination
    let unreadCount: Int
}
```

---

## ✅ حالة الإصلاحات

| المشكلة | الحالة | التاريخ |
|---------|--------|---------|
| Avatar 404 | ✅ موثق | 2026-01-01 |
| Report 400 | ✅ مُصلح | 2026-01-01 |
| Unread Count | ✅ مُصلح | 2026-01-01 |
| رفع للسيرفر | ✅ مكتمل | 2026-01-01 |
| إعادة التشغيل | ✅ مكتمل | 2026-01-01 |

---

## 🚀 الخطوات التالية للمبرمج iOS

### يجب تحديث:
1. ✅ استخدام `avatarUrl` بدلاً من `avatar`
2. ✅ استخدام `coverImageUrl` بدلاً من `coverImage`
3. ✅ الـ Report يعمل الآن بنفس الصيغة
4. ✅ الـ unreadCount يُرجع بشكل صحيح

### اختبار مقترح:
```bash
# 1. اختبار Avatar URL
curl https://khalafiati.io/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. اختبار Report
curl -X POST https://khalafiati.io/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "targetType": "Image",
    "targetId": "IMAGE_ID",
    "reason": "inappropriate",
    "description": "Test"
  }'

# 3. اختبار Unread Count
curl https://khalafiati.io/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📞 للدعم

إذا واجهت أي مشاكل أخرى:

1. تحقق من Token validity
2. تحقق من Response format
3. راجع هذا الدليل
4. افحص Server logs

**الحالة:** ✅ جاهز للاختبار من التطبيق iOS

---

**تم التحديث:** 1 يناير 2026
**الإصدار:** v2.1.1
