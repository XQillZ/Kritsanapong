import { categoryMeta } from '../theme/appTheme';

const resolveCategoryLabel = (question, fallbackCategoryName) => {
  if (question?.category && categoryMeta[question.category]?.label) {
    return categoryMeta[question.category].label;
  }

  return fallbackCategoryName || 'สิ่งนี้';
};

export const getQuestionPrompt = (question, fallbackCategoryName = '') => {
  const categoryLabel = resolveCategoryLabel(question, fallbackCategoryName);
  const hasImage = Boolean(question?.imageUrl);
  const hasAudio = Boolean(question?.audioUrl);
  const mediaMode = question?.displayMediaMode || (hasImage ? 'image' : hasAudio ? 'audio' : 'none');

  if (mediaMode === 'audio') {
    return `ฟังเสียงแล้วทายว่าเป็น${categoryLabel}อะไร`;
  }

  if (mediaMode === 'image') {
    return `ดูภาพแล้วทายว่าเป็น${categoryLabel}อะไร`;
  }

  if (hasImage && hasAudio) {
    return `ดูภาพหรือฟังเสียงแล้วทายว่าเป็น${categoryLabel}อะไร`;
  }

  return `ทายคำในหมวด${categoryLabel}ข้อนี้`;
};
