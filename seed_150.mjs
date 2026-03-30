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

const vehicles = [
  // easy
  { th: 'รถยนต์', en: 'car', diff: 'easy' }, { th: 'มอเตอร์ไซค์', en: 'motorcycle', diff: 'easy' }, { th: 'จักรยาน', en: 'bicycle', diff: 'easy' },
  { th: 'รถบรรทุก', en: 'truck', diff: 'easy' }, { th: 'รถบัส', en: 'bus', diff: 'easy' }, { th: 'รถตู้', en: 'van', diff: 'easy' },
  { th: 'รถไฟ', en: 'train', diff: 'easy' }, { th: 'เครื่องบิน', en: 'airplane', diff: 'easy' }, { th: 'เฮลิคอปเตอร์', en: 'helicopter', diff: 'easy' },
  { th: 'เรือ', en: 'boat', diff: 'easy' }, { th: 'รถพยาบาล', en: 'ambulance', diff: 'easy' }, { th: 'รถดับเพลิง', en: 'firetruck', diff: 'easy' },
  { th: 'รถตำรวจ', en: 'police car', diff: 'easy' }, { th: 'รถกระบะ', en: 'pickup truck', diff: 'easy' }, { th: 'รถสามล้อ', en: 'tricycle', diff: 'easy' },
  { th: 'รถตุ๊กตุ๊ก', en: 'tuktuk', diff: 'easy' }, { th: 'รถไฟใต้ดิน', en: 'subway', diff: 'easy' }, { th: 'เรือข้ามฟาก', en: 'ferry', diff: 'easy' },
  { th: 'เรือหางยาว', en: 'longtail boat', diff: 'easy' }, { th: 'สเก็ตบอร์ด', en: 'skateboard', diff: 'easy' }, { th: 'สกู๊ตเตอร์', en: 'scooter', diff: 'easy' },
  { th: 'รถแข่ง', en: 'race car', diff: 'easy' }, { th: 'รถสปอร์ต', en: 'sports car', diff: 'easy' }, { th: 'จรวด', en: 'rocket', diff: 'easy' },
  { th: 'บอลลูน', en: 'balloon', diff: 'easy' },
  // hard
  { th: 'เรือดำน้ำ', en: 'submarine', diff: 'hard' }, { th: 'ยานอวกาศ', en: 'spaceship', diff: 'hard' }, { th: 'รถแทรกเตอร์', en: 'tractor', diff: 'hard' },
  { th: 'รถเครน', en: 'crane', diff: 'hard' }, { th: 'รถยก', en: 'forklift', diff: 'hard' }, { th: 'รถจี๊ป', en: 'jeep', diff: 'hard' },
  { th: 'รถกอล์ฟ', en: 'golf cart', diff: 'hard' }, { th: 'รถบั๊ม', en: 'bumper car', diff: 'hard' }, { th: 'เรือใบ', en: 'sailboat', diff: 'hard' },
  { th: 'เรือยอร์ช', en: 'yacht', diff: 'hard' }, { th: 'เรือสำราญ', en: 'cruise ship', diff: 'hard' }, { th: 'เรือรบ', en: 'warship', diff: 'hard' },
  { th: 'เรือแคนู', en: 'canoe', diff: 'hard' }, { th: 'เรือคายัค', en: 'kayak', diff: 'hard' }, { th: 'แพ', en: 'raft', diff: 'hard' },
  { th: 'เจ็ตสกี', en: 'jetski', diff: 'hard' }, { th: 'โรลเลอร์เบลด', en: 'rollerblade', diff: 'hard' }, { th: 'โฮเวอร์บอร์ด', en: 'hoverboard', diff: 'hard' },
  { th: 'เซกเวย์', en: 'segway', diff: 'hard' }, { th: 'รถราง', en: 'tram', diff: 'hard' }, { th: 'กระเช้าลอยฟ้า', en: 'cable car', diff: 'hard' },
  { th: 'รถม้า', en: 'carriage', diff: 'hard' }, { th: 'รถลาก', en: 'rickshaw', diff: 'hard' }, { th: 'รถเข็น', en: 'wheelbarrow', diff: 'hard' },
  { th: 'เครื่องร่อน', en: 'glider', diff: 'hard' }
];

