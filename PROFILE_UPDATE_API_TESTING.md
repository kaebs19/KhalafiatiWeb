# 📱 اختبار تحديث الملف الشخصي + روابط التواصل

## ✅ الوضع الحالي

Backend **جاهز ومُفعّل** لاستقبال:
- ✅ صورة الملف الشخصي (avatar)
- ✅ صورة الغلاف (cover)
- ✅ روابط التواصل الاجتماعي (socialMedia)

---

## 🔧 API Endpoint

### PUT /api/auth/profile

**URL:**
```
https://khalafiati.io/api/auth/profile
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: multipart/form-data
```

---

## 📦 Request Body

### الحقول المدعومة:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `avatar` | File | ❌ | صورة الملف الشخصي (JPG/PNG) |
| `cover` | File | ❌ | صورة الغلاف (JPG/PNG) |
| `username` | String | ❌ | اسم المستخدم |
| `email` | String | ❌ | البريد الإلكتروني |
| `fullName` | String | ❌ | الاسم الكامل |
| `bio` | String | ❌ | نبذة عن المستخدم |
| `socialMedia` | JSON String | ❌ | روابط التواصل الاجتماعي |

---

## 🔹 socialMedia Format

يجب إرسال `socialMedia` كـ **JSON string** في multipart form:

```json
{
  "facebook": "https://facebook.com/username",
  "twitter": "https://twitter.com/username",
  "instagram": "https://instagram.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "website": "https://mywebsite.com"
}
```

---

## 📱 Swift Implementation

### 1. تحديث الملف الشخصي (مع صورة)

```swift
func updateProfile(
    avatar: UIImage? = nil,
    cover: UIImage? = nil,
    fullName: String? = nil,
    bio: String? = nil,
    socialMedia: SocialMedia? = nil
) async throws -> User {
    guard let token = UserDefaults.standard.string(forKey: "authToken") else {
        throw APIError.noToken
    }

    let url = URL(string: "https://khalafiati.io/api/auth/profile")!
    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    // Create multipart form data
    let boundary = "Boundary-\(UUID().uuidString)"
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    var body = Data()

    // Add avatar if provided
    if let avatar = avatar, let imageData = avatar.jpegData(compressionQuality: 0.8) {
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"avatar\"; filename=\"avatar.jpg\"\r\n")
        body.append("Content-Type: image/jpeg\r\n\r\n")
        body.append(imageData)
        body.append("\r\n")
    }

    // Add cover if provided
    if let cover = cover, let imageData = cover.jpegData(compressionQuality: 0.8) {
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"cover\"; filename=\"cover.jpg\"\r\n")
        body.append("Content-Type: image/jpeg\r\n\r\n")
        body.append(imageData)
        body.append("\r\n")
    }

    // Add fullName if provided
    if let fullName = fullName {
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"fullName\"\r\n\r\n")
        body.append("\(fullName)\r\n")
    }

    // Add bio if provided
    if let bio = bio {
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"bio\"\r\n\r\n")
        body.append("\(bio)\r\n")
    }

    // Add socialMedia if provided
    if let socialMedia = socialMedia {
        let socialMediaJSON = try JSONEncoder().encode(socialMedia)
        if let socialMediaString = String(data: socialMediaJSON, encoding: .utf8) {
            body.append("--\(boundary)\r\n")
            body.append("Content-Disposition: form-data; name=\"socialMedia\"\r\n\r\n")
            body.append("\(socialMediaString)\r\n")
        }
    }

    body.append("--\(boundary)--\r\n")
    request.httpBody = body

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let httpResponse = response as? HTTPURLResponse else {
        throw APIError.invalidResponse
    }

    if httpResponse.statusCode == 200 {
        let updateResponse = try JSONDecoder().decode(UpdateProfileResponse.self, from: data)
        return updateResponse.data.user
    } else {
        let errorResponse = try JSONDecoder().decode(ErrorResponse.self, from: data)
        throw APIError.serverError(errorResponse.message)
    }
}

// Extension لإضافة String إلى Data
extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
```

---

### 2. تحديث روابط التواصل فقط (بدون صورة)

