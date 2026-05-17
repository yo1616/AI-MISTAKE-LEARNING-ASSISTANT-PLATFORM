export const SUBJECT_BIO = {
  subjectId: "subject_bio",
  subjectName: "生物"
};

export const ALL_STUDENTS_CLASS_ID = "all";

export const mockClasses = [
  { id: ALL_STUDENTS_CLASS_ID, name: "全部學生" },
  { id: "class_jh1_bio_01", name: "國一生物1班" },
  { id: "class_jh1_bio_02", name: "國一生物2班" },
  { id: "class_jh3_bio_review_01", name: "國三複習生物班" }
];

export const mockStudents = [
  {
    id: "student_001",
    name: "林宇婕",
    gradeYear: "國一",
    joinedAt: "2026/02/01",
    correctionRate: 72,
    activeDays: 18,
    quizAccuracy: 84,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh1_bio_01", className: "國一生物1班" }
    ],
    mistakes: [
      { id: "m_001", classId: "class_jh1_bio_01", conceptId: "concept_bio_001", conceptName: "細胞構造", unitName: "單元一 生命的基本單位", question: "動物細胞與植物細胞的主要差異有哪些？", date: "2026-05-01", createdAt: "2026-05-01T14:30:00+08:00" },
      { id: "m_002", classId: "class_jh1_bio_01", conceptId: "concept_bio_002", conceptName: "顯微鏡使用", unitName: "單元一 生命的基本單位", question: "使用複式顯微鏡時，低倍鏡與高倍鏡的操作順序為何？", date: "2026-05-03", createdAt: "2026-05-03T14:30:00+08:00" },
      { id: "m_003", classId: "class_jh1_bio_01", conceptId: "concept_bio_003", conceptName: "光合作用", unitName: "單元二 生物獲得能量", question: "光合作用需要哪些原料，會產生哪些產物？", date: "2026-05-06", createdAt: "2026-05-06T14:30:00+08:00" },
      { id: "m_004", classId: "class_jh1_bio_01", conceptId: "concept_bio_003", conceptName: "光合作用", unitName: "單元二 生物獲得能量", question: "葉綠體在光合作用中扮演什麼角色？", date: "2026-05-09", createdAt: "2026-05-09T14:30:00+08:00" },
      { id: "m_005", classId: "class_jh1_bio_01", conceptId: "concept_bio_004", conceptName: "呼吸作用", unitName: "單元二 生物獲得能量", question: "呼吸作用與光合作用的差異為何？", date: "2026-05-12", createdAt: "2026-05-12T14:30:00+08:00" },
      { id: "m_006", classId: "class_jh1_bio_01", conceptId: "concept_bio_001", conceptName: "細胞構造", unitName: "單元一 生命的基本單位", question: "細胞核、細胞質、細胞膜各有什麼功能？", date: "2026-05-16", createdAt: "2026-05-16T14:30:00+08:00" }
    ]
  },
  {
    id: "student_002",
    name: "王姿涵",
    gradeYear: "國一",
    joinedAt: "2026/02/03",
    correctionRate: 65,
    activeDays: 14,
    quizAccuracy: 76,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh1_bio_01", className: "國一生物1班" }
    ],
    mistakes: [
      { id: "m_007", classId: "class_jh1_bio_01", conceptId: "concept_bio_002", conceptName: "顯微鏡使用", unitName: "單元一 生命的基本單位", question: "為什麼觀察玻片時要先從低倍鏡開始？", date: "2026-05-02", createdAt: "2026-05-02T14:30:00+08:00" },
      { id: "m_008", classId: "class_jh1_bio_01", conceptId: "concept_bio_003", conceptName: "光合作用", unitName: "單元二 生物獲得能量", question: "光照強度改變會如何影響光合作用？", date: "2026-05-08", createdAt: "2026-05-08T14:30:00+08:00" },
      { id: "m_009", classId: "class_jh1_bio_01", conceptId: "concept_bio_005", conceptName: "生物分類", unitName: "單元三 生物多樣性", question: "五界分類的基本概念是什麼？", date: "2026-05-14", createdAt: "2026-05-14T14:30:00+08:00" }
    ]
  },
  {
    id: "student_003",
    name: "黃妍僖",
    gradeYear: "國一",
    joinedAt: "2026/02/10",
    correctionRate: 83,
    activeDays: 10,
    quizAccuracy: 91,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh1_bio_01", className: "國一生物1班" }
    ],
    mistakes: []
  },
  {
    id: "student_004",
    name: "蔡承祐",
    gradeYear: "國一",
    joinedAt: "2026/02/05",
    correctionRate: 76,
    activeDays: 16,
    quizAccuracy: 82,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh1_bio_02", className: "國一生物2班" }
    ],
    mistakes: [
      { id: "m_010", classId: "class_jh1_bio_02", conceptId: "concept_bio_001", conceptName: "細胞構造", unitName: "單元一 生命的基本單位", question: "植物細胞特有的構造有哪些？", date: "2026-05-04", createdAt: "2026-05-04T14:30:00+08:00" },
      { id: "m_011", classId: "class_jh1_bio_02", conceptId: "concept_bio_004", conceptName: "呼吸作用", unitName: "單元二 生物獲得能量", question: "為什麼生物需要進行呼吸作用？", date: "2026-05-07", createdAt: "2026-05-07T14:30:00+08:00" },
      { id: "m_012", classId: "class_jh1_bio_02", conceptId: "concept_bio_004", conceptName: "呼吸作用", unitName: "單元二 生物獲得能量", question: "呼吸作用的主要場所在哪裡？", date: "2026-05-13", createdAt: "2026-05-13T14:30:00+08:00" },
      { id: "m_013", classId: "class_jh1_bio_02", conceptId: "concept_bio_006", conceptName: "食物鏈與食物網", unitName: "單元四 生態系", question: "食物鏈中的生產者與消費者如何判斷？", date: "2026-05-15", createdAt: "2026-05-15T14:30:00+08:00" }
    ]
  },
  {
    id: "student_005",
    name: "陳允直",
    gradeYear: "國一",
    joinedAt: "2026/02/09",
    correctionRate: 58,
    activeDays: 9,
    quizAccuracy: 68,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh1_bio_02", className: "國一生物2班" }
    ],
    mistakes: [
      { id: "m_014", classId: "class_jh1_bio_02", conceptId: "concept_bio_003", conceptName: "光合作用", unitName: "單元二 生物獲得能量", question: "植物只在白天進行呼吸作用嗎？", date: "2026-05-01", createdAt: "2026-05-01T14:30:00+08:00" },
      { id: "m_015", classId: "class_jh1_bio_02", conceptId: "concept_bio_005", conceptName: "生物分類", unitName: "單元三 生物多樣性", question: "分類階層由大到小的順序為何？", date: "2026-05-10", createdAt: "2026-05-10T14:30:00+08:00" }
    ]
  },
  {
    id: "student_006",
    name: "生物小老師",
    gradeYear: "國一",
    joinedAt: "2026/02/12",
    correctionRate: 88,
    activeDays: 11,
    quizAccuracy: 94,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh1_bio_02", className: "國一生物2班" }
    ],
    mistakes: []
  },
  {
    id: "student_007",
    name: "吳承祐",
    gradeYear: "國三",
    joinedAt: "2026/01/20",
    correctionRate: 69,
    activeDays: 19,
    quizAccuracy: 79,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh3_bio_review_01", className: "國三複習生物班" }
    ],
    mistakes: [
      { id: "m_016", classId: "class_jh3_bio_review_01", conceptId: "concept_bio_007", conceptName: "血液循環", unitName: "複習一 人體生理", question: "體循環與肺循環的路徑差異為何？", date: "2026-05-02", createdAt: "2026-05-02T14:30:00+08:00" },
      { id: "m_017", classId: "class_jh3_bio_review_01", conceptId: "concept_bio_008", conceptName: "氣體交換", unitName: "複習一 人體生理", question: "肺泡與微血管之間如何進行氣體交換？", date: "2026-05-04", createdAt: "2026-05-04T14:30:00+08:00" },
      { id: "m_018", classId: "class_jh3_bio_review_01", conceptId: "concept_bio_009", conceptName: "遺傳法則", unitName: "複習二 遺傳與演化", question: "顯性與隱性性狀如何判斷？", date: "2026-05-06", createdAt: "2026-05-06T14:30:00+08:00" },
      { id: "m_019", classId: "class_jh3_bio_review_01", conceptId: "concept_bio_009", conceptName: "遺傳法則", unitName: "複習二 遺傳與演化", question: "棋盤方格如何推算子代比例？", date: "2026-05-11", createdAt: "2026-05-11T14:30:00+08:00" },
      { id: "m_020", classId: "class_jh3_bio_review_01", conceptId: "concept_bio_010", conceptName: "神經與內分泌", unitName: "複習一 人體生理", question: "神經調節與激素調節有何不同？", date: "2026-05-16", createdAt: "2026-05-16T14:30:00+08:00" }
    ]
  },
  {
    id: "student_008",
    name: "小彎",
    gradeYear: "國三",
    joinedAt: "2026/01/22",
    correctionRate: 74,
    activeDays: 17,
    quizAccuracy: 86,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh3_bio_review_01", className: "國三複習生物班" }
    ],
    mistakes: [
      { id: "m_021", classId: "class_jh3_bio_review_01", conceptId: "concept_bio_007", conceptName: "血液循環", unitName: "複習一 人體生理", question: "心房、心室與血管連接關係如何記？", date: "2026-05-03", createdAt: "2026-05-03T14:30:00+08:00" },
      { id: "m_022", classId: "class_jh3_bio_review_01", conceptId: "concept_bio_011", conceptName: "生態系能量流動", unitName: "複習三 生態與環境", question: "能量在食物網中如何傳遞？", date: "2026-05-09", createdAt: "2026-05-09T14:30:00+08:00" },
      { id: "m_023", classId: "class_jh3_bio_review_01", conceptId: "concept_bio_008", conceptName: "氣體交換", unitName: "複習一 人體生理", question: "氧氣與二氧化碳濃度差如何影響擴散？", date: "2026-05-12", createdAt: "2026-05-12T14:30:00+08:00" }
    ]
  },
  {
    id: "student_009",
    name: "Janet",
    gradeYear: "國三",
    joinedAt: "2026/01/25",
    correctionRate: 81,
    activeDays: 13,
    quizAccuracy: 90,
    subjects: [
      { ...SUBJECT_BIO, classId: "class_jh3_bio_review_01", className: "國三複習生物班" }
    ],
    mistakes: []
  }
];

