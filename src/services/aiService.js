import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: ใส่ API Key ของ Gemini
const GEMINI_API_KEY = 'AIzaSyDgVspgPOchrffe97DiUQc0QHRNo0QerQ8';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getHintFromGemini = async (category, questionText, answer) => {
  try {
    const model = genAI.getGenerativeModel({ model:"gemini-2.5-flash" });
    
    const prompt = `คุณคือ AI ผู้ช่วยในเกมทายคำ
หมวดหมู่ของคำถาม: ${category}
คำถาม: ${questionText || 'รูปภาพ/เสียง'}
คำตอบที่ถูกต้อง: ${answer}

หน้าที่ของคุณคือให้ "คำใบ้" สั้นๆ (ไม่เกิน 1-2 ประโยค) เพื่อช่วยผู้เล่นเดาคำตอบนี้
กฎสำคัญ:
1. ห้ามบอกคำตอบตรงๆ หรือมีส่วนหนึ่งของคำตอบอยู่ในคำใบ้เด็ดขาด
2. ห้ามบอกตัวอักษรเริ่มต้นหรือจำนวนตัวอักษร
3. ให้คำใบ้เป็นภาษาไทยที่กระชับและเข้าใจง่าย`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating hint:", error);
    return "ไม่สามารถดึงคำใบ้ได้ในขณะนี้ ลองพยายามตอบด้วยตัวเองดูนะ!";
  }
};
