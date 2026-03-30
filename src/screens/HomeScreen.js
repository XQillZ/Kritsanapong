import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const CATEGORIES = [
  { id: 'food', name: 'อาหาร', nameEn: 'Food', color: '#FF6B6B' },
  { id: 'animals', name: 'สัตว์', nameEn: 'Animals', color: '#4ECDC4' },
  { id: 'places', name: 'สถานที่', nameEn: 'Places', color: '#45B7D1' },
  { id: 'objects', name: 'สิ่งของ', nameEn: 'Objects', color: '#96CEB4' },
  { id: 'famous_people', name: 'บุคคลสำคัญ', nameEn: 'Famous People', color: '#FFEAA7' },
];

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          } else {
            setUsername(currentUser.displayName || 'Player');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUsername(currentUser.displayName || 'Player');
        }
      } else {
        setUsername('Guest');
      }
    };

    // Listen to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUsername();
      } else {
        setUsername('Guest');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStartGame = () => {
    const defaultCategory = CATEGORIES[0];
    navigation.navigate('Category', { category: defaultCategory });
  };

  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ออกจากระบบ', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถออกจากระบบได้');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>ยินดีต้อนรับ, {username}!</Text>
          <Text style={styles.title}>🎮AI Guess Game🎮</Text>
          <Text style={styles.subtitle}>Guessing Game!!</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartGame}
          >
            <Text style={styles.startEmoji}>🚀</Text>
            <Text style={styles.startButtonText}>เริ่มเล่นเกม</Text>
            <Text style={styles.startSubtext}>เลือกหมวดหมู่และเริ่มเล่นเกมเลย</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.leaderboardButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.leaderboardEmoji}>🏆</Text>
            <Text style={styles.leaderboardButtonText}>ตารางคะแนน</Text>
            <Text style={styles.leaderboardSubtext}>ดูอันดับผู้เล่นสูงสุด</Text>
          </TouchableOpacity>

          {auth.currentUser ? (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutEmoji}>🚪</Text>
              <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
              <Text style={styles.logoutSubtext}>ล็อกเอาต์จากแอพ</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginEmoji}>🔑</Text>
              <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
              <Text style={styles.loginSubtext}>เพื่อบันทึกคะแนนของคุณ</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}></Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 20,
    color: '#F1C40F',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#BDC3C7',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 30,
    gap: 20,
  },
  startButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 30,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  startEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  startSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  leaderboardButton: {
    backgroundColor: '#F39C12',
    paddingVertical: 25,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  leaderboardEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  leaderboardButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  leaderboardSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  logoutButton: {
    backgroundColor: '#34495E',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5D6D7E',
  },
  logoutEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logoutSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loginButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loginEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  loginSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});
