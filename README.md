## 0. Backend 使用方式

後端程式位於 `backend/` 目錄，預設 API base URL 為 `http://localhost:3001/api`。完整 API 文件請見 [`backend/API.md`](backend/API.md)。

啟動方式：

```bash
cd backend
npm install
npm run db:init
npm run db:seed
npm start
```

如果 Windows PowerShell 擋住 `npm`，可以改用：

```powershell
npm.cmd run db:init
npm.cmd run db:seed
npm.cmd start
```

## 1. 共用規則

- request 是前端送給後端的格式；response 是後端回傳給前端的格式
- 先用 JSON API，全部回傳 UTF-8 JSON。
- Base URL：`/api`
- 成功：`{ "success": true, "data": ... }`
- 失敗：`{ "success": false, "error": { "code": "STRING", "message": "說明" } }`
- 時間格式統一用 ISO 8601，例如 `2026-05-03T14:30:00+08:00`

## 2. 分類方式定義

### 「非」歷史對話紀錄之排序與分類規則（如：知識點筆記、錯題等）

簡述流程： 科目 >> 單元 >> 子單元 >> 觀念標籤 >> 內容（先排星號，再依時間新到舊往下排）
- `subjectId`：學科本身，例如 `生物`、`數學`
- `unitId`：固定單元
- `subUnitId`：固定子單元，例如 `1-1`、`1-2`
- `conceptId`：AI 分類出的觀念
- AI 必須優先匹配既有 `concept`，只有真的沒有適合觀念時，才允許新建 `concept`
- 被分到對應 `concept`後，先排星號 `starred`，其餘沒星號用 `createdAt` 「由新到舊」排序

### 學生端與老師端的主分類規則

學生端在複習錯題、知識點筆記、生成考題時，主要是按「學習內容」找資料  
老師端在看班級統計與學生分析時，主要是按「課程班級」看資料

- 學生端內容主分類：`subjectId >> unitId >> subUnitId >> conceptId`
- 學生端輔助資訊：`classId`、`className`
- 老師端主分類：`classId`、`className`
- 老師端輔助資訊：`subjectId`、`subjectName`、`gradeYear`


### 科目與班級命名規則

`subject`是科目名稱，`class`是班級名稱，雖然都有學科名，但主要分類應該是按照`subject`。`class`只是輔助以及老師端分析。

- `subjectId`：代表學科本身，格式 `subject_<subject>`（例如 `subject_bio`）
- `subjectName`：直接顯示給使用者看的學科名稱（例如 `生物`）
- `classId`：代表老師端查看的課程班級，格式 `class_<grade>_<subject>_<index>`（例如 `class_hs2_bio_01`）
- `className`：直接顯示給老師看的班級名稱，由「年級＋學科名＋班」（例如 `高二生物班`）


### 分類的觀念標籤（分類方式）

`GET /api/concepts?subjectId=subject_bio&unitId=unit_bio_02&subUnitId=subunit_bio_02_02`

