const plantumlEncoder = require('plantuml-encoder');
const fs = require('fs');
const https = require('https');

const uml = `
@startuml
!theme plain
skinparam defaultFontName Tahoma
skinparam ranksep 60
skinparam nodesep 40

skinparam {
    BackgroundColor white
    RectangleBackgroundColor white
    RectangleBorderColor black
    RectangleBorderThickness 1
    UsecaseBackgroundColor white
    UsecaseBorderColor black
    UsecaseBorderThickness 1
    DatabaseBackgroundColor white
    DatabaseBorderColor black
    DatabaseBorderThickness 1
}

' External Entities
rectangle "ผู้เล่น" as player
rectangle "ผู้ดูแลระบบ" as admin
rectangle "Google Gemini API" as gemini

' Data Stores
database "D1: ข้อมูลบัญชีผู้เล่น" as d1
database "D2: ข้อมูลคำถาม" as d2
database "D3: ข้อมูลรูปภาพ เสียง" as d3
database "D4: ข้อมูลคะแนนและสถิติ" as d4

' Processes
usecase "1.0\\nจัดการเข้าสู่ระบบผู้เล่น" as p1
usecase "2.0\\nจัดการข้อมูลคำถามและ\\nรูปภาพและเสียง" as p2
usecase "3.0\\nจัดการหมวดหมู่และสุ่ม\\nคำถาม" as p3
usecase "4.0\\nตรวจสอบการทายภาพ" as p4
usecase "5.0\\nจัดการคำใบ้อัจฉริยะ AI" as p5
usecase "6.0\\nประมวลผลคะแนนและสถิติ" as p6

' Flows
player --> p1 : เข้าสู่ระบบ
p1 --> player : สถานะการเข้าสู่ระบบ
p1 --> d1 : ตรวจสอบ/บันทึกข้อมูล
d1 --> p1 : ยืนยันสิทธิ์ใช้งาน
p1 --> p3 : ส่งข้อมูลตั้งต้นผู้เล่น (ผ่านไปยัง 6.0)

admin --> p2 : ข้อมูลเพิ่ม/แก้ไข/ลบ\\nคำถามและรูปภาพ
p2 --> admin : สถานะการอัปเดตข้อมูล
p2 --> d2 : อัปเดตข้อมูลคำถาม\\nรูปภาพ เสียง
d2 --> p2 : ข้อมูลรายการคำถาม
p2 --> d3 : อัปโหลด/ลบ รูปภาพ เสียง
d3 --> p2 : ข้อมูล URL รูปภาพ เสียง

p2 --> p3 : อัปเดตชุดคำถาม

player --> p3 : เลือกหมวดหมู่
p3 --> player : แสดงหน้าจอคำถาม
d2 --> p3 : ข้อมูลคำถามตามหมวดหมู่
d3 --> p3 : ดึงข้อมูลคำถาม

p3 --> p4 : ส่งข้อมูลชุดคำถามที่สุ่มแล้ว

player --> p4 : ส่งข้อมูลคำตอบ
p4 --> player : แสดงผลการตรวจคำตอบ
d2 --> p4 : ข้อมูลเฉลย

p4 --> p6 : ส่งผลการตอบแต่ละข้อ

player --> p5 : ร้องขอคำใบ้ช่วยเหลือ
p5 --> player : ส่งคำใบ้ช่วยเหลือ / แสดงข้อความคำใบ้
p5 --> gemini : ส่งข้อมูลบริบทคำถาม
gemini --> p5 : สร้างและส่งกลับข้อความคำใบ้
d2 --> p5 : ดึงข้อมูลคำตอบเพื่อสร้าง\\nคำใบ้

p1 --> p6 : ส่งข้อมูลตั้งต้นผู้เล่น (ไหลยาวลงมา)
p6 --> player : แสดงสถิติและกระดานผู้นำ
d4 --> p6 : ดึงข้อมูลสถิติ
p6 --> d4 : บันทึกคะแนนและสถิติการ\\nเล่น

@enduml
`;

const encoded = plantumlEncoder.encode(uml);
const url = 'https://www.plantuml.com/plantuml/png/' + encoded;

https.get(url, (res) => {
    const path = 'dfd_level1_custom.png';
    const filePath = fs.createWriteStream(path);
    res.pipe(filePath);
    filePath.on('finish', () => {
        filePath.close();
        console.log('Image saved as ' + path);
    });
}).on('error', (err) => {
    console.error('Error: ', err.message);
});
