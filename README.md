## 1. 共用規則

- request 是前端送給後端的格式；response 是後端回傳給前端的格式
- 先用 JSON API，全部回傳 UTF-8 JSON。
- Base URL：`/api`
- 成功：`{ "success": true, "data": ... }`
- 失敗：`{ "success": false, "error": { "code": "STRING", "message": "說明" } }`
- 時間格式統一用 ISO 8601，例如 `2026-05-03T14:30:00+08:00`

## 2. 分類方式定義

### 「非」歷史對話紀錄之排序與分類規則（如：知識點筆記、錯題等）

簡述流程： 科目 >> 單元 >> 觀念標籤 >> 內容（先排星號，再依時間新到舊往下排）
- `subjectId`：固定科目
- `unitId`：固定單元
- `conceptId`：AI 分類出的觀念
- AI 必須優先匹配既有 `concept`
- 只有真的沒有適合觀念時，才允許新建 `concept`
- 被分到對應 `concept`後，先排星號 `starred`，其餘沒星號用 `createdAt` 「由新到舊」排序

### 分類的觀念標籤（分類方式）

`GET /api/concepts?subjectId=subject_bio&unitId=unit_bio_02`

是指「科目>>單元>>觀念標題」這部分分類方式的「觀念標籤」的部分

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "concept_bio_002",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "name": "呼吸系統",
      "keywords": ["鼻腔", "氣管", "支氣管", "肺"],
      "createdBy": "seed"
    },
    {
      "id": "concept_bio_003",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "name": "氣體交換",
      "keywords": ["肺泡", "氧氣", "二氧化碳", "微血管"],
      "createdBy": "seed"
    }
  ]
}
```
### AI 觀念分類

判斷要分到哪個「觀念標籤」

`POST /api/ai/concept-classification`

Request:

```json
{
  "subjectId": "subject_bio",
  "unitId": "unit_bio_03",
  "inputType": "photo_text",
  "questionImageUrl": "/uploads/energy-question-1.jpg",
  "questionText": "這題在問 ATP 和能量型態轉換",
  "availableConcepts": [
    {
      "id": "concept_bio_005",
      "name": "光合作用"
    },
    {
      "id": "concept_bio_006",
      "name": "葉綠體功能"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "ocrText": "這題在問 ATP 和能量型態轉換",
    "matchedConceptId": "concept_bio_007",
    "matchedConceptName": "能量轉換",
    "isNewConcept": true,
    "confidence": 0.62,
    "candidateConceptIds": ["concept_bio_004", "concept_bio_005", "concept_bio_006"],
    "newConceptReason": "現有觀念無法完整涵蓋 ATP 與能量型態轉換的題型。"
  }
}
```

## 3. 問答功能

### 詢問AI錯題之輸入規則

學生提問方式可能是「純文字」、「純圖片」、「圖片加文字」
- `text`：學生直接打字
- `photo`：學生只上傳照片
- `photo_text`：學生上傳照片也打字
- `questionImageUrl` 和 `questionText` 至少要有一個

### 建立歷史對話

`POST /api/chat-sessions`

開一個聊天容器 `session` ，學生之後可以在同一個對話裡（同一個 `session` 裡）連續問很多題，第一題會在建立 `session` 時一起送出

Request:

```json
{
  "studentId": "student_001",
  "subjectId": "subject_bio",
  "unitId": "unit_bio_02",
  "inputType": "photo_text",
  "questionImageUrl": "/uploads/q1.jpg",
  "questionText": "這題在問肺泡功能嗎？"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "sessionId": "chat_001",
    "conceptClassification": {
      "matchedConceptId": "concept_bio_003",
      "matchedConceptName": "氣體交換",
      "isNewConcept": false,
      "confidence": 0.93
    },
    "assistantMessage": {
      "messageId": "msg_002",
      "content": "肺泡和微血管之間主要進行氣體交換。"
    }
  }
}
```

### 繼續對話

`POST /api/chat-sessions/:sessionId/messages`

在既有聊天容器 `session` 中新增訊息，這則訊息可以是「新題目」也可以是「追問」

Request:

```json
{
  "role": "student",
  "messageType": "new_question",
  "questionGroupId": "qg_002",
  "inputType": "photo_text",
  "questionImageUrl": "/uploads/q2.jpg",
  "questionText": "這題在問肺循環還是體循環？",
  "content": "這題我看不懂，血液從心臟送到全身到底是體循環還是肺循環？"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "studentMessageId": "msg_003",
    "questionGroupId": "qg_002",
    "assistantMessage": {
      "messageId": "msg_004",
      "content": "從心臟把含氧血送到全身屬於體循環；肺循環是心臟和肺之間的循環。"
    }
  }
}
```

## 4. 基礎功能

### 歷史對話排序規則

歷史對話列表是指像GPT的聊天記錄「列表」
單一對話是指點開列表的其中一項會顯示的「對話本身」，我是想要一點開就顯示他問的第一句話（即最頂部），而不是最底部

學生體感會是可以接著問很多題（以下指的`session`），但系統背後實際會把不同題切開

- 歷史對話列表 `chat-sessions`：依照 `updatedAt` 「由新到舊」排序
- 單一對話內的 `messages`：依照 `createdAt` 「由舊到新」排序
- 歷史對話主軸是時間，不是分類
- `session` 是聊天容器，不代表只有一題
- 同一個 `session` 內可以有很多不同題目
- 真正切分每一題的是 `messageType` 與 `questionGroupId`

### 歷史對話「列表」

`GET /api/students/:studentId/chat-sessions?sort=updatedAt_desc`

就是列表本身要有什麼

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "chat_004",
      "studentId": "student_001",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_03",
      "inputType": "photo_text",
      "title": "ATP 和能量轉換怎麼分類",
      "startedAt": "2026-05-03T20:10:00+08:00",
      "updatedAt": "2026-05-03T20:13:10+08:00",
      "questionGroupCount": 3,
      "conceptClassification": {
        "matchedConceptId": "concept_bio_007",
        "matchedConceptName": "能量轉換",
        "isNewConcept": true,
        "confidence": 0.62
      }
    }
  ]
}
```

