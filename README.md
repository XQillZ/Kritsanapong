# Guessing Game - React Native (Expo) + Firebase

Mobile Application เกมทายภาพที่พัฒนาด้วย React Native (Expo) และใช้ Firebase เป็น Backend-as-a-Service

## 🎯 ฟีเจอร์หลัก

- **5 หมวดหมู่**: อาหาร, สัตว์, สถานที่, สิ่งของ, บุคคลสำคัญ
- **ระบบสุ่มคำถาม**: ใช้ Fisher-Yates Shuffle Algorithm
- **ระบบตรวจคำตอบ**: รองรับภาษาไทยและอังกฤษ (case-insensitive, normalized)
- **ระบบ Admin**: CRUD คำถาม + อัปโหลดรูปภาพผ่าน Firebase
- **Client-Server Architecture**: ดึงข้อมูลแบบ Dynamic จาก Firestore

## 🏗️ โครงสร้างโปรเจกต์

```
/src
  /screens          - หน้าจอต่างๆ
    - HomeScreen.js
    - CategoryScreen.js
    - GameScreen.js
    - ResultScreen.js
    - AdminLoginScreen.js
    - AdminPanelScreen.js
    - AddQuestionScreen.js
    - EditQuestionScreen.js
  /services         - Firebase services
    - firebase.js
    - quizService.js
  /utils            - Utility functions
    - shuffle.js    - Fisher-Yates Shuffle
    - textUtils.js  - Text normalization
```

## 🛠️ การติดตั้ง

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
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. ตั้งค่า Firebase

1. สร้างโปรเจกต์ใน [Firebase Console](https://console.firebase.google.com/)
2. เพิ่มแอป Android/iOS และดึงค่า Configuration
3. แก้ไขไฟล์ `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. สร้าง Firestore Database

สร้าง Collection ชื่อ `questions` ด้วย document structure:

```json
{
  "imageUrl": "string",
  "answer": "string",
  "category": "string",
  "difficulty": "string",
  "createdAt": "timestamp"
}
```

### 5. ตั้งค่า Firebase Storage Rules

```
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 6. ตั้งค่า Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /questions/{questionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 7. สร้าง Admin Account

1. ไปที่ Firebase Console → Authentication
2. เพิ่มผู้ใช้ด้วย email/password
3. ใช้ email/password นี้เข้าสู่ระบบ Admin

## 🚀 การรันโปรเจกต์

```bash
# Start Expo development server
npm start

# หรือ
npx expo start
```

## 📱 หน้าจอหลัก

- **HomeScreen**: เลือกหมวดหมู่เกม + เข้าสู่ระบบ Admin
- **CategoryScreen**: แสดงข้อมูลหมวดหมู่ + เริ่มเล่น
- **GameScreen**: แสดงรูปภาพ + รับคำตอบ
- **ResultScreen**: แสดงคะแนน + สรุปคำตอบ
- **AdminPanel**: จัดการคำถาม (CRUD)

## 🔧 เทคโนโลยีที่ใช้

- **Frontend**: React Native (Expo SDK 52)
- **Backend**: Firebase
  - Firestore: เก็บข้อมูลคำถาม
  - Storage: เก็บไฟล์รูปภาพ
  - Authentication: ระบบล็อกอิน Admin
- **Navigation**: React Navigation v7
- **State**: React Hooks

## 📋 Categories

| ID | ชื่อ | สี |
|---|---|---|
| food | อาหาร | #FF6B6B |
| animals | สัตว์ | #4ECDC4 |
| places | สถานที่ | #45B7D1 |
| objects | สิ่งของ | #96CEB4 |
| famous_people | บุคคลสำคัญ | #FFEAA7 |

## 📝 License

MIT
