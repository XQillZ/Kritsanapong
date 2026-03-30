import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC3Ghi5-ubwTEh3eoDITTh15X1XcK0ewds",
  authDomain: "game-bb847.firebaseapp.com",
  projectId: "game-bb847",
  storageBucket: "game-bb847.firebasestorage.app",
  messagingSenderId: "290050021659",
  appId: "1:290050021659:web:ca70e1c37f197706969bbe",
  measurementId: "G-R8TELDV45Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SAMPLE_QUESTIONS = [
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
  {
    category: 'animals',
    question: 'สัตว์ตัวนี้คืออะไร?',
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

async function seedDatabase() {
  try {
    console.log('กำลังเคลียร์ข้อมูลเก่าในฐานข้อมูล...');
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log(`ลบข้อมูลเก่า ${snapshot.size} ข้อ เรียบร้อย`);

    console.log('เริ่มเพิ่มข้อมูล 7 ข้อ...');
    let count = 0;
    for (const question of SAMPLE_QUESTIONS) {
      await addDoc(questionsRef, question);
      count++;
      console.log(`เพิ่มข้อมูลสำเร็จ: ${count}/7`);
    }

    console.log('เพิ่มข้อมูลทั้งหมดลง Firebase เรียบร้อยแล้ว!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedDatabase();
