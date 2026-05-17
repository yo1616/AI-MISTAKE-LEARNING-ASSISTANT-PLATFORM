import {
  mockClasses,
  ALL_STUDENTS_CLASS_ID
} from "./data.js";

export function apiOk(data) {
  return { success: true, data };
}

export function apiFail(code, message) {
  return { success: false, error: { code, message } };
}

export function getClassNameById(classId) {
  if (classId === ALL_STUDENTS_CLASS_ID) return "全部學生";
  return mockClasses.find((item) => item.id === classId)?.name || "尚未選擇班級";
}

export function getStudentClass(student, classId) {
  return student.subjects.find((subject) => subject.classId === classId);
}

export function isStudentInClass(student, classId) {
  if (classId === ALL_STUDENTS_CLASS_ID) return true;
  return Boolean(getStudentClass(student, classId));
}

export function getRangeStartDate(range) {
  const baseDate = new Date("2026-05-16T23:59:59+08:00");

  if (range === "7d") {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - 6);
    return date;
  }

  if (range === "14d") {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - 13);
    return date;
  }

  if (range === "30d") {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - 29);
    return date;
  }

  return new Date("1970-01-01T00:00:00+08:00");
}

export function isMistakeInRange(mistake, range, from, to) {
  const mistakeDate = new Date(`${mistake.date}T00:00:00+08:00`);

  if (range === "custom") {
    if (!from || !to) return true;

    return (
      mistakeDate >= new Date(`${from}T00:00:00+08:00`) &&
      mistakeDate <= new Date(`${to}T23:59:59+08:00`)
    );
  }

  return mistakeDate >= getRangeStartDate(range);
}

export function countBy(items, keyGetter) {
  return items.reduce((acc, item) => {
    const key = keyGetter(item);

    if (!acc[key]) {
      acc[key] = {
        count: 0,
        sample: item
      };
    }

    acc[key].count += 1;
    return acc;
  }, {});
}

export function getMistakeBadgeClass(count) {
  if (count >= 5) return "bhi";
  if (count >= 3) return "bmd";
  return "bok";
}

export function getCorrectionComment(rate) {
  if (rate >= 80) return "訂正狀況穩定，可以增加進階題練習。";
  if (rate >= 65) return "訂正狀況中等，建議追蹤高頻錯題。";
  return "訂正率偏低，建議老師優先協助檢查訂正品質。";
}