是指「科目>>單元>>子單元>>觀念標題」這部分分類方式的「觀念標籤」的部分。

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "concept_bio_002",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "subUnitId": "subunit_bio_02_01",
      "name": "呼吸系統",
      "keywords": ["鼻腔", "氣管", "支氣管", "肺"],
      "createdBy": "seed"
    },
    {
      "id": "concept_bio_003",
      "subjectId": "subject_bio",
      "unitId": "unit_bio_02",
      "subUnitId": "subunit_bio_02_02",
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
  "subUnitId": "subunit_bio_03_02",
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
  "subUnitId": "subunit_bio_02_02",
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

在既有聊天容器 `session` 中新增訊息，這則訊息可以是新題目或追問

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
## 4-1. 歷史對話功能
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
      "subUnitId": "subunit_bio_03_02",
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

## 4-2. 紀錄錯題

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
    "subUnitId": "subunit_bio_02_02",
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
      "subUnitId": "subunit_bio_02_02",
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
    "subUnitId": "subunit_bio_02_02",
    "conceptId": "concept_bio_003",
    "questionText": "肺泡與微血管之間進行何種作用？",
    "studentAnswer": null,
    "correctAnswer": "氣體交換",
    "aiSummary": "這題重點是肺泡的功能。肺泡和微血管之間進行的是氣體交換，不是消化作用。",
    "fullExplanation": "肺泡周圍有大量微血管，氧氣會由肺泡進入血液，二氧化碳則由血液進入肺泡，最後排出體外。這整個過程稱為氣體交換。"
  }
}
```

## 4-3. 知識點筆記

### 知識點筆記「列表」

`GET /api/students/:studentId/concept-notes`

列表頁直接顯示標題與展開內容（就是超大大抄的感覺）。但點開單一筆記時，再透過詳細API查看來源錯題與來源相似題

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
      "subUnitId": "subunit_bio_02_02",
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

點開某一則知識點筆記時，查看它對應的錯題來源

Response:

```json
{
  "success": true,
  "data": {
    "id": "note_001",
    "studentId": "student_001",
    "subjectId": "subject_bio",
    "unitId": "unit_bio_02",
    "subUnitId": "subunit_bio_02_02",
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
    "createdAt": "2026-05-03T09:02:10+08:00"
  }
}
```


## 4-4. 生成考題

### 建立生成考題條件選單

`GET /api/students/:studentId/exam-generator/options?subjectId=subject_bio&unitId=unit_bio_02&subUnitId=subunit_bio_02_02&conceptId=concept_bio_003`

使用者點進「生成考題」後，先看到可以選擇的科目、單元、子單元、觀念標籤與錯題。錯題可複選，系統會依照目前篩選條件回傳可用的錯題清單。

Response:

```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "subjectId": "subject_bio",
        "subjectName": "生物",
        "classId": "class_hs2_bio_01",
        "className": "高二生物班"
      }
    ],
    "units": [
      {
        "id": "unit_bio_02",
        "subjectId": "subject_bio",
        "name": "單元二 呼吸作用"
      }
    ],
    "subUnits": [
      {
        "id": "subunit_bio_02_02",
        "unitId": "unit_bio_02",
        "code": "2-2",
        "name": "肺泡與氣體交換"
      }
    ],
    "concepts": [
      {
        "id": "concept_bio_003",
        "unitId": "unit_bio_02",
        "subUnitId": "subunit_bio_02_02",
        "name": "氣體交換"
      }
    ],
    "mistakes": [
      {
        "id": "mistake_record_001",
        "questionText": "肺泡與微血管之間進行何種作用？",
        "subjectId": "subject_bio",
        "unitId": "unit_bio_02",
        "subUnitId": "subunit_bio_02_02",
        "conceptId": "concept_bio_003"
      },
      {
        "id": "mistake_record_004",
        "questionText": "氧氣進入血液主要發生在哪裡？",
        "subjectId": "subject_bio",
        "unitId": "unit_bio_02",
        "subUnitId": "subunit_bio_02_02",
        "conceptId": "concept_bio_003"
      }
    ],
    "difficultyOptions": ["easy", "medium", "hard"],
    "questionTypeOptions": ["multiple_choice", "short_answer"]
  }
}
```

### 生成考題

`POST /api/exams/generate`

使用者可自行選擇這次要用哪些「之前的錯題」來生成考題。錯題可複選，系統會以這些錯題的範圍與相關知識生成新題目。使用者還可以指定題數、難度與題型。

Request:

```json
{
  "studentId": "student_001",
  "subjectId": "subject_bio",
  "unitId": "unit_bio_02",
  "subUnitId": "subunit_bio_02_02",
  "conceptId": "concept_bio_003",
  "selectedMistakeIds": ["mistake_record_001", "mistake_record_004"],
  "questionCount": 3,
  "difficulty": "medium",
  "questionType": "multiple_choice"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "examId": "exam_001",
    "studentId": "student_001",
    "subjectId": "subject_bio",
    "unitId": "unit_bio_02",
    "subUnitId": "subunit_bio_02_02",
    "conceptId": "concept_bio_003",
    "selectedMistakeIds": ["mistake_record_001", "mistake_record_004"],
    "questionCount": 3,
    "difficulty": "medium",
    "questionType": "multiple_choice",
    "questions": [
      {
        "id": "exam_question_001",
        "questionType": "multiple_choice",
        "questionText": "根據題意，肺泡最主要的功能是下列哪一項？",
        "options": ["過濾空氣", "進行氣體交換", "儲存養分", "控制心跳"]
      }
    ],
    "createdAt": "2026-05-08T14:30:00+08:00"
  }
}
```

### 送出考題答案

`POST /api/exams/:examId/submissions`

作答後，不論答對或答錯，都要回傳正解與詳解。

Request:

```json
{
  "answers": [
    {
      "questionId": "exam_question_001",
      "answer": "過濾空氣"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "examId": "exam_001",
    "results": [
      {
        "questionId": "exam_question_001",
        "isCorrect": false,
        "correctAnswer": "進行氣體交換",
        "explanation": "肺泡的主要功能是進行氣體交換，不是過濾空氣。",
        "canSaveToMistakes": true
      }
    ],
    "submittedAt": "2026-05-08T14:45:00+08:00"
  }
}
```

### 將考題加入錯題列表

`POST /api/exams/:examId/questions/:questionId/save-to-mistakes`

使用者在看完正解與詳解後，可手動把某一題丟到錯題列表中儲存。

Request:

```json
{
  "studentId": "student_001",
  "starred": false
}
```

Response:

```json
{
  "success": true,
  "data": {
    "mistakeId": "mistake_record_010",
    "sourceExamId": "exam_001",
    "sourceQuestionId": "exam_question_001",
    "createdAt": "2026-05-08T14:46:00+08:00"
  }
}
```

## 5. 我的最愛

### 星號與排序規則

- 錯題紀錄、知識點筆記可加星號
- 每筆資料可有 `starred` 與 `starredAt`
- 這兩種列表都固定先顯示 `starred = true`
- 星號資料內部再依 `createdAt` 由新到舊排序
- 除了原本各自的列表頁之外，另外再獨立提供一個「我的最愛」入口
- 「我的最愛」底下再分成 `mistakes`、`concept-notes`
- 「我的最愛」只顯示 `starred = true` 的資料

### 我的最愛分類首頁

`GET /api/students/:studentId/favorites`

進入「我的最愛」後，先看到兩個分類：錯題、知識點筆記

Response:

```json
{
  "success": true,
  "data": {
    "mistakes": 3,
    "conceptNotes": 2
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
      "subUnitId": "subunit_bio_02_02",
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
      "subUnitId": "subunit_bio_02_02",
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

## 6. 學生個人資料

### 學生列表

`GET /api/students`

學生資料需包含 `gradeYear`、`email`、`phone` 與 `subjects`。同一個學生可以同時修多個學科，而老師端看到的 `class` 則是實際課程班級，例如 `高二數學班`、`高三生物班`。為了讓學生修課和老師端班級直接聯動，`subjects` 內同時帶 `subjectId / subjectName / classId / className`。

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "student_001",
      "name": "王小明",
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
    }
  ]
}
```

## 7. 學生端分析

### 分析期間規則

- 要能選擇統計期間`range`，有`7d`、`30d`、`custom`
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
    "generatedExamCount": 3,
    "generatedExamAccuracy": {
      "correctCount": 8,
      "totalAnswered": 10,
      "accuracyRate": 0.8
    },
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
    "generatedExamAccuracyTrend": [
      { "date": "2026-05-01", "accuracyRate": 0.5 },
      { "date": "2026-05-03", "accuracyRate": 1.0 }
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

### 班級範圍與排序規則

- 老師登入畫面可先選擇要查看的 `classId`，`className`用「年級 + 科目 + 班」表示（例如 `高二數學班`）
- 一旦進入系統後，老師端看到的學生列表、統計、分析都以該班級為範圍
- 全班學生列表可依兩種方式排序：
  - 錯題數 `sortBy=mistakeCount`
  - 不熟悉知識點數 `sortBy=weakConceptCount`

### 分析期間規則

- 要能選擇統計期間`range`，有`7d`、`30d`、`custom`
- 若 `range = custom`，則另外傳 `from` 與 `to`

### 老師可查看班級列表

`GET /api/teacher/classes`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "class_hs2_math_01",
      "name": "高二數學班"
    },
    {
      "id": "class_hs3_bio_01",
      "name": "高三生物班"
    }
  ]
}
```

