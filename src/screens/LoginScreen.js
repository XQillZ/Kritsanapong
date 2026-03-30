import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('สำเร็จ', 'เข้าสู่ระบบเรียบร้อย', [
        { text: 'ตกลง', onPress: () => navigation.replace('Home') }
      ]);
    } catch (error) {
      let errorMessage = 'ไม่สามารถเข้าสู่ระบบได้';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'ไม่พบผู้ใช้งานนี้';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'รหัสผ่านไม่ถูกต้อง';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('คำแนะนำ', 'กรุณากรอกอีเมลของคุณในช่องอีเมล แล้วกดลืมรหัสผ่านอีกครั้ง เพื่อรับลิงก์รีเซ็ตรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('ส่งอีเมลสำเร็จ', 'ลิงก์สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ (หรือ Junk Mail)');
    } catch (error) {
      let errorMessage = 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'ไม่พบบัญชีผู้ใช้นี้ในระบบ';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
      Alert.alert('ข้อผิดพลาด', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>เข้าสู่ระบบ</Text>
        <Text style={styles.subtitle}>กรุณากรอกข้อมูลเพื่อเข้าใช้งาน</Text>

        <TextInput
          style={styles.input}
          placeholder="อีเมล"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordButtonText}>ลืมรหัสผ่าน?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>ยังไม่มีบัญชี? สมัครสมาชิก</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.guestButton}
          onPress={() => navigation.replace('Home')}
          disabled={loading}
        >
          <Text style={styles.guestButtonText}>เล่นโดยไม่ล็อกอิน</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >   
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#3498DB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 4,
  },
  forgotPasswordButtonText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  registerButtonText: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  guestButtonText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#95A5A6',
    fontSize: 14,
  },
});
