# EMBOSS Production Report System

ระบบบันทึกและจัดการข้อมูลการผลิต (E-Production Report System) พัฒนาด้วย Next.js (App Router) และ React 19

---

## 📝 บันทึกการแก้ไขและอัปเดตล่าสุด (Change Log)

### การสร้างและปรับปรุง Favicon / Web Icon (ล่าสุด)
- **แหล่งที่มาของโลโก้:** อ้างอิงจากไฟล์ `public/Emboss_Logo.png`
- **การตัดขอบและปรับขนาด (Auto-Cropping & Zoom):**
  - วิเคราะห์และตัดขอบโปร่งใส (Transparent padding) รอบนอกของรูปต้นฉบับออก ให้เหลือเฉพาะตัวเนื้อโลโก้ (จากขนาดเดิม 439x568 px ซึ่งมีเนื้อโลโก้จริง 353x352 px)
  - ขยายเนื้อโลโก้ให้เต็มพื้นที่แบบ 100% Fill เพื่อให้เห็นโลโก้ชัดเจน ไม่เล็กหรือจมในแท็บเบราว์เซอร์
- **ไฟล์ที่สร้างขึ้น:**
  - `public/favicon.ico` : ไฟล์ Favicon หลายขนาด (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
  - `src/app/favicon.ico` : ไฟล์ Favicon สำหรับ Next.js App Router Root
  - `src/app/icon.png` & `public/icon.png` : ไอคอนความละเอียดสูง (192x192 px) สำหรับเบราว์เซอร์สมัยใหม่และอุปกรณ์พกพา
- **การแก้ไขโค้ด:**
  - เพิ่มการตั้งค่า `icons: { icon: "/favicon.ico" }` ใน `metadata` ที่ไฟล์ `src/app/layout.js`

---

## 🚀 การเริ่มต้นใช้งาน (Getting Started)

ติดตั้ง Dependencies:
```bash
npm install
```

รัน Development Server (พอร์ต 6206):
```bash
npm run dev
```

เปิดดูหน้าเว็บที่ [http://localhost:6206](http://localhost:6206)

---

## 🛠️ สแต็กเทคโนโลยี (Tech Stack)

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19, Lucide React
- **Styling:** TailwindCSS v4, Sass, Styled Components
- **PDF & Excel:** `@react-pdf/renderer`, `xlsx`
- **HTTP Client:** `axios`
