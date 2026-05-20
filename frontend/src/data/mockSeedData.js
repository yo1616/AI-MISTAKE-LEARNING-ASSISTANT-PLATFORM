// src/data/mockSeedData.js
import { getCurrentISOString } from '../utils/timeUtils';

export const seedData = {
  // 直接貼入您提供的 JSON 內容
  students: [
    {
      "id": "student_001",
      "name": "王哈哈",
      "gradeYear": "高二",
      "email": "student001@example.com",
      "phone": "0912-345-678",
      "subjects": [
        {
          "subjectId": "subject_bio",
          "subjectName": "生物",
          "classId": "class_hs2_bio_01",
          "className": "高二生物班"
        },
        {
          "subjectId": "subject_math",
          "subjectName": "數學",
          "classId": "class_hs2_math_01",
          "className": "高二數學班"
        }
      ]
    },
    {
      "id": "student_002",
      "name": "林沃沃",
      "gradeYear": "高二",
      "email": "student002@example.com",
      "phone": "0923-456-789",
      "subjects": [
        {
          "subjectId": "subject_bio",
          "subjectName": "生物",
          "classId": "class_hs2_bio_01",
          "className": "高二生物班"
        },
        {
          "subjectId": "subject_phys",
          "subjectName": "物理",
          "classId": "class_hs2_phys_01",
          "className": "高二物理班"
        }
      ]
    },
    {
      "id": "student_003",
      "name": "張開",
      "gradeYear": "高三",
      "email": "student003@example.com",
      "phone": "0934-567-890",
      "subjects": [
        {
          "subjectId": "subject_bio",
          "subjectName": "生物",
          "classId": "class_hs3_bio_01",
          "className": "高三生物班"
        },
        {
          "subjectId": "subject_math",
          "subjectName": "數學",
          "classId": "class_hs3_math_01",
          "className": "高三數學班"
        }
      ]
    }
  ],
  subjects: [
    {
      "id": "subject_bio",
      "name": "生物"
    },
    {
      "id": "subject_math",
      "name": "數學"
    },
    {
      "id": "subject_phys",
      "name": "物理"
    }
  ],
  classes:  [
    {
      "id": "class_hs2_bio_01",
      "name": "高二生物班",
      "gradeYear": "高二",
      "subjectId": "subject_bio",
      "subjectName": "生物"
    },
    {
      "id": "class_hs2_math_01",
      "name": "高二數學班",
      "gradeYear": "高二",
      "subjectId": "subject_math",
      "subjectName": "數學"
    },
    {
      "id": "class_hs2_phys_01",
      "name": "高二物理班",
      "gradeYear": "高二",
      "subjectId": "subject_phys",
      "subjectName": "物理"
    },
    {
      "id": "class_hs3_bio_01",
      "name": "高三生物班",
      "gradeYear": "高三",
      "subjectId": "subject_bio",
      "subjectName": "生物"
    },
    {
      "id": "class_hs3_math_01",
      "name": "高三數學班",
      "gradeYear": "高三",
      "subjectId": "subject_math",
      "subjectName": "數學"
    }
  ],
  units:[
    {
      "id": "unit_bio_01",
      "subjectId": "subject_bio",
      "name": "單元一 人體的運輸與防禦",
      "order": 1,
      "isFixed": true
    },
    {
      "id": "unit_bio_02",
      "subjectId": "subject_bio",
      "name": "單元二 呼吸作用",
      "order": 2,
      "isFixed": true
    },
    {
      "id": "unit_bio_03",
      "subjectId": "subject_bio",
      "name": "單元三 光合作用",
      "order": 3,
      "isFixed": true
    }
  ],
  // src/data/mockSeedData.js

// 在 units 之後加入
subUnits: [
  { id: "subunit_bio_01_01", unitId: "unit_bio_01", name: "1-1 血液循環概述", order: 1 },
  { id: "subunit_bio_01_02", unitId: "unit_bio_01", name: "1-2 體循環與肺循環", order: 2 },
  { id: "subunit_bio_02_01", unitId: "unit_bio_02", name: "2-1 呼吸系統結構", order: 1 },
  { id: "subunit_bio_02_02", unitId: "unit_bio_02", name: "2-2 氣體交換", order: 2 },
  { id: "subunit_bio_02_03", unitId: "unit_bio_02", name: "2-3 呼吸作用", order: 3 },
  { id: "subunit_bio_03_01", unitId: "unit_bio_03", name: "3-1 光合作用", order: 1 },
  { id: "subunit_bio_03_02", unitId: "unit_bio_03", name: "3-2 葉綠體與能量轉換", order: 2 }
],
  concepts: [
     {
      "id": "concept_bio_001",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_01",
      "name": "血液循環方向",
      "keywords": [
        "體循環",
        "肺循環",
        "心臟",
        "血液"
      ],
      "status": "active",
      "createdBy": "seed",
      "subUnitId": "subunit_bio_01_02"
    },
    {
      "id": "concept_bio_002",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "name": "呼吸系統",
      "keywords": [
        "鼻腔",
        "氣管",
        "支氣管",
        "肺"
      ],
      "status": "active",
      "createdBy": "seed",
      "subUnitId": "subunit_bio_02_01"
    },
    {
      "id": "concept_bio_003",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "name": "氣體交換",
      "keywords": [
        "肺泡",
        "氧氣",
        "二氧化碳",
        "微血管"
      ],
      "status": "active",
      "createdBy": "seed",
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "concept_bio_004",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "name": "呼吸作用",
      "keywords": [
        "ATP",
        "能量",
        "細胞呼吸",
        "養分"
      ],
      "status": "active",
      "createdBy": "seed",
      "subUnitId": "subunit_bio_02_03"
    },
    {
      "id": "concept_bio_005",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_03",
      "name": "光合作用",
      "keywords": [
        "二氧化碳",
        "氧氣",
        "葡萄糖",
        "陽光"
      ],
      "status": "active",
      "createdBy": "seed",
      "subUnitId": "subunit_bio_03_01"
    },
    {
      "id": "concept_bio_006",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_03",
      "name": "葉綠體功能",
      "keywords": [
        "葉綠體",
        "葉綠素",
        "光能"
      ],
      "status": "active",
      "createdBy": "seed",
      "subUnitId": "subunit_bio_03_02"
    },
    {
      "id": "concept_bio_007",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_03",
      "name": "能量轉換",
      "keywords": [
        "ATP",
        "能量轉換",
        "光能",
        "化學能"
      ],
      "status": "active",
      "createdBy": "ai",
      "sourceSessionId": "chat_005",
      "creationReason": "原本只有光合作用與葉綠體功能，無法完整涵蓋 ATP 與能量形式轉換的題目。",
      "subUnitId": "subunit_bio_03_02"
    }
  ],
  chatSessions: [
     {
      "id": "chat_001",
      "studentId": "student_001",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "title": "肺泡和微血管的作用",
      "inputType": "text",
      "startedAt": "2026-05-03T09:00:00+08:00",
      "updatedAt": "2026-05-03T09:05:10+08:00",
      "questionGroupCount": 2,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_003",
        "matchedConceptName": "氣體交換",
        "isNewConcept": false,
        "confidence": 0.95,
        "candidateConceptIds": [
          "concept_bio_002",
          "concept_bio_003",
          "concept_bio_004"
        ]
      },
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "chat_002",
      "studentId": "student_001",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_01",
      "title": "體循環和肺循環怎麼分",
      "inputType": "photo",
      "startedAt": "2026-05-03T10:20:00+08:00",
      "updatedAt": "2026-05-03T10:24:00+08:00",
      "questionGroupCount": 1,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_001",
        "matchedConceptName": "血液循環方向",
        "isNewConcept": false,
        "confidence": 0.97,
        "candidateConceptIds": [
          "concept_bio_001"
        ]
      },
      "subUnitId": "subunit_bio_01_02"
    },
    {
      "id": "chat_003",
      "studentId": "student_002",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_03",
      "title": "光合作用和呼吸作用差異",
      "inputType": "text",
      "questionText": "光合作用跟呼吸作用差在哪裡？",
      "startedAt": "2026-05-03T14:15:00+08:00",
      "updatedAt": "2026-05-03T14:19:30+08:00",
      "questionGroupCount": 1,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_005",
        "matchedConceptName": "光合作用",
        "isNewConcept": false,
        "confidence": 0.83,
        "candidateConceptIds": [
          "concept_bio_005",
          "concept_bio_006"
        ]
      },
      "subUnitId": "subunit_bio_03_01"
    },
    {
      "id": "chat_004",
      "studentId": "student_002",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "title": "氧氣進入血液的地方",
      "inputType": "photo_text",
      "questionImageUrl": "/mock-images/respiration-question-2.jpg",
      "questionText": "氧氣進入血液主要發生在哪裡？",
      "startedAt": "2026-05-03T16:00:00+08:00",
      "updatedAt": "2026-05-03T16:03:20+08:00",
      "questionGroupCount": 1,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_003",
        "matchedConceptName": "氣體交換",
        "isNewConcept": false,
        "confidence": 0.94,
        "candidateConceptIds": [
          "concept_bio_002",
          "concept_bio_003"
        ]
      },
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "chat_005",
      "studentId": "student_003",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_03",
      "title": "ATP 和能量轉換怎麼分類",
      "inputType": "photo_text",
      "questionImageUrl": "/mock-images/energy-question-1.jpg",
      "questionText": "這題在問 ATP 和能量型態轉換",
      "startedAt": "2026-05-03T19:10:00+08:00",
      "updatedAt": "2026-05-03T19:14:30+08:00",
      "questionGroupCount": 1,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_007",
        "matchedConceptName": "能量轉換",
        "isNewConcept": true,
        "confidence": 0.62,
        "candidateConceptIds": [
          "concept_bio_004",
          "concept_bio_005",
          "concept_bio_006"
        ],
        "newConceptReason": "現有觀念能涵蓋呼吸作用或光合作用本身，但無法準確承接 ATP 與能量型態轉換的跨題型提問。"
      },
      "subUnitId": "subunit_bio_03_02"
    },
    {
      "id": "chat_006",
      "studentId": "student_003",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_01",
      "title": "運動後血液會去哪裡",
      "inputType": "text",
      "questionText": "運動後血液送往全身是體循環還是肺循環？",
      "startedAt": "2026-05-03T20:30:00+08:00",
      "updatedAt": "2026-05-03T20:33:00+08:00",
      "questionGroupCount": 1,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_001",
        "matchedConceptName": "血液循環方向",
        "isNewConcept": false,
        "confidence": 0.96,
        "candidateConceptIds": [
          "concept_bio_001"
        ]
      },
      "subUnitId": "subunit_bio_01_02"
    }
  ,
    {
      "id": "chat_004",
      "studentId": "student_002",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "title": "氧氣進入血液的地方",
      "inputType": "photo_text",
      "questionImageUrl": "/mock-images/respiration-question-2.jpg",
      "questionText": "氧氣進入血液主要發生在哪裡？",
      "startedAt": "2026-05-03T16:00:00+08:00",
      "updatedAt": "2026-05-03T16:03:20+08:00",
      "questionGroupCount": 1,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_003",
        "matchedConceptName": "氣體交換",
        "isNewConcept": false,
        "confidence": 0.94,
        "candidateConceptIds": ["concept_bio_002", "concept_bio_003"]
      }
    },
    {
      "id": "chat_005",
      "studentId": "student_003",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_03",
      "title": "ATP 和能量轉換怎麼分類",
      "inputType": "photo_text",
      "questionImageUrl": "/mock-images/energy-question-1.jpg",
      "questionText": "這題在問 ATP 和能量型態轉換",
      "startedAt": "2026-05-03T19:10:00+08:00",
      "updatedAt": "2026-05-03T19:14:30+08:00",
      "questionGroupCount": 1,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_007",
        "matchedConceptName": "能量轉換",
        "isNewConcept": true,
        "confidence": 0.62,
        "candidateConceptIds": ["concept_bio_004", "concept_bio_005", "concept_bio_006"],
        "newConceptReason": "現有觀念能涵蓋呼吸作用或光合作用本身，但無法準確承接 ATP 與能量型態轉換的跨題型提問。"
      }
    },
    {
      "id": "chat_006",
      "studentId": "student_003",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_01",
      "title": "運動後血液會去哪裡",
      "inputType": "text",
      "questionText": "運動後血液送往全身是體循環還是肺循環？",
      "startedAt": "2026-05-03T20:30:00+08:00",
      "updatedAt": "2026-05-03T20:33:00+08:00",
      "questionGroupCount": 1,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_001",
        "matchedConceptName": "血液循環方向",
        "isNewConcept": false,
        "confidence": 0.96,
        "candidateConceptIds": ["concept_bio_001"]
      }
    }
  ],
  chatMessages: [
    {
      "id": "msg_001",
      "sessionId": "chat_001",
      "role": "student",
      "messageType": "new_question",
      "questionGroupId": "qg_001",
      "inputType": "text",
      "content": "肺泡和微血管之間到底在做什麼？",
      "createdAt": "2026-05-03T09:00:00+08:00"
    },
    {
      "id": "msg_002",
      "sessionId": "chat_001",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_001",
      "content": "肺泡和微血管之間會進行氣體交換，氧氣進入血液，二氧化碳離開血液進入肺泡。",
      "createdAt": "2026-05-03T09:00:40+08:00"
    },
    {
      "id": "msg_003",
      "sessionId": "chat_001",
      "role": "student",
      "messageType": "follow_up",
      "questionGroupId": "qg_001",
      "content": "那肺泡不是過濾空氣嗎？",
      "createdAt": "2026-05-03T09:01:15+08:00"
    },
    {
      "id": "msg_004",
      "sessionId": "chat_001",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_001",
      "content": "不是。過濾空氣主要和鼻腔有關，肺泡的重點功能是氣體交換。",
      "createdAt": "2026-05-03T09:02:00+08:00"
    },
    {
      "id": "msg_005",
      "sessionId": "chat_001",
      "role": "student",
      "messageType": "request_practice",
      "questionGroupId": "qg_001",
      "content": "幫我出一題這個觀念的練習題。",
      "createdAt": "2026-05-03T09:03:20+08:00"
    },
    {
      "id": "msg_006",
      "sessionId": "chat_001",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_001",
      "content": "可以，下面是一題關於氣體交換的素養題。",
      "createdAt": "2026-05-03T09:04:10+08:00"
    },
    {
      "id": "msg_007",
      "sessionId": "chat_001",
      "role": "student",
      "messageType": "new_question",
      "questionGroupId": "qg_002",
      "inputType": "text",
      "questionText": "呼吸作用是不是就是用 ATP 合成能量？",
      "content": "呼吸作用是不是就是用 ATP 合成能量？",
      "createdAt": "2026-05-03T09:04:40+08:00"
    },
    {
      "id": "msg_008",
      "sessionId": "chat_001",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_002",
      "content": "比較精確的說法是，呼吸作用會分解養分並釋放能量，供 ATP 的形成與使用。",
      "createdAt": "2026-05-03T09:05:10+08:00"
    },
    {
      "id": "msg_009",
      "sessionId": "chat_002",
      "role": "student",
      "messageType": "new_question",
      "questionGroupId": "qg_003",
      "inputType": "photo",
      "questionImageUrl": "/mock-images/circulation-question-1.jpg",
      "content": "這題我看不懂，血液從心臟送到全身到底是體循環還是肺循環？",
      "createdAt": "2026-05-03T10:20:00+08:00"
    },
    {
      "id": "msg_010",
      "sessionId": "chat_002",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_003",
      "content": "從心臟把含氧血送到全身屬於體循環；肺循環是心臟和肺之間的循環。",
      "createdAt": "2026-05-03T10:21:00+08:00"
    },
    {
      "id": "msg_011",
      "sessionId": "chat_002",
      "role": "student",
      "messageType": "follow_up",
      "questionGroupId": "qg_003",
      "content": "我常常把這兩個方向搞混。",
      "createdAt": "2026-05-03T10:22:20+08:00"
    },
    {
      "id": "msg_012",
      "sessionId": "chat_002",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_003",
      "content": "可以記成：肺循環只在心臟和肺之間，體循環則是心臟到全身。",
      "createdAt": "2026-05-03T10:23:10+08:00"
    },
    {
      "id": "msg_013",
      "sessionId": "chat_003",
      "role": "student",
      "messageType": "new_question",
      "questionGroupId": "qg_004",
      "inputType": "text",
      "questionText": "光合作用跟呼吸作用差在哪裡？",
      "content": "光合作用跟呼吸作用差在哪裡？",
      "createdAt": "2026-05-03T14:15:00+08:00"
    },
    {
      "id": "msg_014",
      "sessionId": "chat_003",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_004",
      "content": "光合作用是植物利用光能製造養分，呼吸作用則是細胞分解養分釋放能量。",
      "createdAt": "2026-05-03T14:16:00+08:00"
    },
    {
      "id": "msg_015",
      "sessionId": "chat_003",
      "role": "student",
      "messageType": "follow_up",
      "questionGroupId": "qg_004",
      "content": "所以兩者不是同一件事，只是都和植物有關？",
      "createdAt": "2026-05-03T14:17:20+08:00"
    },
    {
      "id": "msg_016",
      "sessionId": "chat_003",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_004",
      "content": "對，兩者方向不同，但都和植物生存有關。",
      "createdAt": "2026-05-03T14:18:10+08:00"
    },
    {
      "id": "msg_017",
      "sessionId": "chat_004",
      "role": "student",
      "messageType": "new_question",
      "questionGroupId": "qg_005",
      "inputType": "photo_text",
      "questionImageUrl": "/mock-images/respiration-question-2.jpg",
      "questionText": "氧氣進入血液主要發生在哪裡？",
      "content": "這題是在問支氣管還是肺泡？",
      "createdAt": "2026-05-03T16:00:00+08:00"
    },
    {
      "id": "msg_018",
      "sessionId": "chat_004",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_005",
      "content": "氧氣進入血液主要發生在肺泡，因為肺泡周圍有微血管進行氣體交換。",
      "createdAt": "2026-05-03T16:01:00+08:00"
    },
    {
      "id": "msg_019",
      "sessionId": "chat_004",
      "role": "student",
      "messageType": "request_practice",
      "questionGroupId": "qg_005",
      "content": "幫我出一題類似的素養題。",
      "createdAt": "2026-05-03T16:02:20+08:00"
    },
    {
      "id": "msg_020",
      "sessionId": "chat_004",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_005",
      "content": "可以，下面是一題跟氣體交換相關的素養題。",
      "createdAt": "2026-05-03T16:03:20+08:00"
    },
    {
      "id": "msg_021",
      "sessionId": "chat_005",
      "role": "student",
      "messageType": "new_question",
      "questionGroupId": "qg_006",
      "inputType": "photo_text",
      "questionImageUrl": "/mock-images/energy-question-1.jpg",
      "questionText": "這題在問 ATP 和能量型態轉換",
      "content": "如果題目專門在考 ATP 跟能量型態轉換，這還算光合作用嗎？",
      "createdAt": "2026-05-03T19:10:00+08:00"
    },
    {
      "id": "msg_022",
      "sessionId": "chat_005",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_006",
      "content": "它和光合作用有關，但核心更接近能量如何從光能或養分轉成細胞可利用的形式。",
      "createdAt": "2026-05-03T19:11:00+08:00"
    },
    {
      "id": "msg_023",
      "sessionId": "chat_005",
      "role": "student",
      "messageType": "follow_up",
      "questionGroupId": "qg_006",
      "content": "那這是不是應該另外整理成一個觀念？",
      "createdAt": "2026-05-03T19:12:00+08:00"
    },
    {
      "id": "msg_024",
      "sessionId": "chat_005",
      "role": "assistant",
      "messageType": "classification_explanation",
      "questionGroupId": "qg_006",
      "content": "因為既有觀念無法完整涵蓋 ATP 與能量轉換題型，所以建立新觀念『能量轉換』會比較穩定。",
      "createdAt": "2026-05-03T19:14:30+08:00"
    },
    {
      "id": "msg_025",
      "sessionId": "chat_006",
      "role": "student",
      "messageType": "new_question",
      "questionGroupId": "qg_007",
      "inputType": "text",
      "questionText": "運動後血液送往全身是體循環還是肺循環？",
      "content": "運動後血液送往全身是體循環還是肺循環？",
      "createdAt": "2026-05-03T20:30:00+08:00"
    },
    {
      "id": "msg_026",
      "sessionId": "chat_006",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_007",
      "content": "若強調從心臟把含氧血送到全身，就是體循環。",
      "createdAt": "2026-05-03T20:31:00+08:00"
    },
    {
      "id": "msg_027",
      "sessionId": "chat_006",
      "role": "student",
      "messageType": "request_practice",
      "questionGroupId": "qg_007",
      "content": "再幫我出一題同觀念的素養題。",
      "createdAt": "2026-05-03T20:32:10+08:00"
    },
    {
      "id": "msg_028",
      "sessionId": "chat_006",
      "role": "assistant",
      "messageType": "answer",
      "questionGroupId": "qg_007",
      "content": "可以，下面是一題跟循環方向相關的素養題。",
      "createdAt": "2026-05-03T20:33:00+08:00"
    }
  ],
  mistakeRecords: [
    {
      "id": "mistake_record_001",
      "studentId": "student_001",
      "sourceSessionId": "chat_001",
      "questionGroupId": "qg_001",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "inputType": "text",
      "questionImageUrl": null,
      "questionText": "肺泡與微血管之間進行何種作用？",
      "studentQuestion": "肺泡和微血管之間到底在做什麼？",
      "studentAnswer": null,
      "correctAnswer": "氣體交換",
      "conceptClassification": {
        "matchedConceptId": "concept_bio_003",
        "matchedConceptName": "氣體交換",
        "isNewConcept": false,
        "confidence": 0.95
      },
      "aiSummary": "這題重點是肺泡的功能。肺泡和微血管之間進行的是氣體交換，不是消化作用。",
      "fullExplanation": "肺泡周圍有大量微血管，氧氣會由肺泡進入血液，二氧化碳則由血液進入肺泡，最後排出體外。這整個過程稱為氣體交換。",
      "starred": true,
      "starredAt": "2026-05-03T20:00:00+08:00",
      "alertTriggered": false,
      "createdAt": "2026-05-03T09:02:30+08:00",
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "mistake_record_002",
      "studentId": "student_001",
      "sourceSessionId": "chat_002",
      "questionGroupId": "qg_003",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_01",
      "conceptId": "concept_bio_001",
      "inputType": "photo",
      "questionImageUrl": "/mock-images/circulation-question-1.jpg",
      "questionText": "血液從心臟送往全身屬於哪一循環？",
      "studentQuestion": "這題我看不懂，血液從心臟送到全身到底是體循環還是肺循環？",
      "studentAnswer": null,
      "correctAnswer": "體循環",
      "conceptClassification": {
        "matchedConceptId": "concept_bio_001",
        "matchedConceptName": "血液循環方向",
        "isNewConcept": false,
        "confidence": 0.97
      },
      "aiSummary": "體循環是心臟到全身，肺循環是心臟到肺。這題考的是體循環。",
      "fullExplanation": "體循環會把含氧血從左心室送到全身，再回到右心房；肺循環則是把缺氧血送到肺部進行氣體交換後再回心臟。",
      "starred": false,
      "starredAt": null,
      "alertTriggered": false,
      "createdAt": "2026-05-03T10:23:30+08:00",
      "subUnitId": "subunit_bio_01_02"
    },
    {
      "id": "mistake_record_003",
      "studentId": "student_002",
      "sourceSessionId": "chat_003",
      "questionGroupId": "qg_004",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_03",
      "conceptId": "concept_bio_005",
      "inputType": "text",
      "questionImageUrl": null,
      "questionText": "下列何者最能描述光合作用與呼吸作用的差異？",
      "studentQuestion": "光合作用跟呼吸作用差在哪裡？",
      "studentAnswer": null,
      "correctAnswer": "光合作用製造養分，呼吸作用分解養分釋放能量",
      "conceptClassification": {
        "matchedConceptId": "concept_bio_005",
        "matchedConceptName": "光合作用",
        "isNewConcept": false,
        "confidence": 0.83
      },
      "aiSummary": "光合作用偏向製造養分，呼吸作用偏向釋放能量，兩者不能視為同一件事。",
      "fullExplanation": "光合作用通常在葉綠體中進行，利用光能把二氧化碳和水轉成葡萄糖與氧氣；呼吸作用則是在細胞中分解養分釋放能量供生命活動使用。",
      "starred": true,
      "starredAt": "2026-05-03T21:00:00+08:00",
      "alertTriggered": false,
      "createdAt": "2026-05-03T14:18:30+08:00",
      "subUnitId": "subunit_bio_03_01"
    },
    {
      "id": "mistake_record_004",
      "studentId": "student_002",
      "sourceSessionId": "chat_004",
      "questionGroupId": "qg_005",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "inputType": "photo_text",
      "questionImageUrl": "/mock-images/respiration-question-2.jpg",
      "questionText": "氧氣進入血液主要發生在哪裡？",
      "studentQuestion": "這題是在問支氣管還是肺泡？",
      "studentAnswer": null,
      "correctAnswer": "肺泡",
      "conceptClassification": {
        "matchedConceptId": "concept_bio_003",
        "matchedConceptName": "氣體交換",
        "isNewConcept": false,
        "confidence": 0.94
      },
      "aiSummary": "氧氣進入血液的主要位置是肺泡，因為肺泡周圍有微血管進行氣體交換。",
      "fullExplanation": "肺泡是進行氧氣與二氧化碳交換的主要位置，因此題目若問氧氣進入血液發生在哪裡，答案通常是肺泡。",
      "starred": false,
      "starredAt": null,
      "alertTriggered": false,
      "createdAt": "2026-05-03T16:01:30+08:00",
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "mistake_record_005",
      "studentId": "student_003",
      "sourceSessionId": "chat_005",
      "questionGroupId": "qg_006",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_03",
      "conceptId": "concept_bio_007",
      "inputType": "photo_text",
      "questionImageUrl": "/mock-images/energy-question-1.jpg",
      "questionText": "植物把光能轉成化學能並供細胞利用，這題核心最適合歸在哪個觀念？",
      "studentQuestion": "如果題目專門在考 ATP 跟能量型態轉換，這還算光合作用嗎？",
      "studentAnswer": null,
      "correctAnswer": "較適合歸在能量轉換",
      "conceptClassification": {
        "matchedConceptId": "concept_bio_007",
        "matchedConceptName": "能量轉換",
        "isNewConcept": true,
        "confidence": 0.62
      },
      "aiSummary": "這題不只是在問光合作用名稱，而是在問能量如何被轉換並和 ATP 連動，因此需要新觀念「能量轉換」。",
      "fullExplanation": "當題目主軸從作用名稱轉向光能、化學能與 ATP 的關係時，原本的光合作用或葉綠體功能都不夠精準，因此 AI 建議新增更穩定的觀念標籤。",
      "starred": true,
      "starredAt": "2026-05-03T21:10:00+08:00",
      "alertTriggered": false,
      "createdAt": "2026-05-03T19:13:20+08:00",
      "subUnitId": "subunit_bio_03_02"
    },
    {
      "id": "mistake_record_006",
      "studentId": "student_003",
      "sourceSessionId": "chat_006",
      "questionGroupId": "qg_007",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_01",
      "conceptId": "concept_bio_001",
      "inputType": "text",
      "questionImageUrl": null,
      "questionText": "運動後血液送往全身是體循環還是肺循環？",
      "studentQuestion": "運動後血液送往全身是體循環還是肺循環？",
      "studentAnswer": null,
      "correctAnswer": "體循環",
      "conceptClassification": {
        "matchedConceptId": "concept_bio_001",
        "matchedConceptName": "血液循環方向",
        "isNewConcept": false,
        "confidence": 0.96
      },
      "aiSummary": "只要題目在問血液從心臟送往全身，就屬於體循環。",
      "fullExplanation": "體循環的重點是把含氧血從心臟送往全身組織；肺循環則只在心臟和肺之間進行。",
      "starred": false,
      "starredAt": null,
      "alertTriggered": true,
      "createdAt": "2026-05-03T20:31:20+08:00",
      "subUnitId": "subunit_bio_01_02"
    }
  ],
  conceptNotes: [
     {
      "id": "note_001",
      "studentId": "student_001",
      "sourceSessionId": "chat_001",
      "questionGroupId": "qg_001",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "noteTitle": "氣體交換重點",
      "noteContent": "肺泡是進行氣體交換的主要場所，氧氣進入血液，二氧化碳離開血液進入肺泡。",
      "starred": false,
      "starredAt": null,
      "linkedMistakes": [
        "mistake_record_001"
      ],
      "linkedPracticeQuestions": [
        "practice_001"
      ],
      "createdAt": "2026-05-03T09:02:10+08:00",
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "note_002",
      "studentId": "student_001",
      "sourceSessionId": "chat_002",
      "questionGroupId": "qg_003",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_01",
      "conceptId": "concept_bio_001",
      "noteTitle": "體循環與肺循環記法",
      "noteContent": "肺循環只在心臟和肺之間，體循環則是心臟到全身。",
      "starred": true,
      "starredAt": "2026-05-03T20:05:00+08:00",
      "linkedMistakes": [
        "mistake_record_002"
      ],
      "linkedPracticeQuestions": [
        "practice_002"
      ],
      "createdAt": "2026-05-03T10:23:20+08:00",
      "subUnitId": "subunit_bio_01_02"
    },
    {
      "id": "note_003",
      "studentId": "student_002",
      "sourceSessionId": "chat_003",
      "questionGroupId": "qg_004",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_03",
      "conceptId": "concept_bio_005",
      "noteTitle": "光合作用與呼吸作用差異",
      "noteContent": "光合作用是製造養分，呼吸作用是分解養分釋放能量，兩者方向相反但都和植物生存有關。",
      "starred": true,
      "starredAt": "2026-05-03T21:03:00+08:00",
      "linkedMistakes": [
        "mistake_record_003"
      ],
      "linkedPracticeQuestions": [
        "practice_003"
      ],
      "createdAt": "2026-05-03T14:18:50+08:00",
      "subUnitId": "subunit_bio_03_01"
    },
    {
      "id": "note_004",
      "studentId": "student_002",
      "sourceSessionId": "chat_004",
      "questionGroupId": "qg_005",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "noteTitle": "氧氣進入血液的位置",
      "noteContent": "若題目問氧氣進入血液發生在哪裡，答案通常是肺泡，因為肺泡周圍有微血管進行氣體交換。",
      "starred": false,
      "starredAt": null,
      "linkedMistakes": [
        "mistake_record_004"
      ],
      "linkedPracticeQuestions": [
        "practice_004"
      ],
      "createdAt": "2026-05-03T16:01:50+08:00",
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "note_005",
      "studentId": "student_003",
      "sourceSessionId": "chat_005",
      "questionGroupId": "qg_006",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_03",
      "conceptId": "concept_bio_007",
      "noteTitle": "能量轉換與 ATP",
      "noteContent": "當題目主軸在光能、化學能與 ATP 的轉換關係時，使用「能量轉換」比單純歸在光合作用更精準。",
      "starred": true,
      "starredAt": "2026-05-03T21:12:00+08:00",
      "linkedMistakes": [
        "mistake_record_005"
      ],
      "linkedPracticeQuestions": [
        "practice_005"
      ],
      "createdAt": "2026-05-03T19:13:00+08:00",
      "subUnitId": "subunit_bio_03_02"
    },
    {
      "id": "note_006",
      "studentId": "student_003",
      "sourceSessionId": "chat_006",
      "questionGroupId": "qg_007",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_01",
      "conceptId": "concept_bio_001",
      "noteTitle": "體循環判斷方式",
      "noteContent": "只要題目在問血液從心臟送往全身組織，就應優先判斷為體循環。",
      "starred": false,
      "starredAt": null,
      "linkedMistakes": [
        "mistake_record_006"
      ],
      "linkedPracticeQuestions": [
        "practice_006"
      ],
      "createdAt": "2026-05-03T20:31:40+08:00",
      "subUnitId": "subunit_bio_01_02"
    }
  ],
  generatedPracticeQuestions: [
    {
      "id": "practice_001",
      "studentId": "student_001",
      "sourceSessionId": "chat_001",
      "questionGroupId": "qg_001",
      "sourceMistakeId": "mistake_record_001",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "questionStyle": "literacy",
      "title": "登山時的呼吸變化",
      "passage": "小明和家人一起去爬山，走到半山腰時覺得呼吸變快。爸爸告訴他，身體活動量變大時，需要更多氧氣進入血液，這時肺部中的某些構造會和周圍微血管進行作用，幫助氧氣被運送到全身。",
      "questionText": "根據上文，最符合題意的構造功能是下列哪一項？",
      "options": [
        "過濾空氣中的灰塵",
        "進行氣體交換",
        "將養分分解成葡萄糖",
        "控制心跳速度"
      ],
      "answer": "進行氣體交換",
      "explanation": "題幹描述的是氧氣進入血液的過程，對應的核心概念是氣體交換。",
      "starred": true,
      "starredAt": "2026-05-03T20:10:00+08:00",
      "createdAt": "2026-05-03T09:04:10+08:00",
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "practice_002",
      "studentId": "student_001",
      "sourceSessionId": "chat_002",
      "questionGroupId": "qg_003",
      "sourceMistakeId": "mistake_record_002",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_01",
      "conceptId": "concept_bio_001",
      "questionStyle": "literacy",
      "title": "運動後的循環路徑",
      "passage": "體育課後，小華覺得心跳加快。老師說，這時心臟會更快速地把血液送到肺部和全身，讓身體能獲得足夠氧氣並帶走代謝後的廢物。",
      "questionText": "若題目特別強調血液從心臟送往肺部完成氣體交換，最適合歸類為哪一種循環？",
      "options": [
        "體循環",
        "肺循環",
        "消化循環",
        "淋巴循環"
      ],
      "answer": "肺循環",
      "explanation": "心臟與肺之間的血液循環稱為肺循環，重點是完成氣體交換。",
      "starred": false,
      "starredAt": null,
      "createdAt": "2026-05-03T10:24:00+08:00",
      "subUnitId": "subunit_bio_01_02"
    },
    {
      "id": "practice_003",
      "studentId": "student_002",
      "sourceSessionId": "chat_003",
      "questionGroupId": "qg_004",
      "sourceMistakeId": "mistake_record_003",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_03",
      "conceptId": "concept_bio_005",
      "questionStyle": "literacy",
      "title": "植物白天的生存策略",
      "passage": "阿哲觀察到家中的盆栽白天放在窗邊時生長較好。老師說，植物在有陽光時可以利用特定構造，把外界物質轉換成自己所需的養分，並產生氧氣。",
      "questionText": "根據上文，最符合這段描述的生物作用是下列哪一項？",
      "options": [
        "分解養分釋放能量",
        "製造葡萄糖並釋放氧氣",
        "吸收氧氣後直接產生血液",
        "只在夜晚進行的作用"
      ],
      "answer": "製造葡萄糖並釋放氧氣",
      "explanation": "題幹描述的是植物利用光能製造養分並釋放氧氣，屬於光合作用。",
      "starred": false,
      "starredAt": null,
      "createdAt": "2026-05-03T14:19:00+08:00",
      "subUnitId": "subunit_bio_03_01"
    },
    {
      "id": "practice_004",
      "studentId": "student_002",
      "sourceSessionId": "chat_004",
      "questionGroupId": "qg_005",
      "sourceMistakeId": "mistake_record_004",
      "subjectId": "subject_bio",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "questionStyle": "literacy",
      "title": "校慶接力賽的呼吸需求",
      "passage": "校慶接力賽時，小晴跑完一圈後氣喘吁吁。保健老師提醒她，劇烈運動時身體更需要把氧氣送到各個細胞，因此肺部中的某些構造會和血液快速進行作用。",
      "questionText": "根據上文，最符合題意的構造主要功能是什麼？",
      "options": [
        "將養分儲存在肝臟",
        "進行氣體交換",
        "把血液變成養分",
        "控制神經反應"
      ],
      "answer": "進行氣體交換",
      "explanation": "題幹描述的是氧氣進入血液並供應全身細胞，對應的核心概念是氣體交換。",
      "starred": true,
      "starredAt": "2026-05-03T21:05:00+08:00",
      "createdAt": "2026-05-03T16:03:20+08:00",
      "subUnitId": "subunit_bio_02_02"
    },
    {
      "id": "practice_005",
      "studentId": "student_003",
      "sourceSessionId": "chat_005",
      "questionGroupId": "qg_006",
      "sourceMistakeId": "mistake_record_005",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_03",
      "conceptId": "concept_bio_007",
      "questionStyle": "literacy",
      "title": "太陽能與細胞能量",
      "passage": "自然課時，老師提到植物可先把太陽能轉成儲存在養分中的化學能，之後細胞再利用這些能量形成 ATP，供生長與修補組織使用。小安發現這類題目不只是問光合作用名稱，而是更重視能量在不同階段的轉變。",
      "questionText": "根據上文，這類題目最適合歸在哪個觀念？",
      "options": [
        "葉綠體功能",
        "光合作用",
        "能量轉換",
        "氣體交換"
      ],
      "answer": "能量轉換",
      "explanation": "題幹核心在光能、化學能與 ATP 的轉換關係，因此最適合歸在能量轉換。",
      "starred": true,
      "starredAt": "2026-05-03T21:15:00+08:00",
      "createdAt": "2026-05-03T19:14:00+08:00",
      "subUnitId": "subunit_bio_03_02"
    },
    {
      "id": "practice_006",
      "studentId": "student_003",
      "sourceSessionId": "chat_006",
      "questionGroupId": "qg_007",
      "sourceMistakeId": "mistake_record_006",
      "subjectId": "subject_bio",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "unitId": "unit_bio_01",
      "conceptId": "concept_bio_001",
      "questionStyle": "literacy",
      "title": "跑步後的血液流向",
      "passage": "運動會跑完 800 公尺後，阿誠覺得心跳明顯加快。老師說，這時心臟會更快地把含氧血送往全身各部位，讓肌肉得到足夠氧氣與養分。",
      "questionText": "根據上文，血液由心臟送往全身各部位主要屬於哪一種循環？",
      "options": [
        "體循環",
        "肺循環",
        "淋巴循環",
        "消化循環"
      ],
      "answer": "體循環",
      "explanation": "從心臟將含氧血送到全身的是體循環。",
      "starred": false,
      "starredAt": null,
      "createdAt": "2026-05-03T20:33:00+08:00",
      "subUnitId": "subunit_bio_01_02"
    }
  ],
  studentAnalyticsSummary: [
    {
      "studentId": "student_001",
      "gradeYear": "高二",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "totalMistakes": 2,
      "starredMistakes": 1,
      "starredNotes": 1,
      "generatedExamCount": 1,
      "generatedExamAccuracy": {
        "correctCount": 2,
        "totalAnswered": 3,
        "accuracyRate": 0.67
      },
      "topWeakConcepts": [
        {
          "conceptId": "concept_bio_001",
          "conceptName": "血液循環方向",
          "mistakeCount": 1
        },
        {
          "conceptId": "concept_bio_003",
          "conceptName": "氣體交換",
          "mistakeCount": 1
        }
      ],
      "conceptDistribution": [
        { "conceptName": "氣體交換", "count": 1 },
        { "conceptName": "血液循環方向", "count": 1 }
      ],
      "unitDistribution": [
        { "unitName": "單元二 呼吸作用", "count": 1 },
        { "unitName": "單元一 人體的運輸與防禦", "count": 1 }
      ]
    },
    {
      "studentId": "student_002",
      "gradeYear": "高二",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "totalMistakes": 2,
      "starredMistakes": 1,
      "starredNotes": 1,
      "generatedExamCount": 1,
      "generatedExamAccuracy": {
        "correctCount": 3,
        "totalAnswered": 4,
        "accuracyRate": 0.75
      },
      "topWeakConcepts": [
        {
          "conceptId": "concept_bio_003",
          "conceptName": "氣體交換",
          "mistakeCount": 1
        },
        {
          "conceptId": "concept_bio_005",
          "conceptName": "光合作用",
          "mistakeCount": 1
        }
      ],
      "conceptDistribution": [
        { "conceptName": "氣體交換", "count": 1 },
        { "conceptName": "光合作用", "count": 1 }
      ],
      "unitDistribution": [
        { "unitName": "單元二 呼吸作用", "count": 1 },
        { "unitName": "單元三 光合作用", "count": 1 }
      ]
    },
    {
      "studentId": "student_003",
      "gradeYear": "高三",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "totalMistakes": 2,
      "starredMistakes": 1,
      "starredNotes": 1,
      "generatedExamCount": 1,
      "generatedExamAccuracy": {
        "correctCount": 4,
        "totalAnswered": 5,
        "accuracyRate": 0.8
      },
      "topWeakConcepts": [
        {
          "conceptId": "concept_bio_001",
          "conceptName": "血液循環方向",
          "mistakeCount": 1
        },
        {
          "conceptId": "concept_bio_007",
          "conceptName": "能量轉換",
          "mistakeCount": 1
        }
      ],
      "conceptDistribution": [
        { "conceptName": "血液循環方向", "count": 1 },
        { "conceptName": "能量轉換", "count": 1 }
      ],
      "unitDistribution": [
        { "unitName": "單元一 人體的運輸與防禦", "count": 1 },
        { "unitName": "單元三 光合作用", "count": 1 }
      ]
    }
  ],
  studentAnalyticsCharts: [
    {
      "studentId": "student_001",
      "gradeYear": "高二",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "mistakeTrend": [
        { "date": "2026-05-03", "count": 2 }
      ],
      "generatedExamAccuracyTrend": [
        { "date": "2026-05-03", "accuracyRate": 0.67 }
      ],
      "conceptDistribution": [
        { "conceptName": "氣體交換", "count": 1 },
        { "conceptName": "血液循環方向", "count": 1 }
      ],
      "unitDistribution": [
        { "unitName": "單元二 呼吸作用", "count": 1 },
        { "unitName": "單元一 人體的運輸與防禦", "count": 1 }
      ]
    },
    {
      "studentId": "student_002",
      "gradeYear": "高二",
      "classId": "class_hs2_bio_01",
      "className": "高二生物班",
      "mistakeTrend": [
        { "date": "2026-05-03", "count": 2 }
      ],
      "generatedExamAccuracyTrend": [
        { "date": "2026-05-03", "accuracyRate": 0.75 }
      ],
      "conceptDistribution": [
        { "conceptName": "氣體交換", "count": 1 },
        { "conceptName": "光合作用", "count": 1 }
      ],
      "unitDistribution": [
        { "unitName": "單元二 呼吸作用", "count": 1 },
        { "unitName": "單元三 光合作用", "count": 1 }
      ]
    },
    {
      "studentId": "student_003",
      "gradeYear": "高三",
      "classId": "class_hs3_bio_01",
      "className": "高三生物班",
      "mistakeTrend": [
        { "date": "2026-05-03", "count": 2 }
      ],
      "generatedExamAccuracyTrend": [
        { "date": "2026-05-03", "accuracyRate": 0.8 }
      ],
      "conceptDistribution": [
        { "conceptName": "血液循環方向", "count": 1 },
        { "conceptName": "能量轉換", "count": 1 }
      ],
      "unitDistribution": [
        { "unitName": "單元一 人體的運輸與防禦", "count": 1 },
        { "unitName": "單元三 光合作用", "count": 1 }
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
  initialize('subUnits', seedData.subUnits); 
  initialize('concepts', seedData.concepts);
  initialize('chatSessions', seedData.chatSessions);
  initialize('chatMessages', seedData.chatMessages);
  initialize('mistakeRecords', seedData.mistakeRecords);
  initialize('conceptNotes', seedData.conceptNotes);
  initialize('generatedExams', seedData.generatedPracticeQuestions);
  initialize('studentAnalyticsSummary', seedData.studentAnalyticsSummary);
  initialize('studentAnalyticsCharts', seedData.studentAnalyticsCharts);
  initialize('teacherDashboardSummary', seedData.teacherDashboardSummary);
  initialize('teacherStudentConceptStats', seedData.teacherStudentConceptStats);
  initialize('teacherStudentCharts', seedData.teacherStudentCharts);
};