```swift
func updateSocialMedia(_ socialMedia: SocialMedia) async throws -> User {
    guard let token = UserDefaults.standard.string(forKey: "authToken") else {
        throw APIError.noToken
    }

    let url = URL(string: "https://khalafiati.io/api/auth/profile")!
    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let boundary = "Boundary-\(UUID().uuidString)"
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    var body = Data()

    // Encode socialMedia as JSON string
    let socialMediaJSON = try JSONEncoder().encode(socialMedia)
    if let socialMediaString = String(data: socialMediaJSON, encoding: .utf8) {
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"socialMedia\"\r\n\r\n")
        body.append("\(socialMediaString)\r\n")
    }

    body.append("--\(boundary)--\r\n")
    request.httpBody = body

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let httpResponse = response as? HTTPURLResponse else {
        throw APIError.invalidResponse
    }

    if httpResponse.statusCode == 200 {
        let updateResponse = try JSONDecoder().decode(UpdateProfileResponse.self, from: data)
        return updateResponse.data.user
    } else {
        let errorResponse = try JSONDecoder().decode(ErrorResponse.self, from: data)
        throw APIError.serverError(errorResponse.message)
    }
}
```

---

### 3. Swift Models

```swift
struct SocialMedia: Codable {
    var facebook: String
    var twitter: String
    var instagram: String
    var linkedin: String
    var website: String

    init(
        facebook: String = "",
        twitter: String = "",
        instagram: String = "",
        linkedin: String = "",
        website: String = ""
    ) {
        self.facebook = facebook
        self.twitter = twitter
        self.instagram = instagram
        self.linkedin = linkedin
        self.website = website
    }
}

struct User: Codable {
    let id: String
    let username: String
    let email: String
    let fullName: String?
    let bio: String?
    let avatar: String?
    let avatarUrl: String?
    let avatarThumbnail: String?
    let coverImage: String?
    let coverUrl: String?
    let socialMedia: SocialMedia?
    let role: String
    let uploadCount: Int
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case username, email, fullName, bio
        case avatar, avatarUrl, avatarThumbnail
        case coverImage, coverUrl
        case socialMedia, role, uploadCount, createdAt
    }
}

struct UpdateProfileResponse: Codable {
    let success: Bool
    let data: UserData
}

struct UserData: Codable {
    let user: User
}
```

---

## 🧪 اختبار مع cURL

### Test 1: رفع صورة الملف الشخصي

```bash
curl -X PUT https://khalafiati.io/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### Test 2: تحديث روابط التواصل

```bash
curl -X PUT https://khalafiati.io/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'socialMedia={"facebook":"https://facebook.com/user","twitter":"https://twitter.com/user","instagram":"https://instagram.com/user","linkedin":"","website":""}'
```

### Test 3: تحديث الصورة + البيانات + روابط التواصل

```bash
curl -X PUT https://khalafiati.io/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "cover=@/path/to/cover.jpg" \
  -F "fullName=محمد أحمد" \
  -F "bio=مصور محترف" \
  -F 'socialMedia={"facebook":"https://facebook.com/mohamed","twitter":"https://twitter.com/mohamed","instagram":"https://instagram.com/mohamed","linkedin":"","website":"https://mysite.com"}'
```

---

## 📋 Response

### Success Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6951b309bd32b663b347a086",
      "username": "testuser",
      "email": "test@example.com",
      "fullName": "محمد أحمد",
      "bio": "مصور محترف",
      "avatar": "avatar-1736047893123-123456789.jpg",
      "avatarUrl": "/uploads/avatars/avatar-1736047893123-123456789.jpg",
      "avatarThumbnail": "avatar-1736047893123-123456789-thumb.jpg",
      "coverImage": "cover-1736047893124-987654321.jpg",
      "coverUrl": "/uploads/covers/cover-1736047893124-987654321.jpg",
      "socialMedia": {
        "facebook": "https://facebook.com/mohamed",
        "twitter": "https://twitter.com/mohamed",
        "instagram": "https://instagram.com/mohamed",
        "linkedin": "",
        "website": "https://mysite.com"
      },
      "role": "user",
      "uploadCount": 5,
      "createdAt": "2026-01-02T23:47:05.123Z"
    }
  }
}
```

### Error Response (Username taken):
```json
{
  "success": false,
  "message": "Username already taken"
}
```

---

## 🎨 SwiftUI Example

