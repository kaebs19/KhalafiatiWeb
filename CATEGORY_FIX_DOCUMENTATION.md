# إصلاح مشكلة الفئات العربية - Category Arabic Support Fix

## المشكلة
كانت هناك مشكلة عند إضافة فئات جديدة بأسماء عربية، حيث كانت تظهر رسالة الخطأ:
```
Category name or slug already exists
```

## السبب
1. **توليد Slug غير صحيح**: الكود القديم كان يحذف جميع الأحرف العربية من الـ slug، مما ينتج عنه slug فارغ أو "-"
2. **Slugs فارغة في قاعدة البيانات**: بعض الفئات كانت لديها slugs فارغة أو غير صحيحة
3. **رسائل خطأ غير واضحة**: الرسائل كانت بالإنجليزية وغير محددة

## الحلول المطبقة

### 1. تحسين نموذج الفئات (Category.js)

#### قبل:
```javascript
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // يحذف الأحرف العربية!
      .replace(/\s+/g, '-')
      .trim();
  }
  next();
});
```

#### بعد:
```javascript
function createSlug(text) {
  // خريطة ترجمة للكلمات العربية الشائعة
  const arabicToEnglish = {
    'طبيعة': 'nature',
    'تصميم': 'design',
    'فن': 'art',
    'تقنية': 'technology',
    'طعام': 'food',
    'رياضة': 'sports',
    'موضة': 'fashion',
    'سفر': 'travel',
    'حيوانات': 'animals',
    'هندسة': 'architecture',
    'موسيقى': 'music',
    'تعليم': 'education',
    'صحة': 'health',
    'أعمال': 'business',
    'ترفيه': 'entertainment'
  };

  const lowerText = text.trim().toLowerCase();
  if (arabicToEnglish[lowerText]) {
    return arabicToEnglish[lowerText];
  }

  // الحفاظ على الأحرف العربية في الـ slug
  let slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '') // يحتفظ بالأحرف العربية
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}
```

**الميزات الجديدة:**
- دعم الأحرف العربية الكامل (U+0600 إلى U+06FF)
- ترجمة تلقائية للكلمات الشائعة
- إزالة الأحرف الخاصة فقط مع الحفاظ على العربية والإنجليزية

### 2. تحسين معالج الفئات (categoryController.js)

#### التحسينات:
```javascript
// معالجة أفضل للأخطاء
if (error.code === 11000) {
  const duplicateField = error.keyPattern;
  let message = 'فئة بهذا الاسم أو الرابط موجودة مسبقاً';

  if (duplicateField.name) {
    message = 'فئة بهذا الاسم موجودة مسبقاً';
  } else if (duplicateField.slug) {
    message = 'فئة بهذا الرابط (slug) موجودة مسبقاً. يرجى اختيار اسم مختلف';
  }

  return res.status(400).json({
    success: false,
    message: message
  });
}
```

**الميزات:**
- رسائل خطأ بالعربية
- تحديد دقيق للحقل المكرر (name أو slug)
- تنظيف الاسم قبل الحفظ (trim)
- حماية من regex injection

### 3. إصلاح قاعدة البيانات

تم إصلاح جميع الفئات التي كانت لديها slugs غير صحيحة:

| اسم الفئة | Slug القديم | Slug الجديد |
|-----------|--------------|-------------|
| رياضة | "" (فارغ) | sports |
| خلفيات منوعة | "-" | خلفيات-منوعة |
| خلفيات دينية | "-" | خلفيات-دينية |
| هلالية | "" (فارغ) | هلالية |

## الملفات المعدلة

1. **backend/models/Category.js** (السطور 42-96)
   - إضافة دالة `createSlug()`
   - تحديث `pre('save')` hook
   - تحديث `pre('validate')` hook

2. **backend/controllers/categoryController.js**
   - `createCategory()` (السطور 211-292)
   - `updateCategory()` (السطور 294-384)

## كيفية الاستخدام

### إضافة فئة جديدة:
```bash
POST /api/categories
{
  "name": "تصميم",
  "description": "فئة التصميم",
  "isActive": true
}
```

**النتيجة:**
- اسم الفئة: "تصميم"
- Slug: "design" (من خريطة الترجمة)

### فئة عربية مخصصة:
```bash
POST /api/categories
{
  "name": "خلفيات إسلامية",
  "description": "خلفيات دينية",
  "isActive": true
}
```

**النتيجة:**
- اسم الفئة: "خلفيات إسلامية"
- Slug: "خلفيات-إسلامية" (يحتفظ بالعربية)

## الاختبار

### اختبار 1: إضافة فئة عربية
✅ يتم إنشاء slug صحيح

### اختبار 2: إضافة فئة مكررة
✅ رسالة خطأ واضحة بالعربية

### اختبار 3: فئة من خريطة الترجمة
✅ يتم استخدام الترجمة الإنجليزية

## الملاحظات المهمة

1. **الفئات الموجودة**: تم تحديث جميع الفئات القديمة بـ slugs صحيحة
2. **التوافق**: النظام يدعم كلاً من الأسماء العربية والإنجليزية
3. **الفريدية**: يتم التحقق من عدم تكرار الاسم أو الـ slug
4. **الرسائل**: جميع رسائل الخطأ الآن بالعربية

## التحديثات على السيرفر

تم رفع الملفات المحدثة إلى السيرفر وإعادة تشغيل الـ backend:
```bash
rsync -> /var/www/khalafiati/backend/
pm2 restart khalafiati-api
```

## التحديثات على GitHub

تم رفع جميع التغييرات إلى المستودع:
- Repository: https://github.com/kaebs19/KhalafiatiWeb
- Commit: "Fix Arabic category slug generation and duplicate detection"

## المطورون

إذا كنت تعمل على المشروع:
1. اسحب آخر التحديثات: `git pull origin main`
2. تأكد من تحديث dependencies: `npm install` في مجلد backend
3. راجع الملفات المعدلة المذكورة أعلاه

---

**تاريخ الإصلاح:** 2026-01-08
**الحالة:** ✅ مكتمل ومختبر
