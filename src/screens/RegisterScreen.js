import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import ScreenShell from '../components/ScreenShell';
import { auth, db } from '../services/firebase';
import { colors, radii, shadows } from '../theme/appTheme';
import { showAlert } from '../utils/alertUtils';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showAlert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (password.length < 6) {
      showAlert('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = userCredential.user;

      // 2. Update Auth profile with username
      await updateProfile(user, {
        displayName: username.trim()
      });

      // 3. Create user document in Firestore 'users' collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username.trim(),
        email: email.trim(),
        totalScore: 0,
        gamesPlayed: 0,
        createdAt: new Date()
      });

      showAlert('สำเร็จ', 'สมัครสมาชิกเรียบร้อย', [
        { text: 'ตกลง', onPress: () => navigation.replace('Home') }
      ]);
    } catch (error) {
      console.error('Register error:', error);
      let errorMessage = 'ไม่สามารถสมัครสมาชิกได้';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      }
      showAlert('สมัครสมาชิกไม่สำเร็จ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell accentColor={colors.success} secondaryAccentColor={colors.accent}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>CREATE PLAYER PROFILE</Text>
          <Text style={styles.heroTitle}>เริ่มต้นเก็บคะแนนอย่างเป็นทางการ</Text>
          <Text style={styles.heroText}>สร้างบัญชีเพื่อบันทึกสถิติส่วนตัว แข่งขันบนลีดเดอร์บอร์ด และสะสมคะแนนทุกครั้งที่เล่น</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>📝</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Register Account</Text>
              <Text style={styles.cardSubtitle}>กรอกข้อมูลเพื่อสร้างบัญชีสมาชิกใหม่</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>ชื่อผู้ใช้</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น SmartPlayer"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>อีเมล</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>ยืนยันรหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>สมัครสมาชิก</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryButtonText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    justifyContent: 'center'
  },
  heroBlock: {
    marginTop: 14,
    marginBottom: 14
  },
  eyebrow: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6
  },
  heroTitle: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    marginBottom: 8
  },
  heroText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  card: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(39, 214, 155, 0.16)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconBadgeText: {
    fontSize: 22
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 12
  },
  fieldGroup: {
    marginBottom: 12
  },
  fieldLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceMuted
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: 10,
    ...shadows.soft
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800'
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
});
