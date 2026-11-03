export const appState = {
  // 登入狀態
  isLoggedIn: false,

  // 目前登入老師
  currentTeacherId: "",
  currentTeacher: null,
  teacherName: "老師",
  teacherEmail: "",

  // 目前老師可查看的班級
  // 例如：
  // 陳老師：["class_jh1_bio_01", "class_jh1_bio_02"]
  // 林老師：["class_jh3_bio_review_01"]
  allowedClassIds: [],

  // 目前正在查看的班級
  // 可能是：
  // "all"
  // "class_jh1_bio_01"
  // "class_jh1_bio_02"
  // "class_jh3_bio_review_01"
  currentClassId: "",
  currentClassName: "",

  // 時間範圍
  currentRange: "30d",
  currentFrom: "2026-05-01",
  currentTo: "2026-05-16",

  // 學生列表排序
  // mistakeCount / weakConceptCount / activeDays / quizAccuracy
  currentSortBy: "mistakeCount",

  // 目前登入老師可選擇的班級清單
  classes: [],

  // 學生列表暫存資料
  dashboardStudents: []
};