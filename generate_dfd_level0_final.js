const plantumlEncoder = require('plantuml-encoder');
const fs = require('fs');
const https = require('https');

const uml = `
@startuml
!theme plain
skinparam defaultFontName Tahoma
skinparam {
    BackgroundColor white
    RectangleBackgroundColor white
    RectangleBorderColor black
    RectangleBorderThickness 1
    UsecaseBackgroundColor white
    UsecaseBorderColor black
    UsecaseBorderThickness 1
}

skinparam linetype ortho

' External Entities
rectangle "Player\\n(ผู้เล่น)" as player
rectangle "Google Gemini API\\n(ระบบ AI)" as gemini
rectangle "Firebase\\n(ระบบฐานข้อมูล/ยืนยันตัวตน)" as firebase

' Core System
usecase "0.0\\nระบบเกมทายคำศัพท์\\n(Word Guessing Game)" as system

' Data Flows
player --> system : ข้อมูลสมัครสมาชิก/ล็อกอิน\\n(Credentials)
player --> system : เลือกหมวดหมู่และความยาก\\n(Game Settings)
player --> system : ส่งคำตอบที่ทาย\\n(User Answer)
player --> system : ร้องขอคำใบ้\\n(Hint Request)

system --> player : แสดงผลการเข้าสู่ระบบ\\n(Auth Result)
system --> player : แสดงโจทย์ ภาพ และเสียง\\n(Questions & Media)
system --> player : แสดงผลตรวจคำตอบและเฉลย\\n(Feedback & Answer)
system --> player : แสดงข้อความคำใบ้\\n(Hint Message)
system --> player : แสดงคะแนนและกระดานผู้นำ\\n(Score & Leaderboard)

system --> firebase : ข้อมูลผู้ใช้ใหม่/ตรวจสอบสิทธิ์\\n(Auth Data)
system --> firebase : คำขอดึงชุดคำถาม\\n(Question Query)
system --> firebase : บันทึกคะแนนสะสม\\n(Score Update)

firebase --> system : สถานะการยืนยันตัวตน\\n(Auth Token)
firebase --> system : ชุดข้อมูลคำถาม 10 ข้อ\\n(Question List)
firebase --> system : ข้อมูลกระดานผู้นำ\\n(Leaderboard Data)

system --> gemini : ส่งบริบทโจทย์และเฉลย\\n(Context Data)
gemini --> system : ข้อความคำใบ้ภาษาไทย\\n(Generated Hint)

@enduml
`;

const encoded = plantumlEncoder.encode(uml);
const url = 'https://www.plantuml.com/plantuml/png/' + encoded;

https.get(url, (res) => {
    const path = 'dfd_level0_final.png';
    const filePath = fs.createWriteStream(path);
    res.pipe(filePath);
    filePath.on('finish', () => {
        filePath.close();
        console.log('Image saved as ' + path);
    });
}).on('error', (err) => {
    console.error('Error: ', err.message);
});
