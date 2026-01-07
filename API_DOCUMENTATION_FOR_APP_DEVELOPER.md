# 📱 وثيقة API - لمطور التطبيق

## 🔗 Base URL
```
https://khalafiati.io/api
```

---

## ✅ الميزات الجديدة المُضافة

### 1. نظام إدارة المحتوى (CMS)
### 2. حذف الحساب

---

## 📄 1. صفحات المحتوى (CMS)

### الصفحات المتوفرة:
- `privacy-policy` - سياسة الخصوصية
- `terms-of-service` - شروط الاستخدام
- `about-us` - حول التطبيق
- `contact-us` - اتصل بنا

---

### 🔹 GET جميع الصفحات

**Endpoint:**
```
GET /api/settings
```

**Headers:**
```
لا يحتاج authentication (Public)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "_id": "69585ffe480bd46588a75b4f",
        "key": "privacy-policy",
        "title": {
          "ar": "سياسة الخصوصية",
          "en": "Privacy Policy"
        },
        "content": {
          "ar": "<h2>سياسة الخصوصية...</h2>",
          "en": "Privacy Policy content..."
        },
        "contactInfo": {
          "email": "",
          "phone": "",
          "address": "",
          "socialMedia": {
            "facebook": "",
            "twitter": "",
            "instagram": "",
            "linkedin": ""
          }
        },
        "isPublished": true,
        "createdAt": "2026-01-03T00:17:02.751Z",
        "updatedAt": "2026-01-03T00:17:02.751Z"
      }
    ]
  }
}
```

**مثال Swift:**
```swift
func fetchAllSettings() async throws -> [Setting] {
    let url = URL(string: "https://khalafiati.io/api/settings")!
    let (data, _) = try await URLSession.shared.data(from: url)
    let response = try JSONDecoder().decode(SettingsResponse.self, from: data)
    return response.data.settings
}
```

---

### 🔹 GET صفحة محددة

**Endpoint:**
```
GET /api/settings/:key
```

**Parameters:**
- `key` - أحد القيم: `privacy-policy` | `terms-of-service` | `about-us` | `contact-us`

**مثال:**
```
GET /api/settings/privacy-policy
```

**Response:**
```json
{
  "success": true,
  "data": {
    "setting": {
      "_id": "69585ffe480bd46588a75b4f",
      "key": "privacy-policy",
      "title": {
        "ar": "سياسة الخصوصية",
        "en": "Privacy Policy"
      },
      "content": {
        "ar": "<h2>سياسة الخصوصية - خلفيات</h2>\n\n<p>نحن في خلفيات نلتزم بحماية خصوصيتك...</p>",
        "en": "Privacy Policy content in English..."
      },
      "contactInfo": {
        "email": "",
        "phone": "",
        "address": "",
        "socialMedia": {
          "facebook": "",
          "twitter": "",
          "instagram": "",
          "linkedin": ""
        }
      },
      "isPublished": true,
      "createdAt": "2026-01-03T00:17:02.751Z",
      "updatedAt": "2026-01-03T00:17:02.751Z"
    }
  }
}
```

**مثال Swift:**
```swift
func fetchPrivacyPolicy() async throws -> Setting {
    let url = URL(string: "https://khalafiati.io/api/settings/privacy-policy")!
    let (data, _) = try await URLSession.shared.data(from: url)
    let response = try JSONDecoder().decode(SettingDetailResponse.self, from: data)
    return response.data.setting
}
```

**مثال عرض في SwiftUI:**
```swift
struct PrivacyPolicyView: View {
    @State private var content: String = ""
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView()
            } else {
                // استخدم WKWebView أو AttributedString لعرض HTML
                HTMLView(htmlContent: content)
                    .padding()
            }
        }
        .navigationTitle("سياسة الخصوصية")
        .task {
            await loadPrivacyPolicy()
        }
    }

    func loadPrivacyPolicy() async {
        do {
            let setting = try await fetchPrivacyPolicy()
            content = setting.content.ar
            isLoading = false
        } catch {
            print("Error: \(error)")
        }
    }
}
```

---

### 🔹 صفحة اتصل بنا (Contact Us)

**مميزة:** تحتوي على معلومات إضافية في `contactInfo`

**Endpoint:**
```
GET /api/settings/contact-us
```