const animals = [
  // easy
  { th: 'หมา', en: 'dog', diff: 'easy' }, { th: 'แมว', en: 'cat', diff: 'easy' }, { th: 'ช้าง', en: 'elephant', diff: 'easy' },
  { th: 'ม้า', en: 'horse', diff: 'easy' }, { th: 'วัว', en: 'cow', diff: 'easy' }, { th: 'ควาย', en: 'buffalo', diff: 'easy' },
  { th: 'หมู', en: 'pig', diff: 'easy' }, { th: 'เป็ด', en: 'duck', diff: 'easy' }, { th: 'ไก่', en: 'chicken', diff: 'easy' },
  { th: 'นก', en: 'bird', diff: 'easy' }, { th: 'ปลา', en: 'fish', diff: 'easy' }, { th: 'เสือ', en: 'tiger', diff: 'easy' },
  { th: 'สิงโต', en: 'lion', diff: 'easy' }, { th: 'หมี', en: 'bear', diff: 'easy' }, { th: 'ลิง', en: 'monkey', diff: 'easy' },
  { th: 'กวาง', en: 'deer', diff: 'easy' }, { th: 'ยีราฟ', en: 'giraffe', diff: 'easy' }, { th: 'ม้าลาย', en: 'zebra', diff: 'easy' },
  { th: 'กระต่าย', en: 'rabbit', diff: 'easy' }, { th: 'หนู', en: 'mouse', diff: 'easy' }, { th: 'งู', en: 'snake', diff: 'easy' },
  { th: 'เต่า', en: 'turtle', diff: 'easy' }, { th: 'กบ', en: 'frog', diff: 'easy' }, { th: 'ผีเสื้อ', en: 'butterfly', diff: 'easy' },
  { th: 'มด', en: 'ant', diff: 'easy' },
  // hard
  { th: 'ฮิปโป', en: 'hippo', diff: 'hard' }, { th: 'แรด', en: 'rhino', diff: 'hard' }, { th: 'จระเข้', en: 'crocodile', diff: 'hard' },
  { th: 'กระรอก', en: 'squirrel', diff: 'hard' }, { th: 'แฮมสเตอร์', en: 'hamster', diff: 'hard' }, { th: 'เม่น', en: 'hedgehog', diff: 'hard' },
  { th: 'ค้างคาว', en: 'bat', diff: 'hard' }, { th: 'จิ้งจก', en: 'lizard', diff: 'hard' }, { th: 'ตุ๊กแก', en: 'gecko', diff: 'hard' },
  { th: 'กิ้งก่า', en: 'chameleon', diff: 'hard' }, { th: 'คางคก', en: 'toad', diff: 'hard' }, { th: 'ซาลาแมนเดอร์', en: 'salamander', diff: 'hard' },
  { th: 'แมงมุม', en: 'spider', diff: 'hard' }, { th: 'แมงป่อง', en: 'scorpion', diff: 'hard' }, { th: 'ตะขาบ', en: 'centipede', diff: 'hard' },
  { th: 'แมลงปอ', en: 'dragonfly', diff: 'hard' }, { th: 'ผึ้ง', en: 'bee', diff: 'hard' }, { th: 'ยุง', en: 'mosquito', diff: 'hard' },
  { th: 'แมลงวัน', en: 'fly', diff: 'hard' }, { th: 'แมลงสาบ', en: 'cockroach', diff: 'hard' }, { th: 'ด้วง', en: 'beetle', diff: 'hard' },
  { th: 'หอย', en: 'snail', diff: 'hard' }, { th: 'ปู', en: 'crab', diff: 'hard' }, { th: 'กุ้ง', en: 'shrimp', diff: 'hard' },
  { th: 'ปลาหมึก', en: 'squid', diff: 'hard' }
];