### 單一對話完整「內容」

`GET /api/chat-sessions/:sessionId/messages`

這是指點開列表後要跑出的來回的聊天內容本身

Response:

```json
{
  "success": true,
  "data": [
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
      "messageType": "new_question",
      "questionGroupId": "qg_002",
      "inputType": "photo",
      "questionImageUrl": "/uploads/q2.jpg",
      "content": "這題我看不懂，血液從心臟送到全身到底是體循環還是肺循環？",
      "createdAt": "2026-05-03T09:03:10+08:00"
    }
  ]
}
```

### 紀錄錯題

### 新增錯題

`POST /api/mistakes`

Request:

```json
{
  "studentId": "student_001",
  "sourceSessionId": "chat_001",
  "questionGroupId": "qg_001",
  "starred": false
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "mistake_record_001",
    "studentId": "student_001",
    "sourceSessionId": "chat_001",
    "questionGroupId": "qg_001",
    "subjectId": "subject_bio",
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
    "starred": false,
    "starredAt": null,
    "alertTriggered": false,
    "createdAt": "2026-05-03T14:30:00+08:00"
  }
}
```

### 單一學生錯題「列表」

`GET /api/students/:studentId/mistakes`

對，列表

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "mistake_record_001",
      "sourceSessionId": "chat_001",
      "questionGroupId": "qg_001",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "inputType": "text",
      "questionImageUrl": null,
      "questionText": "肺泡與微血管之間進行何種作用？",
      "aiSummary": "這題重點是肺泡的功能。肺泡和微血管之間進行的是氣體交換，不是消化作用。",
      "starred": true,
      "starredAt": "2026-05-03T20:00:00+08:00",
      "createdAt": "2026-05-03T14:30:00+08:00"
    }
  ]
}
```

### 錯題切換星號

`PATCH /api/mistakes/:mistakeId/star`

加星號的置頂顯示

Request:

```json
{
  "starred": true
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "mistake_record_001",
    "starred": true,
    "starredAt": "2026-05-03T20:00:00+08:00"
  }
}
```

### 單一錯題詳細「內容」

`GET /api/mistakes/:mistakeId`

Response:

```json
{
  "success": true,
  "data": {
    "id": "mistake_record_001",
    "sourceSessionId": "chat_001",
    "questionGroupId": "qg_001",
    "subjectId": "subject_bio",
    "unitId": "unit_bio_02",
    "conceptId": "concept_bio_003",
    "questionText": "肺泡與微血管之間進行何種作用？",
    "studentAnswer": null,
    "correctAnswer": "氣體交換",
    "aiSummary": "這題重點是肺泡的功能。肺泡和微血管之間進行的是氣體交換，不是消化作用。",
    "fullExplanation": "肺泡周圍有大量微血管，氧氣會由肺泡進入血液，二氧化碳則由血液進入肺泡，最後排出體外。這整個過程稱為氣體交換。"
  }
}
```
### 知識點筆記

### 知識點筆記「列表」

`GET /api/students/:studentId/concept-notes`

列表頁直接顯示標題與展開內容（就是超大大抄的感覺）。但點開單一筆記時，再透過詳細API查看來源錯題與來源相似題（點開的部分定義在功能10-2）

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "note_001",
      "studentId": "student_001",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "noteTitle": "氣體交換重點",
      "noteContent": "肺泡是進行氣體交換的主要場所，氧氣進入血液，二氧化碳離開血液進入肺泡。",
      "sourceSessionId": "chat_001",
      "questionGroupId": "qg_001",
      "starred": false,
      "starredAt": null,
      "createdAt": "2026-05-03T09:02:10+08:00"
    }
  ]
}
```

