import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

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
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