const instruments = [
  // easy
  { th: 'กีตาร์', en: 'guitar', diff: 'easy' }, { th: 'เปียโน', en: 'piano', diff: 'easy' }, { th: 'คีย์บอร์ด', en: 'keyboard', diff: 'easy' },
  { th: 'เบส', en: 'bass guitar', diff: 'easy' }, { th: 'กลองชุด', en: 'drum kit', diff: 'easy' }, { th: 'ไวโอลิน', en: 'violin', diff: 'easy' },
  { th: 'ฟลุต', en: 'flute', diff: 'easy' }, { th: 'แซกโซโฟน', en: 'saxophone', diff: 'easy' }, { th: 'ทรัมเป็ต', en: 'trumpet', diff: 'easy' },
  { th: 'อูคูเลเล่', en: 'ukulele', diff: 'easy' }, { th: 'ระนาด', en: 'xylophone', diff: 'easy' }, { th: 'ฉาบ', en: 'cymbals', diff: 'easy' },
  { th: 'แทมบูรีน', en: 'tambourine', diff: 'easy' }, { th: 'กลองใหญ่', en: 'bass drum', diff: 'easy' }, { th: 'ฮาร์ป', en: 'harp', diff: 'easy' },
  { th: 'แบนโจ', en: 'banjo', diff: 'easy' }, { th: 'แมนโดลิน', en: 'mandolin', diff: 'easy' }, { th: 'แอคคอร์เดียน', en: 'accordion', diff: 'easy' },
  { th: 'ฮาร์โมนิกา', en: 'harmonica', diff: 'easy' }, { th: 'มาราคัส', en: 'maracas', diff: 'easy' }, { th: 'ไทรแองเกิล', en: 'triangle instrument', diff: 'easy' },
  { th: 'สแนร์', en: 'snare drum', diff: 'easy' }, { th: 'ฆ้อง', en: 'gong', diff: 'easy' }, { th: 'กรับ', en: 'castanets', diff: 'easy' },
  { th: 'วูดบล็อก', en: 'woodblock', diff: 'easy' },
  // hard
  { th: 'วิโอลา', en: 'viola', diff: 'hard' }, { th: 'เชลโล', en: 'cello', diff: 'hard' }, { th: 'ดับเบิลเบส', en: 'double bass', diff: 'hard' },
  { th: 'คลาริเน็ต', en: 'clarinet', diff: 'hard' }, { th: 'ทรอมโบน', en: 'trombone', diff: 'hard' }, { th: 'เฟรนช์ฮอร์น', en: 'french horn', diff: 'hard' },
  { th: 'ทูบา', en: 'tuba', diff: 'hard' }, { th: 'ลูต', en: 'lute', diff: 'hard' }, { th: 'ซิตาร์', en: 'sitar', diff: 'hard' },
  { th: 'ฮาร์ปซิคอร์ด', en: 'harpsichord', diff: 'hard' }, { th: 'ออร์แกน', en: 'organ instrument', diff: 'hard' }, { th: 'เมโลดิกา', en: 'melodica', diff: 'hard' },
  { th: 'มาริมบา', en: 'marimba', diff: 'hard' }, { th: 'ไวบราโฟน', en: 'vibraphone', diff: 'hard' }, { th: 'กลอกเคนสปีล', en: 'glockenspiel', diff: 'hard' },
  { th: 'คาวเบล', en: 'cowbell', diff: 'hard' }, { th: 'กิโระ', en: 'guiro', diff: 'hard' }, { th: 'คาฮอง', en: 'cajon', diff: 'hard' },
  { th: 'บองโก', en: 'bongo drum', diff: 'hard' }, { th: 'คองก้า', en: 'conga', diff: 'hard' }, { th: 'เจมเบ้', en: 'djembe', diff: 'hard' },
  { th: 'ทิมปานี', en: 'timpani', diff: 'hard' }, { th: 'ดิดเจอริดู', en: 'didgeridoo', diff: 'hard' }, { th: 'ปี่สกอต', en: 'bagpipe', diff: 'hard' },
  { th: 'คาซู', en: 'kazoo', diff: 'hard' }
];

const ALL_QUESTIONS = [];

vehicles.forEach((v, index) => {
  ALL_QUESTIONS.push({
    category: 'vehicles',
    question: 'ยานพาหนะชนิดนี้คืออะไร? (What is this vehicle?)',
    answer: v.th,
    answerEn: v.en,
    imageUrl: `https://loremflickr.com/800/800/${encodeURIComponent(v.en)}?lock=${index + 100}`,
    audioUrl: '',
    difficulty: v.diff
  });
});

animals.forEach((a, index) => {
  ALL_QUESTIONS.push({
    category: 'animals',
    question: 'สัตว์นี้คือตัวอะไร? (What is this animal?)',
    answer: a.th,
    answerEn: a.en,
    imageUrl: `https://loremflickr.com/800/800/${encodeURIComponent(a.en)}?lock=${index + 200}`,
    audioUrl: '',
    difficulty: a.diff
  });
});

instruments.forEach((i, index) => {
  ALL_QUESTIONS.push({
    category: 'musical_instruments',
    question: 'เครื่องดนตรีชนิดนี้คืออะไร? (What is this instrument?)',
    answer: i.th,
    answerEn: i.en,
    imageUrl: `https://loremflickr.com/800/800/${encodeURIComponent(i.en)}?lock=${index + 300}`,
    audioUrl: '',
    difficulty: i.diff
  });
});

async function seedDatabase() {
  try {
    console.log('กำลังเคลียร์ข้อมูลเก่าในฐานข้อมูล...');
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    
    let delCount = 0;
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
      delCount++;
    }
    console.log(`ลบข้อมูลเก่า ${delCount} ข้อ เรียบร้อย`);

    console.log(`เริ่มเพิ่มข้อมูลใหม่ทั้งหมด ${ALL_QUESTIONS.length} ข้อ...`);
    let count = 0;
    
    for (const question of ALL_QUESTIONS) {
      await addDoc(questionsRef, question);
      count++;
      if (count % 10 === 0) {
        console.log(`เพิ่มข้อมูลสำเร็จ: ${count}/${ALL_QUESTIONS.length}`);
      }
    }

    console.log('เพิ่มข้อมูลใหม่ทั้งหมด 150 ข้อลง Firebase เรียบร้อยแล้ว!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedDatabase();