### 知識點筆記切換星號

`PATCH /api/concept-notes/:noteId/star`

一樣可以加星號喔

Request:

```json
{
  "starred": true
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "note_001",
    "starred": true,
    "starredAt": "2026-05-03T20:05:00+08:00"
  }
}
```

### 單一知識點筆記詳細「內容」

`GET /api/concept-notes/:noteId`

點開某一則知識點筆記時，查看它對應的錯題與生成相似題來源

Response:

```json
{
  "success": true,
  "data": {
    "id": "note_001",
    "studentId": "student_001",
    "subjectId": "subject_bio",
    "unitId": "unit_bio_02",
    "conceptId": "concept_bio_003",
    "noteTitle": "氣體交換重點",
    "noteContent": "肺泡是進行氣體交換的主要場所，氧氣進入血液，二氧化碳離開血液進入肺泡。",
    "sourceSessionId": "chat_001",
    "questionGroupId": "qg_001",
    "starred": true,
    "starredAt": "2026-05-03T20:05:00+08:00",
    "linkedMistakes": [
      {
        "id": "mistake_record_001",
        "questionText": "肺泡與微血管之間進行何種作用？"
      }
    ],
    "linkedPracticeQuestions": [
      {
        "id": "practice_001",
        "title": "登山時的呼吸變化"
      }
    ],
    "createdAt": "2026-05-03T09:02:10+08:00"
  }
}
```

### 生成相似題

### AI 生成素養題

`POST /api/ai/practice-question`

根據某一筆錯題或某一個題目群組生成一題素養題，前端只需要告訴後端要針對哪一題生成

Request:

```json
{
  "studentId": "student_001",
  "sourceMistakeId": "mistake_record_001"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "practiceId": "practice_001",
    "questionStyle": "literacy",
    "title": "登山時的呼吸變化",
    "passage": "小明和家人去爬山，走到半山腰時發現自己呼吸變快，爸爸說這是因為身體需要更多氧氣來維持活動。此時肺部中的肺泡會和周圍微血管進行作用，讓氧氣進入血液。",
    "questionText": "根據上文，肺泡在這段情境中最主要的功能是什麼？",
    "options": ["過濾空氣中的灰塵", "幫助食物消化", "進行氣體交換", "製造血液"],
    "answer": "進行氣體交換",
    "explanation": "題幹描述的是氧氣進入血液的過程，肺泡最主要功能是進行氣體交換。"
  }
}
```

