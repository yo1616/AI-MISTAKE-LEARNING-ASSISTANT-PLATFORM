import { getCurrentISOString } from '../utils/timeUtils';

export const seedData = {
  students: [
    {
      id: 'student_001',
      name: '王哈哈',
      gradeYear: '高二',
      email: 'student001@example.com',
      phone: '0912-345-678',
      subjects: [
        { subjectId: 'subject_bio', subjectName: '生物', classId: 'class_hs2_bio_01', className: '高二生物班' }
      ]
    }
  ],
  subjects: [
    { id: 'subject_bio', name: '生物' }
  ],
  classes: [
    { id: 'class_hs2_bio_01', name: '高二生物班', gradeYear: '高二', subjectId: 'subject_bio', subjectName: '生物' }
  ],
  units: [
    { id: 'unit_bio_01', subjectId: 'subject_bio', name: '單元一 人體的運輸與防禦', order: 1, isFixed: true },
    { id: 'unit_bio_02', subjectId: 'subject_bio', name: '單元二 呼吸作用', order: 2, isFixed: true },
    { id: 'unit_bio_03', subjectId: 'subject_bio', name: '單元三 光合作用', order: 3, isFixed: true }
  ],
  concepts: [
    { id: 'concept_bio_001', subjectId: 'subject_bio', unitId: 'unit_bio_01', name: '血液循環方向', keywords: ['體循環', '肺循環', '心臟'], status: 'active', createdBy: 'seed' },
    { id: 'concept_bio_002', subjectId: 'subject_bio', unitId: 'unit_bio_02', name: '呼吸系統', keywords: ['鼻腔', '氣管', '肺'], status: 'active', createdBy: 'seed' },
    { id: 'concept_bio_003', subjectId: 'subject_bio', unitId: 'unit_bio_02', name: '氣體交換', keywords: ['肺泡', '氧氣', '二氧化碳'], status: 'active', createdBy: 'seed' },
    { id: 'concept_bio_004', subjectId: 'subject_bio', unitId: 'unit_bio_02', name: '呼吸作用', keywords: ['ATP', '能量', '細胞呼吸'], status: 'active', createdBy: 'seed' },
    { id: 'concept_bio_005', subjectId: 'subject_bio', unitId: 'unit_bio_03', name: '光合作用', keywords: ['二氧化碳', '氧氣', '葡萄糖'], status: 'active', createdBy: 'seed' },
    { id: 'concept_bio_006', subjectId: 'subject_bio', unitId: 'unit_bio_03', name: '葉綠體功能', keywords: ['葉綠體', '葉綠素'], status: 'active', createdBy: 'seed' },
    { id: 'concept_bio_007', subjectId: 'subject_bio', unitId: 'unit_bio_03', name: '能量轉換', keywords: ['ATP', '能量轉換', '光能'], status: 'active', createdBy: 'ai' }
  ],
  mistakeRecords: [
    {
      id: 'mistake_record_001',
      studentId: 'student_001',
      sourceSessionId: 'chat_001',
      subjectId: 'subject_bio',
      unitId: 'unit_bio_02',
      conceptId: 'concept_bio_003',
      questionText: '肺泡和微血管之間會進行什麼作用？',
      studentQuestion: '肺泡和微血管之間到底在做什麼？',
      correctAnswer: '氣體交換',
      aiSummary: '肺泡和微血管之間進行的是氣體交換。',
      fullExplanation: '肺泡周圍有大量微血管，氧氣由肺泡進入血液，二氧化碳由血液進入肺泡。',
      starred: true,
      starredAt: getCurrentISOString(),
      createdAt: getCurrentISOString()
    },
    {
      id: 'mistake_record_002',
      studentId: 'student_001',
      sourceSessionId: 'chat_002',
      subjectId: 'subject_bio',
      unitId: 'unit_bio_01',
      conceptId: 'concept_bio_001',
      questionText: '血液從心臟送往全身是什麼循環？',
      studentQuestion: '血液從心臟送到全身到底是體循環還是肺循環？',
      correctAnswer: '體循環',
      aiSummary: '血液從心臟送往全身屬於體循環。',
      fullExplanation: '體循環是把含氧血從左心室送到全身，再回到右心房。',
      starred: false,
      starredAt: null,
      createdAt: getCurrentISOString()
    }
  ],
  conceptNotes: [
    {
      id: 'note_001',
      studentId: 'student_001',
      sourceSessionId: 'chat_001',
      subjectId: 'subject_bio',
      unitId: 'unit_bio_02',
      conceptId: 'concept_bio_003',
      noteTitle: '氣體交換重點',
      noteContent: '肺泡是進行氣體交換的主要場所，氧氣進入血液，二氧化碳離開血液進入肺泡。',
      starred: true,
      starredAt: getCurrentISOString(),
      linkedMistakes: ['mistake_record_001'],
      createdAt: getCurrentISOString()
    },
    {
      id: 'note_002',
      studentId: 'student_001',
      sourceSessionId: 'chat_002',
      subjectId: 'subject_bio',
      unitId: 'unit_bio_01',
      conceptId: 'concept_bio_001',
      noteTitle: '體循環與肺循環記法',
      noteContent: '肺循環只在心臟和肺之間，體循環則是心臟到全身。',
      starred: false,
      starredAt: null,
      linkedMistakes: ['mistake_record_002'],
      createdAt: getCurrentISOString()
    }
  ],
  studentAnalyticsSummary: [
    {
      studentId: 'student_001',
      gradeYear: '高二',
      classId: 'class_hs2_bio_01',
      className: '高二生物班',
      totalMistakes: 2,
      starredMistakes: 1,
      starredNotes: 1,
      topWeakConcepts: [
        { conceptId: 'concept_bio_001', conceptName: '血液循環方向', mistakeCount: 1 },
        { conceptId: 'concept_bio_003', conceptName: '氣體交換', mistakeCount: 1 }
      ]
    }
  ]
};

export const initializeLocalStorage = () => {
  const initialize = (key, data) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };
  
  initialize('students', seedData.students);
  initialize('subjects', seedData.subjects);
  initialize('classes', seedData.classes);
  initialize('units', seedData.units);
  initialize('concepts', seedData.concepts);
  initialize('mistakeRecords', seedData.mistakeRecords);
  initialize('conceptNotes', seedData.conceptNotes);
  initialize('studentAnalyticsSummary', seedData.studentAnalyticsSummary);
  initialize('chatSessions', []);
  initialize('chatMessages', []);
  initialize('generatedExams', []);
};