export const mockTeachers = [
  {
    id: "teacher_001",
    name: "林老師",
    email: "teacher@example.com",
    password: "123456"
  },
  {
    id: "teacher_002",
    name: "王老師",
    email: "wang@example.com",
    password: "123456"
  }
];

export let knowledgeChapters = [
  {
    id: "unit_bio_01",
    name: "單元一：生命的基本單位",
    isOpen: true,
    concepts: [
      { conceptId: "concept_bio_001", conceptName: "細胞構造", mistakeCount: 3 },
      { conceptId: "concept_bio_002", conceptName: "顯微鏡使用", mistakeCount: 2 }
    ]
  },
  {
    id: "unit_bio_02",
    name: "單元二：生物獲得能量",
    isOpen: false,
    concepts: [
      { conceptId: "concept_bio_003", conceptName: "光合作用", mistakeCount: 4 },
      { conceptId: "concept_bio_004", conceptName: "呼吸作用", mistakeCount: 3 }
    ]
  },
  {
    id: "unit_bio_03",
    name: "複習單元：人體生理與遺傳",
    isOpen: false,
    concepts: [
      { conceptId: "concept_bio_007", conceptName: "血液循環", mistakeCount: 2 },
      { conceptId: "concept_bio_008", conceptName: "氣體交換", mistakeCount: 2 },
      { conceptId: "concept_bio_009", conceptName: "遺傳法則", mistakeCount: 2 }
    ]
  }
];
