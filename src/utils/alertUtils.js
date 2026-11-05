import { Alert, Platform } from 'react-native';

/**
 * แสดง Alert ที่ทำงานได้ทั้งบนมือถือ (iOS/Android) และบน Web Browser
 * เนื่องจากบน React Native Web ค่าเริ่มต้นของ Alert.alert เป็นฟังก์ชันว่างเปล่า
 */
export const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    const text = [title, message].filter(Boolean).join('\n');
    
    // หากมีมากกว่า 1 ปุ่ม (เช่น ตกลง / ยกเลิก) ใช้ window.confirm
    if (buttons && buttons.length > 1) {
      const confirmButton = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1];
      const cancelButton = buttons.find(b => b.style === 'cancel');
      
      const result = window.confirm(text);
      if (result) {
        if (confirmButton && confirmButton.onPress) confirmButton.onPress();
      } else {
        if (cancelButton && cancelButton.onPress) cancelButton.onPress();
      }
      return;
    }

    // กรณีแจ้งเตือนปุ่มเดียว (OK)
    window.alert(text);
    if (buttons && buttons.length > 0 && buttons[0].onPress) {
      buttons[0].onPress();
    }
  } else {
    // บนมือถือใช้ Alert ของ React Native ตามปกติ
    Alert.alert(title, message, buttons);
  }
};

export default showAlert;
