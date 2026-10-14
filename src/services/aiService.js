import { GoogleGenerativeAI } from '@google/generative-ai';

// ดึง API Key จากไฟล์ .env หรือ Environment Variable ใน EAS
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const getHintFromGemini = async (category, questionText, answer) => {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key is missing in .env");
    return "กรุณาใส่ EXPO_PUBLIC_GEMINI_API_KEY ในไฟล์ .env ก่อนใช้งานคำใบ้ AI";
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const candidateModels = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"];

    const prompt = `คุณคือ AI ผู้ช่วยในเกมทายคำ
หมวดหมู่ของคำถาม: ${category}
คำถาม: ${questionText || 'รูปภาพ/เสียง'}
คำตอบที่ถูกต้อง: ${answer}

หน้าที่ของคุณคือให้ "คำใบ้" สั้นๆ (ไม่เกิน 1-2 ประโยค) เพื่อช่วยผู้เล่นเดาคำตอบนี้
กฎสำคัญ:
1. ห้ามบอกคำตอบตรงๆ หรือมีส่วนหนึ่งของคำตอบอยู่ในคำใบ้เด็ดขาด
2. ห้ามบอกตัวอักษรเริ่มต้นหรือจำนวนตัวอักษร
3. ให้คำใบ้เป็นภาษาไทยที่กระชับและเข้าใจง่าย`;

    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const hintText = response.text().trim();
        if (hintText) return hintText;
      } catch (err) {
        lastError = err;
        // หาก API Key มีปัญหา เช่น ถูกบล็อก/Leaked หรือไม่มีสิทธิ์ ไม่ต้องวนลูปต่อ
        if (err?.message?.includes('leaked') || err?.message?.includes('403') || err?.message?.includes('API_KEY_INVALID')) {
          console.error("❌ Gemini API Key Error (Key ถูกบล็อกหรือใช้งานไม่ได้):", err.message);
          return "Gemini API Key ใช้งานไม่ได้ (อาจถูกระบบความปลอดภัยบล็อก) กรุณาสร้าง Key ใหม่ที่ Google AI Studio";
        }
        console.warn(`Model ${modelName} failed, trying next candidate...`);
      }
    }

    if (lastError) throw lastError;
    return "ไม่สามารถดึงคำใบ้ได้ในขณะนี้ ลองพยายามตอบด้วยตัวเองดูนะ!";
  } catch (error) {
    console.error("Error generating hint:", error);
    return "ไม่สามารถดึงคำใบ้ได้ในขณะนี้ ลองพยายามตอบด้วยตัวเองดูนะ!";
  }
};