**Response:**
```json
{
  "success": true,
  "data": {
    "setting": {
      "key": "contact-us",
      "title": {
        "ar": "اتصل بنا",
        "en": "Contact Us"
      },
      "content": {
        "ar": "<h2>اتصل بنا</h2>...",
        "en": "Contact Us content..."
      },
      "contactInfo": {
        "email": "info@khalafiati.io",
        "phone": "+966 XX XXX XXXX",
        "address": "الرياض، المملكة العربية السعودية",
        "socialMedia": {
          "facebook": "https://facebook.com/khalafiati",
          "twitter": "https://x.com/B_c_Arab",
          "instagram": "https://www.instagram.com/hala.chat/",
          "linkedin": "https://linkedin.com/company/khalafiati"
        }
      }
    }
  }
}
```

**مثال Swift:**
```swift
struct ContactUsView: View {
    @State private var contactInfo: ContactInfo?

    var body: some View {
        List {
            if let info = contactInfo {
                Section("معلومات الاتصال") {
                    if !info.email.isEmpty {
                        Link("📧 \(info.email)", destination: URL(string: "mailto:\(info.email)")!)
                    }
                    if !info.phone.isEmpty {
                        Link("📞 \(info.phone)", destination: URL(string: "tel:\(info.phone)")!)
                    }
                }

                Section("وسائل التواصل") {
                    if !info.socialMedia.facebook.isEmpty {
                        Link("Facebook", destination: URL(string: info.socialMedia.facebook)!)
                    }
                    if !info.socialMedia.twitter.isEmpty {
                        Link("Twitter", destination: URL(string: info.socialMedia.twitter)!)
                    }
                    if !info.socialMedia.instagram.isEmpty {
                        Link("Instagram", destination: URL(string: info.socialMedia.instagram)!)
                    }
                }
            }
        }
    }
}
```

---

## 🗑️ 2. حذف الحساب

### 🔹 DELETE Account

**Endpoint:**
```
DELETE /api/auth/account
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "password": "user_password",
  "confirmation": "DELETE"
}
```

**⚠️ مهم:**
- يجب إدخال كلمة المرور الصحيحة
- يجب كتابة كلمة "DELETE" بالضبط (حساسة لحالة الأحرف)
- العملية **لا يمكن التراجع عنها**

**ما يتم حذفه:**
- ✅ الصورة الشخصية (avatar + thumbnail)
- ✅ صورة الغلاف (cover)
- ✅ جميع الصور المرفوعة من المستخدم
- ✅ بيانات الحساب من قاعدة البيانات

**Response - نجاح:**
```json
{
  "success": true,
  "message": "تم حذف الحساب بنجاح"
}
```

**Response - كلمة مرور خاطئة:**
```json
{
  "success": false,
  "message": "كلمة المرور غير صحيحة"
}
```

**Response - confirmation خاطئ:**
```json
{
  "success": false,
  "message": "يجب كتابة كلمة DELETE للتأكيد"
}
```

**مثال Swift:**
```swift
func deleteAccount(password: String) async throws {
    guard let token = UserDefaults.standard.string(forKey: "authToken") else {
        throw APIError.noToken
    }

    let url = URL(string: "https://khalafiati.io/api/auth/account")!
    var request = URLRequest(url: url)
    request.httpMethod = "DELETE"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let body: [String: String] = [
        "password": password,
        "confirmation": "DELETE"
    ]
    request.httpBody = try JSONEncoder().encode(body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let httpResponse = response as? HTTPURLResponse else {
        throw APIError.invalidResponse
    }

    if httpResponse.statusCode == 200 {
        // حذف ناجح - امسح البيانات المحلية
        UserDefaults.standard.removeObject(forKey: "authToken")
        UserDefaults.standard.removeObject(forKey: "userId")
        // انتقل إلى شاشة تسجيل الدخول
    } else {
        let errorResponse = try JSONDecoder().decode(ErrorResponse.self, from: data)
        throw APIError.serverError(errorResponse.message)
    }
}
```

