# 🖼️ إنشاء صورة تجريبية للاختبار

## الطريقة الأولى: استخدام ImageMagick (إذا كان مثبت)

```bash
# إنشاء صورة بسيطة 200x200
convert -size 200x200 xc:blue -pointsize 30 -fill white \
  -gravity center -annotate +0+0 'Test Avatar' \
  test-image.jpg
```

## الطريقة الثانية: تحميل من الإنترنت

```bash
# تحميل صورة تجريبية
curl -o test-image.jpg https://via.placeholder.com/200/0000FF/FFFFFF?text=Test+Avatar
```

## الطريقة الثالثة: استخدام أي صورة موجودة

ببساطة انسخ أي صورة من جهازك وسمها `test-image.jpg`

```bash
cp ~/Pictures/any-image.jpg ./test-image.jpg
```

## التحقق من الصورة

```bash
# التحقق من وجود الصورة
ls -lh test-image.jpg

# عرض معلومات الصورة (إذا كان لديك ImageMagick)
identify test-image.jpg
```

## استخدام الصورة في الاختبار

بعد إنشاء الصورة، يمكنك استخدامها في:
1. صفحة HTML: `test-avatar-upload.html`
2. سكريبت Node.js: `test-avatar-api.js`
3. Postman
4. cURL
