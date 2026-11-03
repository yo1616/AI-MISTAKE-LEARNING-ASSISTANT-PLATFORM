export const getStudentName = () => {
  const savedName = localStorage.getItem('studentName');
  if (savedName) return savedName;
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  if (students.length > 0) return students[0].name;
  return '同學';
};

export const setStudentName = (name) => {
  localStorage.setItem('studentName', name);
};

export const getUserAvatar = () => {
  return localStorage.getItem('userAvatar') || null;
};