### 全班學生列表

`GET /api/dashboard/students?classId=class_hs2_math_01&range=30d&sortBy=mistakeCount`

查看某個班級底下的學生，並依錯題數或出錯知識點數排序。

Response:

```json
{
  "success": true,
  "data": [
    {
      "studentId": "student_001",
      "name": "王哈哈",
      "gradeYear": "高二",
      "className": "高二數學班",
      "mistakeCount": 12,
      "weakConceptCount": 4,
      "generatedExamAccuracyRate": 0.8
    },
    {
      "studentId": "student_002",
      "name": "林沃沃",
      "gradeYear": "高二",
      "className": "高二數學班",
      "mistakeCount": 9,
      "weakConceptCount": 3,
      "generatedExamAccuracyRate": 0.67
    }
  ]
}
```

### 全班常錯觀念統計

`GET /api/dashboard/summary?classId=class_hs2_math_01&range=30d&limit=5`

老師查看全班在指定期間內整體較常錯的幾個觀念，並依錯誤次數排序

Response:

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "weeklyMistakeCount": 12,
    "studentCount": 3,
    "generatedExamAccuracy": {
      "correctCount": 16,
      "totalAnswered": 22,
      "accuracyRate": 0.73
    },
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

`GET /api/dashboard/students/:studentId/concepts?classId=class_hs2_math_01&range=30d&limit=5`

查看單一學生在指定期間內最常錯的幾個觀念，並依錯誤次數排序

Response:

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "generatedExamAccuracy": {
      "correctCount": 8,
      "totalAnswered": 10,
      "accuracyRate": 0.8
    },
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

`GET /api/dashboard/students/:studentId/charts?classId=class_hs2_math_01&range=30d`

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
    "generatedExamAccuracyTrend": [
      { "date": "2026-05-01", "accuracyRate": 0.5 },
      { "date": "2026-05-03", "accuracyRate": 1.0 }
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
