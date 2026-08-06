import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import ScreenShell from '../components/ScreenShell';
import { auth } from '../services/firebase';
import { colors, radii, shadows } from '../theme/appTheme';

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
    <ScreenShell accentColor={colors.accentSecondary} secondaryAccentColor={colors.accent}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.heroTitle}>เข้าสู่ระบบเพื่อเก็บสถิติและลุยลีดเดอร์บอร์ด</Text>
          <Text style={styles.heroText}>ระบบจะบันทึกคะแนน ความคืบหน้า และผลลัพธ์การเล่นของคุณแบบครบถ้วน</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>🔐</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Login Account</Text>
              <Text style={styles.cardSubtitle}>กรอกข้อมูลบัญชีเพื่อเข้าสู่ระบบ</Text>
            </View>
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
              placeholder="กรอกรหัสผ่านของคุณ"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>เข้าสู่ระบบ</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inlineButton}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.inlineButtonText}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>

          <View style={styles.actionStack}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryButtonText}>ยังไม่มีบัญชี? สมัครสมาชิก</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostButton}
              onPress={() => navigation.replace('Home')}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.ghostButtonText}>เล่นโดยไม่ล็อกอิน</Text>
            </TouchableOpacity>
          </View>
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
    marginTop: 16,
    marginBottom: 14
  },
  eyebrow: {
    color: colors.accentSecondary,
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
    backgroundColor: 'rgba(32, 211, 255, 0.14)',
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
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: 8,
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
  inlineButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 6
  },
  inlineButtonText: {
    color: colors.accentSecondary,
    fontSize: 13,
    fontWeight: '700'
  },
  actionStack: {
    marginTop: 6,
    gap: 10
  },
  secondaryButton: {
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
  ghostButton: {
    alignItems: 'center',
    paddingVertical: 8
  },
  ghostButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
});