### 生成相似題「列表」

`GET /api/students/:studentId/practice-questions`

老樣子，列表

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "practice_001",
      "studentId": "student_001",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "questionStyle": "literacy",
      "title": "登山時的呼吸變化",
      "passage": "小明和家人去爬山，走到半山腰時發現自己呼吸變快......",
      "questionText": "根據上文，肺泡在這段情境中最主要的功能是什麼？",
      "starred": true,
      "starredAt": "2026-05-03T20:10:00+08:00",
      "createdAt": "2026-05-03T09:04:10+08:00"
    }
  ]
}
```

### 生成相似題切換星號

`PATCH /api/practice-questions/:practiceId/star`

Request:

```json
{
  "starred": true
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "practice_001",
    "starred": true,
    "starredAt": "2026-05-03T20:10:00+08:00"
  }
}
```

## 5. 我的最愛

### 星號與排序規則

- 錯題紀錄、知識點筆記、生成相似題都可加星號
- 每筆資料可有 `starred` 與 `starredAt`
- 這三種列表都固定先顯示 `starred = true`
- 星號資料內部再依 `createdAt` 由新到舊排序
- 除了原本各自的列表頁之外，另外再獨立提供一個「我的最愛」入口
- 「我的最愛」底下再分成 `mistakes`、`concept-notes`、`practice-questions`
- 「我的最愛」只顯示 `starred = true` 的資料

### 我的最愛分類首頁

`GET /api/students/:studentId/favorites`

進入「我的最愛」後，先看到三個分類：相似題、錯題、知識點筆記

Response:

```json
{
  "success": true,
  "data": {
    "mistakes": 3,
    "conceptNotes": 2,
    "practiceQuestions": 4
  }
}
```

### 我的最愛：「錯題列表」

`GET /api/students/:studentId/favorites/mistakes`

只顯示有加星號的錯題

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "mistake_record_001",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "questionText": "肺泡與微血管之間進行何種作用？",
      "aiSummary": "這題重點是肺泡的功能。肺泡和微血管之間進行的是氣體交換，不是消化作用。",
      "starred": true,
      "starredAt": "2026-05-03T20:00:00+08:00",
      "createdAt": "2026-05-03T14:30:00+08:00"
    }
  ]
}
```

### 我的最愛：「知識點筆記列表」

`GET /api/students/:studentId/favorites/concept-notes`

只顯示有加星號的知識點筆記

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "note_001",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "noteTitle": "氣體交換重點",
      "noteContent": "肺泡是進行氣體交換的主要場所，氧氣進入血液，二氧化碳離開血液進入肺泡。",
      "starred": true,
      "starredAt": "2026-05-03T20:05:00+08:00",
      "createdAt": "2026-05-03T09:02:10+08:00"
    }
  ]
}
```

### 我的最愛：「生成相似題列表」

`GET /api/students/:studentId/favorites/practice-questions`

只顯示有加星號的生成相似題

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "practice_001",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "conceptId": "concept_bio_003",
      "questionStyle": "literacy",
      "title": "登山時的呼吸變化",
      "questionText": "根據上文，肺泡在這段情境中最主要的功能是什麼？",
      "starred": true,
      "starredAt": "2026-05-03T20:10:00+08:00",
      "createdAt": "2026-05-03T09:04:10+08:00"
    }
  ]
}
```

## 6. 學生個人資料

### 學生列表