**مثال SwiftUI - شاشة حذف الحساب:**
```swift
struct DeleteAccountView: View {
    @State private var password: String = ""
    @State private var confirmationText: String = ""
    @State private var showAlert = false
    @State private var isDeleting = false
    @State private var errorMessage: String?
    @Environment(\.dismiss) var dismiss

    var canDelete: Bool {
        !password.isEmpty && confirmationText == "DELETE"
    }

    var body: some View {
        Form {
            Section {
                Text("⚠️ تحذير: هذه العملية لا يمكن التراجع عنها")
                    .foregroundColor(.red)
                    .font(.headline)
            }

            Section("سيتم حذف") {
                Label("جميع صورك المرفوعة", systemImage: "photo.stack")
                Label("الصورة الشخصية", systemImage: "person.circle")
                Label("جميع بيانات حسابك", systemImage: "person.crop.circle.badge.xmark")
            }

            Section("التأكيد") {
                SecureField("كلمة المرور", text: $password)
                    .textContentType(.password)

                TextField("اكتب DELETE للتأكيد", text: $confirmationText)
                    .autocapitalization(.allCharacters)
            }

            if let error = errorMessage {
                Section {
                    Text(error)
                        .foregroundColor(.red)
                }
            }

            Section {
                Button(role: .destructive) {
                    Task {
                        await performDelete()
                    }
                } label: {
                    if isDeleting {
                        ProgressView()
                    } else {
                        Text("حذف الحساب نهائياً")
                            .frame(maxWidth: .infinity)
                            .bold()
                    }
                }
                .disabled(!canDelete || isDeleting)
            }
        }
        .navigationTitle("حذف الحساب")
        .alert("تم حذف الحساب", isPresented: $showAlert) {
            Button("موافق") {
                // Navigate to login
            }
        }
    }

    func performDelete() async {
        isDeleting = true
        errorMessage = nil

        do {
            try await deleteAccount(password: password)
            showAlert = true
        } catch {
            errorMessage = error.localizedDescription
        }

        isDeleting = false
    }
}
```

---

## 📦 Swift Models

```swift
// Settings Models
struct SettingsResponse: Codable {
    let success: Bool
    let data: SettingsData
}

struct SettingsData: Codable {
    let settings: [Setting]
}

struct SettingDetailResponse: Codable {
    let success: Bool
    let data: SettingDetailData
}

struct SettingDetailData: Codable {
    let setting: Setting
}

struct Setting: Codable, Identifiable {
    let id: String
    let key: String
    let title: LocalizedText
    let content: LocalizedText
    let contactInfo: ContactInfo?
    let isPublished: Bool
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case key, title, content, contactInfo, isPublished, createdAt, updatedAt
    }
}

struct LocalizedText: Codable {
    let ar: String
    let en: String?
}

struct ContactInfo: Codable {
    let email: String
    let phone: String
    let address: String
    let socialMedia: SocialMedia
}

struct SocialMedia: Codable {
    let facebook: String
    let twitter: String
    let instagram: String
    let linkedin: String
}

// Error Response
struct ErrorResponse: Codable {
    let success: Bool
    let message: String
}

enum APIError: Error {
    case noToken
    case invalidResponse
    case serverError(String)
}
```

---

## 🎨 UI/UX Recommendations

### 1. عرض صفحات المحتوى:
- استخدم `WKWebView` لعرض HTML
- أو حوّل HTML إلى AttributedString
- أضف navigation bar مع زر "رجوع"
- أضف loading indicator

### 2. حذف الحساب:
- ضع في Settings > Account > Delete Account
- أضف تحذيرات متعددة
- استخدم `confirmationDialog` أو Alert
- اطلب كلمة المرور + confirmation
- أظهر قائمة بما سيتم حذفه

### 3. روابط في التطبيق:
يُفضل إضافة روابط لصفحات المحتوى في:
- Settings > Legal > Privacy Policy
- Settings > Legal > Terms of Service
- Settings > About > About Us
- Settings > Support > Contact Us
- Registration screen (checkbox للموافقة على الشروط)

---

## ✅ Checklist للمطور

### صفحات المحتوى:
- [ ] إنشاء View لكل صفحة (Privacy, Terms, About, Contact)
- [ ] إضافة WKWebView لعرض HTML
- [ ] إضافة Loading state
- [ ] إضافة Error handling
- [ ] إضافة navigation في Settings
- [ ] Checkbox موافقة على الشروط في Registration

### حذف الحساب:
- [ ] إنشاء DeleteAccountView
- [ ] إضافة password field
- [ ] إضافة confirmation field (DELETE)
- [ ] إضافة تحذيرات متعددة
- [ ] Confirmation dialog قبل الحذف
- [ ] مسح البيانات المحلية بعد الحذف
- [ ] Navigation إلى Login بعد الحذف

---

## 🔗 روابط مفيدة

- **API Base URL:** https://khalafiati.io/api
- **Web Privacy Policy:** https://khalafiati.io/privacy-policy
- **Web Terms:** https://khalafiati.io/terms-of-service
- **Web About:** https://khalafiati.io/about-us
- **Web Contact:** https://khalafiati.io/contact-us

---

## 📞 للمساعدة

في حال وجود أي مشكلة أو استفسار:
- تواصل مع فريق Backend
- تحقق من الـ Response status codes
- راجع الـ error messages

**آخر تحديث:** 2026-01-03