```swift
struct EditProfileView: View {
    @State private var fullName: String = ""
    @State private var bio: String = ""
    @State private var facebook: String = ""
    @State private var twitter: String = ""
    @State private var instagram: String = ""
    @State private var website: String = ""

    @State private var selectedAvatar: UIImage?
    @State private var showImagePicker = false
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        Form {
            Section("الصورة الشخصية") {
                Button {
                    showImagePicker = true
                } label: {
                    HStack {
                        if let avatar = selectedAvatar {
                            Image(uiImage: avatar)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 80, height: 80)
                                .clipShape(Circle())
                        } else {
                            Image(systemName: "person.circle.fill")
                                .resizable()
                                .frame(width: 80, height: 80)
                                .foregroundColor(.gray)
                        }
                        Text("تغيير الصورة")
                            .foregroundColor(.blue)
                    }
                }
            }

            Section("المعلومات الأساسية") {
                TextField("الاسم الكامل", text: $fullName)
                TextField("نبذة عنك", text: $bio, axis: .vertical)
                    .lineLimit(3...6)
            }

            Section("روابط التواصل الاجتماعي") {
                TextField("Facebook", text: $facebook)
                    .textContentType(.URL)
                    .autocapitalization(.none)

                TextField("Twitter", text: $twitter)
                    .textContentType(.URL)
                    .autocapitalization(.none)

                TextField("Instagram", text: $instagram)
                    .textContentType(.URL)
                    .autocapitalization(.none)

                TextField("Website", text: $website)
                    .textContentType(.URL)
                    .autocapitalization(.none)
            }

            if let error = errorMessage {
                Section {
                    Text(error)
                        .foregroundColor(.red)
                }
            }

            Section {
                Button {
                    Task {
                        await saveProfile()
                    }
                } label: {
                    if isLoading {
                        ProgressView()
                    } else {
                        Text("حفظ التغييرات")
                            .frame(maxWidth: .infinity)
                            .bold()
                    }
                }
                .disabled(isLoading)
            }
        }
        .navigationTitle("تعديل الملف الشخصي")
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(image: $selectedAvatar)
        }
    }

    func saveProfile() async {
        isLoading = true
        errorMessage = nil

        do {
            let socialMedia = SocialMedia(
                facebook: facebook,
                twitter: twitter,
                instagram: instagram,
                linkedin: "",
                website: website
            )

            let updatedUser = try await updateProfile(
                avatar: selectedAvatar,
                fullName: fullName.isEmpty ? nil : fullName,
                bio: bio.isEmpty ? nil : bio,
                socialMedia: socialMedia
            )

            // Success - update local user data
            print("Profile updated successfully!")

        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
```

---

## ⚠️ ملاحظات مهمة

### 1. حجم الصور:
- **Avatar:** يُفضل 500x500 بكسل أو أكبر
- **Cover:** يُفضل 1920x400 بكسل
- الحد الأقصى: 15MB (nginx config)

### 2. الحقول الإلزامية:
- **لا يوجد حقول إلزامية** - أرسل فقط ما تريد تحديثه
- إذا لم ترسل حقل، سيبقى كما هو

### 3. socialMedia:
- يجب إرسالها كـ **JSON string** في multipart form
- الحقول الفارغة: ضع `""` وليس `null`

### 4. الصور القديمة:
- Backend يحذف الصور القديمة تلقائياً عند رفع صورة جديدة

---

## 🐛 استكشاف الأخطاء

### المشكلة: socialMedia يرجع nil
**الحل:** تأكد من إرسالها كـ JSON string:
```swift
// ✅ صحيح
let jsonData = try JSONEncoder().encode(socialMedia)
let jsonString = String(data: jsonData, encoding: .utf8)
body.append("socialMedia\": \"\(jsonString)\"")

// ❌ خطأ
body.append("socialMedia\": \(socialMedia)")
```

### المشكلة: الصورة لا تُرفع
**الحل:** تأكد من:
1. Field name هو `avatar` أو `cover`
2. Content-Type هو `image/jpeg` أو `image/png`
3. الملف لا يتجاوز 15MB

### المشكلة: 401 Unauthorized
**الحل:** تأكد من:
1. إرسال Token في Header
2. Token صحيح وغير منتهي الصلاحية

---

## ✅ Checklist

- [ ] اختبار رفع avatar فقط
- [ ] اختبار رفع cover فقط
- [ ] اختبار تحديث socialMedia فقط
- [ ] اختبار رفع avatar + socialMedia معاً
- [ ] اختبار تحديث fullName + bio
- [ ] التأكد من حذف الصور القديمة
- [ ] التأكد من عودة socialMedia في Response

---

**آخر تحديث:** 2026-01-03
**Backend Status:** ✅ جاهز ومُفعّل