`GET /api/students`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "student_001",
      "name": "王小明",
      "grade": "8"
    }
  ]
}
```

## 7. 學生端分析

### 分析期間規則

- 學生端分析、老師端分析都要能選擇統計期間`range`
- 可先支援：`7d`、`30d`、`custom`
- 若 `range = custom`，則另外傳 `from` 與 `to`
- 排名前幾名統一用 `limit`

### 學生端學習分析摘要

`GET /api/students/:studentId/analytics/summary?range=30d&limit=5`

學生查看自己的整體學習摘要，並選擇統計期間。`limit` 用來控制「前幾常錯的知識點」

Response:

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "totalMistakes": 12,
    "starredMistakes": 4,
    "starredNotes": 2,
    "starredPracticeQuestions": 3,
    "topWeakConcepts": [
      {
        "conceptId": "concept_bio_003",
        "conceptName": "氣體交換",
        "mistakeCount": 3,
        "rank": 1
      }
    ],
    "conceptDistribution": [
      { "conceptName": "氣體交換", "count": 3 },
      { "conceptName": "血液循環方向", "count": 2 }
    ],
    "unitDistribution": [
      { "unitName": "單元二 呼吸作用", "count": 4 },
      { "unitName": "單元一 人體的運輸與防禦", "count": 2 }
    ]
  }
}
```

### 學生端學習分析圖表

`GET /api/students/:studentId/analytics/charts?range=30d`

查看自己在指定期間內的圖表資料

Response:

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "mistakeTrend": [
      { "date": "2026-05-01", "count": 1 },
      { "date": "2026-05-03", "count": 2 }
    ],
    "conceptDistribution": [
      { "conceptName": "氣體交換", "count": 3 },
      { "conceptName": "血液循環方向", "count": 2 }
    ],
    "unitDistribution": [
      { "unitName": "單元二 呼吸作用", "count": 4 },
      { "unitName": "單元一 人體的運輸與防禦", "count": 2 }
    ]
  }
}
```

## 8. 老師端分析

### 全班每週常錯觀念統計

`GET /api/dashboard/summary?range=30d&limit=5`

老師查看全班在指定期間內整體較常錯的幾個觀念，並依錯誤次數排序

Response:

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "weeklyMistakeCount": 12,
    "studentCount": 3,
    "topWeakConcepts": [
      {
        "conceptId": "concept_bio_003",
        "conceptName": "氣體交換",
        "mistakeCount": 4,
        "rank": 1
      },
      {
        "conceptId": "concept_bio_001",
        "conceptName": "血液循環方向",
        "mistakeCount": 3,
        "rank": 2
      }
    ]
  }
}
```

### 單一學生常錯觀念分析

`GET /api/dashboard/students/:studentId/concepts?range=30d&limit=5`

查看單一學生在指定期間內最常錯的幾個觀念，並依錯誤次數排序

Response:

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "topWeakConcepts": [
      {
        "conceptId": "concept_bio_003",
        "conceptName": "氣體交換",
        "mistakeCount": 3,
        "rank": 1
      },
      {
        "conceptId": "concept_bio_001",
        "conceptName": "血液循環方向",
        "mistakeCount": 2,
        "rank": 2
      }
    ],
    "conceptDistribution": [
      { "conceptId": "concept_bio_003", "conceptName": "氣體交換", "count": 3 },
      { "conceptId": "concept_bio_001", "conceptName": "血液循環方向", "count": 2 }
    ],
    "unitDistribution": [
      { "unitName": "單元二 呼吸作用", "count": 4 },
      { "unitName": "單元一 人體的運輸與防禦", "count": 2 }
    ]
  }
}
```

### 老師端單一學生分析圖表

`GET /api/dashboard/students/:studentId/charts?range=30d`

查看單一學生在指定期間內的圖表資料

Response:

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "mistakeTrend": [
      { "date": "2026-05-01", "count": 1 },
      { "date": "2026-05-03", "count": 2 }
    ],
    "conceptDistribution": [
      { "conceptId": "concept_bio_003", "conceptName": "氣體交換", "count": 3 },
      { "conceptId": "concept_bio_001", "conceptName": "血液循環方向", "count": 2 }
    ],
    "unitDistribution": [
      { "unitName": "單元二 呼吸作用", "count": 4 },
      { "unitName": "單元一 人體的運輸與防禦", "count": 2 }
    ]
  }
}
```
