/**
 * اختبار API رفع الصورة الشخصية
 *
 * الاستخدام:
 * 1. تأكد من تشغيل السيرفر
 * 2. غيّر قيمة TOKEN و IMAGE_PATH
 * 3. node test-avatar-api.js
 */

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

// ⚙️ الإعدادات
const API_URL = 'http://localhost:5000';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // ضع الـ Token هنا
const IMAGE_PATH = './test-image.jpg'; // مسار الصورة

// ============================================
// 1️⃣ اختبار PUT /api/auth/profile/avatar
// ============================================
async function testPutProfileAvatar() {
  console.log('\n📤 اختبار PUT /api/auth/profile/avatar...\n');

  try {
    const form = new FormData();
    form.append('avatar', fs.createReadStream(IMAGE_PATH));

    const response = await fetch(`${API_URL}/api/auth/profile/avatar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ نجح رفع الصورة!');
      console.log('🖼️ Avatar URL:', data.data.user.avatarUrl);
    } else {
      console.log('❌ فشل الرفع:', data.message);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// 2️⃣ اختبار POST /api/auth/avatar
// ============================================
async function testPostAvatar() {
  console.log('\n📤 اختبار POST /api/auth/avatar...\n');

  try {
    const form = new FormData();
    form.append('avatar', fs.createReadStream(IMAGE_PATH));

    const response = await fetch(`${API_URL}/api/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ نجح رفع الصورة!');
      console.log('🖼️ Avatar URL:', data.data.user.avatarUrl);
    } else {
      console.log('❌ فشل الرفع:', data.message);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// 3️⃣ اختبار PUT /api/auth/profile (شامل)
// ============================================
async function testPutProfile() {
  console.log('\n📤 اختبار PUT /api/auth/profile (تحديث شامل)...\n');

  try {
    const form = new FormData();
    form.append('avatar', fs.createReadStream(IMAGE_PATH));
    form.append('fullName', 'Test User');
    form.append('bio', 'Testing avatar upload API');

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ نجح تحديث الملف الشخصي!');
      console.log('🖼️ Avatar URL:', data.data.user.avatarUrl);
      console.log('👤 Full Name:', data.data.user.fullName);
      console.log('📝 Bio:', data.data.user.bio);
    } else {
      console.log('❌ فشل التحديث:', data.message);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// 4️⃣ اختبار الحصول على الملف الشخصي
// ============================================
async function testGetProfile() {
  console.log('\n📤 اختبار GET /api/auth/me...\n');

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    if (data.success && data.data.user.avatar) {
      console.log('✅ الملف الشخصي يحتوي على صورة!');
      console.log('🖼️ Avatar:', data.data.user.avatar);
      console.log('🖼️ Avatar URL:', data.data.user.avatarUrl);
      console.log('🌐 Full URL:', `${API_URL}${data.data.user.avatarUrl}`);
    } else {
      console.log('⚠️ لا توجد صورة شخصية');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// 🚀 تشغيل الاختبارات
// ============================================
async function runAllTests() {
  console.log('═══════════════════════════════════════════');
  console.log('🧪 اختبار API رفع الصورة الشخصية');
  console.log('═══════════════════════════════════════════');

  // التحقق من الإعدادات
  if (TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ الرجاء تعديل TOKEN في الملف أولاً!');
    console.log('\n💡 كيفية الحصول على Token:');
    console.log('   1. قم بتسجيل الدخول عبر:');
    console.log('      POST /api/auth/login');
    console.log('   2. انسخ الـ token من الـ response');
    console.log('   3. ضعه في متغير TOKEN في هذا الملف\n');
    return;
  }

  if (!fs.existsSync(IMAGE_PATH)) {
    console.log(`❌ الصورة غير موجودة: ${IMAGE_PATH}`);
    console.log('💡 ضع صورة في مجلد المشروع وسمها test-image.jpg\n');
    return;
  }

  console.log(`✅ Token: ${TOKEN.substring(0, 20)}...`);
  console.log(`✅ Image: ${IMAGE_PATH}\n`);

  // اختر الاختبار الذي تريده
  const testChoice = process.argv[2] || 'all';

  switch (testChoice) {
    case '1':
      await testPutProfileAvatar();
      break;
    case '2':
      await testPostAvatar();
      break;
    case '3':
      await testPutProfile();
      break;
    case '4':
      await testGetProfile();
      break;
    case 'all':
    default:
      await testGetProfile();
      console.log('\n───────────────────────────────────────────\n');

      await testPutProfileAvatar();
      console.log('\n───────────────────────────────────────────\n');

      await testGetProfile();
      console.log('\n───────────────────────────────────────────\n');

      // يمكنك إضافة المزيد من الاختبارات
      break;
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('✅ انتهت الاختبارات');
  console.log('═══════════════════════════════════════════\n');
}

// تشغيل الاختبارات
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testPutProfileAvatar,
  testPostAvatar,
  testPutProfile,
  testGetProfile
};
