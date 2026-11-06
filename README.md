วีดิโอแนะนำโปรเจค
https://www.youtube.com/watch?v=2moHXctWKQE
#🎮 AI Guessing Game (React Native + Expo + Firebase + Gemini AI)

แอปพลิเคชันเกมทายปัญหาและปริศนาภาพ-เสียง มัลติมีเดียแบบอินเทอร์แอคทีฟ พัฒนาด้วย **React Native (Expo SDK 52)** ผสานพลัง **Firebase** (Auth & Firestore) และ **Google Gemini AI** สำหรับระบบคำใบ้อัจฉริยะแบบเรียลไทม์

---

## 🎯 ฟีเจอร์เด่น (Key Features)

- 🔊 **ระบบคำถามมัลติมีเดีย (Image & Audio Quizzes)**: ทายทั้งจากภาพปริศนาและไฟล์เสียงเครื่องดนตรี / สัตว์ / ยานพาหนะ
- 🤖 **ระบบคำใบ้ AI อัจฉริยะ (Gemini AI Powered)**: ขอคำใบ้ภาษาไทยแบบเรียลไทม์จาก Google Gemini AI โดยที่ AI ไม่สปอยล์คำตอบตรงๆ
- 🎚️ **ระบบระดับความยาก (Difficulty Modes)**: เลือกระดับความท้าทาย (Easy, Medium, Hard) พร้อมระบบคำนวณคะแนนตามความยาก
- 🏆 **กระดานผู้นำแบบเรียลไทม์ (Live Leaderboard)**: บันทึกคะแนนลง Firestore จัดอันดับผู้เล่นคะแนนสูงสุด
- 🔐 **ระบบสมาชิก & ข้อมูลผู้เล่น (User Authentication & Profile)**: รองรับสมัครสมาชิก เข้าสู่ระบบ บันทึกสถิติส่วนตัว
- 🎨 **Modern Dark UI Design**: หน้าจอดีไซน์ระดับพรีเมียม สไตล์ Glassmorphism พร้อม Micro-animations และเอฟเฟกต์เสียงประกอบ

---

## 📋 หมวดหมู่คำถาม (Categories)

| หมวดหมู่ | ไอคอน | รหัสหมวด | รายละเอียด |
|---|:---:|---|---|
| **ยานพาหนะ** | 🚗 | `vehicles` | ทายชื่อและเสียงยานพาหนะรอบตัวและยานพาหนะพิเศษ |
| **สัตว์โลกน่ารู้** | 🐘 | `animals` | ผจญภัยในแดนสัตว์ป่าและสัตว์เลี้ยง ทายชื่อและเสียงสัตว์ |
| **เครื่องดนตรี** | 🎸 | `musical_instruments` | ฟังเสียงเมโลดี้และดูภาพเครื่องดนตรีสากลและพื้นบ้าน |

---

## 🏗️ โครงสร้างโปรเจกต์ (Project Structure)

```
/
├── assets/                  # ไอคอน สแปลช แบนเนอร์ และไฟล์เสียง (.mp3, .png)
├── src/
│   ├── components/          # Reusable UI Components
│   │   └── ScreenShell.js   # เลย์เอาต์และพื้นหลังหลักของแอป
│   ├── screens/             # หน้าจอทั้งหมดของแอป
│   │   ├── HomeScreen.js         # หน้าหลัก สรุปสถิติ เมนูลัด และปุ่มเริ่มเล่น
│   │   ├── CategoryScreen.js     # หน้าเลือกหมวดหมู่คำถาม
│   │   ├── DifficultyScreen.js   # หน้าเลือกระดับความยาก (Easy, Medium, Hard)
│   │   ├── GameScreen.js         # หน้าเล่นเกม เล่นเสียง/แสดงภาพ + ขอคำใบ้ AI
│   │   ├── ResultScreen.js       # สรุปคะแนน บันทึกสถิติ และเฉลยคำตอบ
│   │   ├── LeaderboardScreen.js  # กระดานจัดอันดับคะแนนผู้เล่น
│   │   ├── LoginScreen.js        # หน้าเข้าสู่ระบบ
│   │   └── RegisterScreen.js     # หน้าลงทะเบียนผู้เล่นใหม่
│   ├── services/            # บริการภายนอกและฐานข้อมูล
│   │   ├── firebase.js      # การตั้งค่า Firebase (Auth, Firestore, Storage)
│   │   ├── aiService.js     # การเชื่อมต่อ Google Gemini API
│   │   └── quizService.js   # จัดการคำถามและการ Cache
│   ├── theme/               # Design Tokens
│   │   └── appTheme.js      # ค่าสี, Spacing, Shadows, Radii
│   └── utils/               # ฟังก์ชันตัวช่วย
│       ├── questionPrompt.js # ตัวช่วยแปลง Prompt คำถาม
│       ├── shuffle.js        # Fisher-Yates Shuffle Algorithm
│       └── textUtils.js      # ฟังก์ชัน Normalize และเทียบคำตอบไทย-อังกฤษ
├── app.json                 # การตั้งค่า Expo Project
├── eas.json                 # การตั้งค่า EAS Build สำหรับสร้าง APK
└── package.json             # รายการ Dependencies
```

---

## 🛠️ วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables (.env)
คัดลอกไฟล์ `.env.example` เป็น `.env` และใส่ Gemini API Key ของคุณ:
```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:
```env
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...
```

### 3. เริ่มรันแอปพลิเคชัน (Development Server)
```bash
# รัน Expo Server
npx expo start

# สแกน QR Code ผ่านแอป Expo Go บนมือถือ (Android/iOS)
```

---

## 📱 การ Build เป็นไฟล์ Android APK (EAS Build)

โปรเจกต์นี้ตั้งค่า [`eas.json`](eas.json) พร้อมสำหรับการสร้าง APK ได้ทันที:

```bash
# Build ไฟล์ APK สำหรับติดตั้งบน Android
npx eas build -p android --profile preview
```

---

## 🔧 เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend Core**: React Native 0.76, Expo SDK 52
- **Language**: JavaScript (ES6+)
- **Navigation**: React Navigation v7 (Native Stack)
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Multimedia**: `expo-av` (ระบบเสียง), `expo-image-picker`
- **Storage**: `@react-native-async-storage/async-storage`

---

## 📝 License

Distributed under the MIT License.
