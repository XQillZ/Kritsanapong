import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

const QUESTIONS_COLLECTION = 'questions';

// ระบบ Cache เพื่อให้ดึงข้อมูลเร็วขึ้นโดยไม่ต้องโหลดจาก Database ใหม่ทุกครั้ง
const questionsCache = {};

export const clearQuestionsCache = () => {
  for (let key in questionsCache) {
    delete questionsCache[key];
  }
};

export const fetchQuestionsByCategory = async (category, difficulty = null) => {
  try {
    const cacheKey = `${category}_${difficulty || 'all'}`;
    
    // 1. ถ้ามีข้อมูลใน Cache แล้วให้คืนค่าจาก Cache ทันที (จะเร็วมาก)
    if (questionsCache[cacheKey]) {
      return [...questionsCache[cacheKey]];
    }

    let constraints = [where('category', '==', category)];
    if (difficulty) {
      constraints.push(where('difficulty', '==', difficulty));
    }
    
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      ...constraints
    );
    const querySnapshot = await getDocs(q);
    const questions = [];
    querySnapshot.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });
    
    // 2. เก็บลง Cache เพื่อให้การเล่นครั้งต่อไปหรือเริ่มเกมใหม่โหลดได้ทันที
    // เราไม่เรียงตาม createdAt แล้วเนื่องจากได้นำฟิลด์นี้ออกไป
    questionsCache[cacheKey] = questions;

    return [...questions];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const fetchAllQuestions = async () => {
  try {
    const q = query(collection(db, QUESTIONS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const questions = [];
    querySnapshot.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });
    
    return questions;
  } catch (error) {
    console.error('Error fetching all questions:', error);
    throw error;
  }
};

export const uploadImage = async (uri, filename) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storagePath = `images/${filename}_${Date.now()}.jpg`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return { downloadURL, storagePath };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const addQuestion = async (questionData, imageUri) => {
  try {
    let imageUrl = '';
    let imagePath = '';
    if (imageUri) {
      const filename = questionData.answer.replace(/\s/g, '_').toLowerCase();
      const { downloadURL, storagePath } = await uploadImage(imageUri, filename);
      imageUrl = downloadURL;
      imagePath = storagePath;
    }
    
    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), {
      ...questionData,
      imageUrl,
      imagePath
    });
    
    return { id: docRef.id, ...questionData, imageUrl, imagePath };
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
};

export const updateQuestion = async (questionId, questionData, newImageUri) => {
  try {
    let imageUrl = questionData.imageUrl;
    let imagePath = questionData.imagePath;
    
    if (newImageUri && newImageUri !== questionData.imageUrl) {
      if (questionData.imagePath) {
        const oldImageRef = ref(storage, questionData.imagePath);
        try {
          await deleteObject(oldImageRef);
        } catch (e) {
          console.log('Error deleting old image:', e);
        }
      }
      const filename = questionData.answer.replace(/\s/g, '_').toLowerCase();
      const { downloadURL, storagePath } = await uploadImage(newImageUri, filename);
      imageUrl = downloadURL;
      imagePath = storagePath;
    }
    
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(questionRef, {
      ...questionData,
      imageUrl,
      imagePath
    });
    
    return { id: questionId, ...questionData, imageUrl, imagePath };
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

export const deleteQuestion = async (questionId, imagePath) => {
  try {
    if (imagePath) {
      const imageRef = ref(storage, imagePath);
      try {
        await deleteObject(imageRef);
      } catch (e) {
        console.log('Error deleting image:', e);
      }
    }
    
    await deleteDoc(doc(db, QUESTIONS_COLLECTION, questionId));
    return true;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
