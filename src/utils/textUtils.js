export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .normalize('NFC')
    .replace(/\s+/g, ' ');
};

export const compareAnswers = (userAnswer, correctAnswer, correctAnswerEn) => {
  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrectTh = normalizeText(correctAnswer);
  const normalizedCorrectEn = normalizeText(correctAnswerEn);
  
  return normalizedUser === normalizedCorrectTh || normalizedUser === normalizedCorrectEn;
};
