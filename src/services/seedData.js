import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const SAMPLE_QUESTIONS = [
  // หมวดยานพาหนะ (Vehicles)
  {
    category: 'vehicles',
    question: 'ยานพาหนะชนิดนี้คืออะไร?',
    answer: 'รถยนต์',
    imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
    audioUrl: '',
    difficulty: 'easy',
    createdAt: new Date()
  },
  {
    category: 'vehicles',
    question: 'ยานพาหนะชนิดนี้คืออะไร?',
    answer: 'รถจักรยานยนต์',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    audioUrl: '',
    difficulty: 'easy',
    createdAt: new Date()
  },
  {
    category: 'vehicles',
    question: 'ยานพาหนะชนิดนี้คืออะไร?',
    answer: 'เครื่องบิน',
    imageUrl: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6d5?auto=format&fit=crop&w=800&q=80',
    audioUrl: '',
    difficulty: 'easy',
    createdAt: new Date()
  },

  // หมวดสัตว์ (Animals)
  {
    category: 'animals',
    question: 'สัตว์นี้คือตัวอะไร?',
    answer: 'ช้าง',
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
    audioUrl: '',
    difficulty: 'easy',
    createdAt: new Date()
  },
  {
    category: 'animals',
    question: 'สัตว์ตัวนี้คืออะไร?',
    answer: 'สิงโต',
    imageUrl: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=800&q=80',
    audioUrl: '',
    difficulty: 'easy',
    createdAt: new Date()
  },

  // หมวดเครื่องดนตรี (Musical Instruments)
  {
    category: 'musical_instruments',
    question: 'เครื่องดนตรีชนิดนี้คืออะไร?',
    answer: 'กีตาร์',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
    audioUrl: '',
    difficulty: 'easy',
    createdAt: new Date()
  },
  {
    category: 'musical_instruments',
    question: 'เครื่องดนตรีชนิดนี้คืออะไร?',
    answer: 'เปียโน',
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80',
    audioUrl: '',
    difficulty: 'easy',
    createdAt: new Date()
  }
];

export const seedDatabase = async () => {
  try {
    console.log('เริ่มเพิ่มข้อมูลลงฐานข้อมูล...');
    
    // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    
    if (!snapshot.empty) {
      console.log(`มีข้อมูลอยู่แล้ว ${snapshot.size} ข้อ ไม่จำเป็นต้องเพิ่มใหม่`);
      return;
    }

    // เพิ่มข้อมูลใหม่
    let count = 0;
    for (const question of SAMPLE_QUESTIONS) {
      await addDoc(questionsRef, question);
      count++;
      console.log(`เพิ่มข้อมูลสำเร็จ: ${count}/${SAMPLE_QUESTIONS.length}`);
    }

    console.log('เพิ่มข้อมูลทั้งหมดเรียบร้อยแล้ว!');
    return true;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับลบข้อมูลทั้งหมด (เผื่อต้องการรีเซ็ต)
export const clearDatabase = async () => {
  try {
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    
    let count = 0;
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
      count++;
    }
    
    console.log(`ลบข้อมูลทั้งหมดเรียบร้อยแล้ว จำนวน ${count} รายการ`);
    return true;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', error);
    throw error;
  }
};
