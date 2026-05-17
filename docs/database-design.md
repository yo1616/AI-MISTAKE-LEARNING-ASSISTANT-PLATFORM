# 補習班個別化學習支援系統 - 資料庫與資料模型規格

本文件是根據目前 repo 的 `README.md`、`demoData/demoData1`，以及 ER 圖討論結果整理出的 backend/database 實作依據。

## 0. 實作優先順序

1. 以 `README.md` 的 API 規格與資料命名為最高優先。
2. 以 `demoData/demoData1` 的資料格式作為 seed data 與 MVP 測試依據。
3. 本文件用來補足資料庫 schema、PK/FK、關係與實作方向。
4. 目前先完成可執行、可測試的 MVP，不需要先串真正 AI API。
5. AI 回覆、觀念分類、生成考題可以先用 mock function。

## 1. 共用 API 規則

- Base URL: `/api`
- Response 成功格式：`{ "success": true, "data": ... }`
- Response 失敗格式：`{ "success": false, "error": { "code": "STRING", "message": "說明" } }`
- 時間格式使用 ISO 8601。
- JSON API 全部回傳 UTF-8 JSON。
- 前端欄位命名以 README 中的 camelCase 為主，例如 `studentId`, `subjectId`, `createdAt`。
- 資料庫欄位可以使用 snake_case，但 API 層需轉換成 README 規格的 camelCase。

## 2. 核心分類規則

學生端內容主分類：

```text
subjectId >> unitId >> conceptId
```

老師端分析主分類：

```text
classId / className
```

補充規則：

- `subject` 是科目本身，例如生物、數學、物理。
- `class` 是老師端課程班級，例如高二生物班、高三數學班。
- 學生端查錯題、知識點筆記、生成考題時，主要依 `subjectId >> unitId >> conceptId`。
- 老師端看班級統計與學生分析時，主要依 `classId`。
- `classId`、`className` 在學生端是輔助資訊。
- `subjectId`、`subjectName`、`gradeYear` 在老師端是輔助資訊。
- AI 必須優先匹配既有 `concept`，只有真的沒有適合觀念時，才允許新建 `concept`。

## 3. 命名規則

### Subject

- `subjectId` 格式：`subject_<subject>`
- 範例：`subject_bio`, `subject_math`, `subject_phys`
- `subjectName` 範例：`生物`, `數學`, `物理`

### Class

- `classId` 格式：`class_<grade>_<subject>_<index>`
- 範例：`class_hs2_bio_01`
- `className` 顯示格式：`年級 + 科目 + 班`
- 範例：`高二生物班`

### Unit

- `unitId` 格式：`unit_<subject>_<index>`
- 範例：`unit_bio_02`

### Concept

- `conceptId` 格式：`concept_<subject>_<index>`
- 範例：`concept_bio_003`

## 4. 建議資料表與欄位

以下使用資料庫欄位命名表示。若實作 API，請轉換成 README 使用的 camelCase。

---

## 4.1 users

使用者帳號基底資料。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 使用者 id，可對應 teacher/student id |
| account | TEXT | UNIQUE | 登入帳號 |
| password_hash | TEXT |  | 密碼雜湊 |
| name | TEXT |  | 姓名 |
| email | TEXT | UNIQUE | email |
| role | TEXT |  | `student` 或 `teacher` |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |
| last_login_at | TEXT |  | 最後登入時間，可為 NULL |

---

## 4.2 teachers

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK, FK -> users.id | 老師 id |
| name | TEXT |  | 老師姓名 |
| email | TEXT |  | email |
| phone | TEXT |  | 電話 |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.3 students

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK, FK -> users.id | 學生 id |
| name | TEXT |  | 學生姓名 |
| grade_year | TEXT |  | 例如 `高二` |
| email | TEXT |  | email |
| phone | TEXT |  | 電話 |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.4 subjects

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `subject_bio` |
| name | TEXT |  | 例如 `生物` |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.5 classes

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `class_hs2_bio_01` |
| name | TEXT |  | 例如 `高二生物班` |
| grade_year | TEXT |  | 例如 `高二` |
| subject_id | TEXT | FK -> subjects.id | 班級所屬科目 |
| teacher_id | TEXT | FK -> teachers.id | 授課老師，可為 NULL |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.6 student_classes

學生與班級為多對多關係。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| student_id | TEXT | PK, FK -> students.id | 學生 |
| class_id | TEXT | PK, FK -> classes.id | 班級 |
| subject_id | TEXT | FK -> subjects.id | 冗餘輔助查詢，可由 class 推得 |
| joined_at | TEXT |  | 加入時間 |
| status | TEXT |  | `active`, `inactive` |

---

## 4.7 units

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `unit_bio_02` |
| subject_id | TEXT | FK -> subjects.id | 所屬科目 |
| name | TEXT |  | 單元名稱 |
| unit_order | INTEGER |  | 顯示順序 |
| is_fixed | INTEGER/BOOLEAN |  | 是否為固定單元 |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.8 concepts

觀念標籤，也就是原 ER 圖中的知識點。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `concept_bio_003` |
| subject_id | TEXT | FK -> subjects.id | 所屬科目 |
| unit_id | TEXT | FK -> units.id | 所屬單元 |
| name | TEXT |  | 觀念名稱 |
| keywords | TEXT/JSON |  | 關鍵字陣列，可用 JSON 字串存 |
| status | TEXT |  | `active`, `inactive` |
| created_by | TEXT |  | `seed`, `ai`, `teacher`, `admin` |
| source_session_id | TEXT | FK -> chat_sessions.id | AI 新增觀念時的來源，可為 NULL |
| creation_reason | TEXT |  | AI 新增觀念原因，可為 NULL |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.9 concept_applications（延伸設計，可先不實作）

目前 README 尚未定義，但 ER 討論中希望更細分同一觀念的應用方式。若 MVP 時間不足，可先不做。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 應用 id |
| concept_id | TEXT | FK -> concepts.id | 所屬觀念 |
| name | TEXT |  | 應用名稱 |
| description | TEXT |  | 應用說明 |
| question_style | TEXT |  | 題型或情境 |
| common_error_pattern | TEXT |  | 常見錯誤型態 |
| created_by | TEXT |  | 建立來源 |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.10 chat_sessions

歷史對話列表中的對話容器。注意：一個 session 不代表只有一題。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `chat_001` |
| student_id | TEXT | FK -> students.id | 學生 |
| subject_id | TEXT | FK -> subjects.id | 科目 |
| class_id | TEXT | FK -> classes.id | 班級 |
| unit_id | TEXT | FK -> units.id | 初始單元 |
| title | TEXT |  | 對話標題 |
| input_type | TEXT |  | `text`, `photo`, `photo_text` |
| question_group_count | INTEGER |  | 題目群組數量 |
| started_at | TEXT |  | 開始時間 |
| updated_at | TEXT |  | 更新時間 |

排序規則：

- chat session 列表依 `updated_at` 新到舊。
- 單一 session 內 messages 依 `created_at` 舊到新。

---

## 4.11 question_groups

真正切分同一個 ChatSession 裡不同題目的單位。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `qg_001` |
| session_id | TEXT | FK -> chat_sessions.id | 所屬對話 |
| subject_id | TEXT | FK -> subjects.id | 科目 |
| unit_id | TEXT | FK -> units.id | 單元 |
| concept_id | TEXT | FK -> concepts.id | 分類出的觀念 |
| input_type | TEXT |  | `text`, `photo`, `photo_text` |
| question_text | TEXT |  | 題目文字，可為 NULL |
| question_image_url | TEXT |  | 題目圖片，可為 NULL |
| classification_confidence | REAL |  | 分類信心程度 |
| is_new_concept | INTEGER/BOOLEAN |  | 是否為 AI 新增觀念 |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.12 chat_messages

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 訊息 id |
| session_id | TEXT | FK -> chat_sessions.id | 所屬對話 |
| question_group_id | TEXT | FK -> question_groups.id | 所屬題目群組 |
| role | TEXT |  | `student`, `assistant` |
| message_type | TEXT |  | `new_question`, `follow_up`, `request_practice`, `answer`, `classification_explanation` |
| input_type | TEXT |  | `text`, `photo`, `photo_text` |
| content | TEXT |  | 訊息內容 |
| question_text | TEXT |  | 題目文字，可為 NULL |
| question_image_url | TEXT |  | 題目圖片，可為 NULL |
| created_at | TEXT |  | 建立時間 |

---

## 4.13 message_images

若一則訊息未來需要支援多張圖片，使用此表；若 MVP 只支援單圖，也可先使用 chat_messages.question_image_url。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 圖片 id |
| message_id | TEXT | FK -> chat_messages.id | 所屬訊息 |
| image_url | TEXT |  | 圖片位置 |
| file_name | TEXT |  | 檔名 |
| file_type | TEXT |  | MIME type |
| uploaded_at | TEXT |  | 上傳時間 |

---

## 4.14 mistake_records

錯題紀錄。依目前 README 與 demoData，錯題本身與學生個人錯題紀錄先合併在同一張表。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `mistake_record_001` |
| student_id | TEXT | FK -> students.id | 學生 |
| source_session_id | TEXT | FK -> chat_sessions.id | 來源對話，可為 NULL |
| source_exam_id | TEXT | FK -> generated_exams.id | 來源生成考題，可為 NULL |
| source_question_id | TEXT | FK -> generated_exam_questions.id | 來源生成題目，可為 NULL |
| question_group_id | TEXT | FK -> question_groups.id | 來源題目群組，可為 NULL |
| subject_id | TEXT | FK -> subjects.id | 科目 |
| class_id | TEXT | FK -> classes.id | 班級 |
| unit_id | TEXT | FK -> units.id | 單元 |
| concept_id | TEXT | FK -> concepts.id | 觀念 |
| input_type | TEXT |  | `text`, `photo`, `photo_text` |
| question_image_url | TEXT |  | 題目圖片 |
| question_text | TEXT |  | 題目文字 |
| student_question | TEXT |  | 學生當初問法 |
| student_answer | TEXT |  | 學生答案，可為 NULL |
| correct_answer | TEXT |  | 正確答案 |
| ai_summary | TEXT |  | 摘要 |
| full_explanation | TEXT |  | 詳解 |
| classification_confidence | REAL |  | 分類信心程度 |
| is_new_concept | INTEGER/BOOLEAN |  | 是否產生新 concept |
| starred | INTEGER/BOOLEAN |  | 是否加星號 |
| starred_at | TEXT |  | 加星號時間 |
| alert_triggered | INTEGER/BOOLEAN |  | 是否觸發提醒 |
| error_count | INTEGER |  | 錯誤次數 |
| review_status | TEXT |  | `not_reviewed`, `reviewing`, `mastered`, `need_help` |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

我的最愛不另外建立 favorite table，使用：

- `mistake_records.starred`
- `mistake_records.starred_at`
- `concept_notes.starred`
- `concept_notes.starred_at`

---

## 4.15 concept_notes

學生從錯題或對話整理出的知識點筆記。它不是分類用的 concept，而是學生個人的筆記。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `note_001` |
| student_id | TEXT | FK -> students.id | 學生 |
| source_session_id | TEXT | FK -> chat_sessions.id | 來源對話，可為 NULL |
| question_group_id | TEXT | FK -> question_groups.id | 來源題目群組，可為 NULL |
| subject_id | TEXT | FK -> subjects.id | 科目 |
| class_id | TEXT | FK -> classes.id | 班級 |
| unit_id | TEXT | FK -> units.id | 單元 |
| concept_id | TEXT | FK -> concepts.id | 觀念 |
| note_title | TEXT |  | 筆記標題 |
| note_content | TEXT |  | 筆記內容 |
| starred | INTEGER/BOOLEAN |  | 是否加星號 |
| starred_at | TEXT |  | 加星號時間 |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.16 concept_note_mistakes

ConceptNote 與 MistakeRecord 的多對多關聯。對應 demoData 的 linkedMistakes。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| note_id | TEXT | PK, FK -> concept_notes.id | 筆記 |
| mistake_record_id | TEXT | PK, FK -> mistake_records.id | 錯題紀錄 |

---

## 4.17 generated_exams

生成考題紀錄。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `exam_001` |
| student_id | TEXT | FK -> students.id | 學生 |
| subject_id | TEXT | FK -> subjects.id | 科目 |
| unit_id | TEXT | FK -> units.id | 單元 |
| concept_id | TEXT | FK -> concepts.id | 觀念 |
| class_id | TEXT | FK -> classes.id | 班級，可為 NULL |
| question_count | INTEGER |  | 題數 |
| difficulty | TEXT |  | `easy`, `medium`, `hard` |
| question_type | TEXT |  | `multiple_choice`, `short_answer` |
| created_at | TEXT |  | 建立時間 |
| updated_at | TEXT |  | 更新時間 |

---

## 4.18 generated_exam_selected_mistakes

生成考題時複選的錯題來源。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| exam_id | TEXT | PK, FK -> generated_exams.id | 生成考題 |
| mistake_record_id | TEXT | PK, FK -> mistake_records.id | 被選用的錯題 |

---

## 4.19 generated_exam_questions

生成考題中的單一題目。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 例如 `exam_question_001` |
| exam_id | TEXT | FK -> generated_exams.id | 所屬考題紀錄 |
| concept_id | TEXT | FK -> concepts.id | 對應觀念 |
| question_type | TEXT |  | `multiple_choice`, `short_answer` |
| question_text | TEXT |  | 題目文字 |
| options | TEXT/JSON |  | 選項，選擇題可用 JSON 字串 |
| correct_answer | TEXT |  | 正確答案 |
| explanation | TEXT |  | 詳解 |
| created_at | TEXT |  | 建立時間 |

---

## 4.20 exam_submissions

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 作答紀錄 id |
| exam_id | TEXT | FK -> generated_exams.id | 所屬考題 |
| student_id | TEXT | FK -> students.id | 學生 |
| submitted_at | TEXT |  | 送出時間 |

---

## 4.21 exam_answers

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 單題作答結果 id |
| submission_id | TEXT | FK -> exam_submissions.id | 作答紀錄 |
| exam_question_id | TEXT | FK -> generated_exam_questions.id | 題目 |
| student_answer | TEXT |  | 學生答案 |
| is_correct | INTEGER/BOOLEAN |  | 是否答對 |
| correct_answer | TEXT |  | 正確答案 |
| explanation | TEXT |  | 詳解 |
| can_save_to_mistakes | INTEGER/BOOLEAN |  | 是否可加入錯題 |
| created_at | TEXT |  | 建立時間 |

---

## 4.22 student_analytics（可作快取表）

此表可先不存，MVP 可以直接由 mistake_records、exam_answers 即時計算。若要做快取，可建立此表。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 分析 id |
| student_id | TEXT | FK -> students.id | 學生 |
| class_id | TEXT | FK -> classes.id | 班級 |
| range_type | TEXT |  | `7d`, `30d`, `custom` |
| from_date | TEXT |  | 起始日期 |
| to_date | TEXT |  | 結束日期 |
| total_mistakes | INTEGER |  | 錯題數 |
| starred_mistakes | INTEGER |  | 收藏錯題數 |
| starred_notes | INTEGER |  | 收藏筆記數 |
| generated_exam_count | INTEGER |  | 生成考題次數 |
| correct_count | INTEGER |  | 答對題數 |
| total_answered | INTEGER |  | 作答總題數 |
| accuracy_rate | REAL |  | 正確率 |
| concept_distribution | TEXT/JSON |  | 觀念分布 |
| unit_distribution | TEXT/JSON |  | 單元分布 |
| generated_at | TEXT |  | 產生時間 |

---

## 4.23 class_analytics（可作快取表）

此表可先不存，MVP 可以直接由 mistake_records、exam_answers、student_classes 即時計算。若要做快取，可建立此表。

| 欄位 | 類型建議 | PK/FK | 說明 |
|---|---|---|---|
| id | TEXT | PK | 分析 id |
| class_id | TEXT | FK -> classes.id | 班級 |
| range_type | TEXT |  | `7d`, `30d`, `custom` |
| from_date | TEXT |  | 起始日期 |
| to_date | TEXT |  | 結束日期 |
| weekly_mistake_count | INTEGER |  | 週錯題數 |
| student_count | INTEGER |  | 學生數 |
| correct_count | INTEGER |  | 答對題數 |
| total_answered | INTEGER |  | 作答總題數 |
| accuracy_rate | REAL |  | 正確率 |
| top_weak_concepts | TEXT/JSON |  | 常錯觀念排行 |
| generated_at | TEXT |  | 產生時間 |

## 5. 核心關係總整理

```text
users 1 -- 0..1 teachers
users 1 -- 0..1 students

teachers 1 -- N classes
subjects 1 -- N classes
students N -- N classes through student_classes

subjects 1 -- N units
units 1 -- N concepts
concepts 1 -- N concept_applications optional

students 1 -- N chat_sessions
chat_sessions 1 -- N question_groups
question_groups 1 -- N chat_messages
chat_messages 1 -- N message_images optional

students 1 -- N mistake_records
mistake_records N -- 1 subjects
mistake_records N -- 1 classes
mistake_records N -- 1 units
mistake_records N -- 1 concepts
mistake_records N -- 0..1 chat_sessions
mistake_records N -- 0..1 question_groups
mistake_records N -- 0..1 generated_exams
mistake_records N -- 0..1 generated_exam_questions

students 1 -- N concept_notes
concept_notes N -- 1 concepts
concept_notes N -- N mistake_records through concept_note_mistakes

generated_exams N -- N mistake_records through generated_exam_selected_mistakes
generated_exams 1 -- N generated_exam_questions
generated_exams 1 -- N exam_submissions
exam_submissions 1 -- N exam_answers
```

## 6. MVP 建議 API 範圍

請優先讓以下 API 可執行，回傳格式以 README 為準：

### 基礎資料

- `GET /api/students`
- `GET /api/subjects`
- `GET /api/units?subjectId=...`
- `GET /api/concepts?subjectId=...&unitId=...`
- `GET /api/teacher/classes`

### 對話

- `GET /api/students/:studentId/chat-sessions?sort=updatedAt_desc`
- `GET /api/chat-sessions/:sessionId/messages`
- `POST /api/chat-sessions`
- `POST /api/chat-sessions/:sessionId/messages`

### 錯題與筆記

- `GET /api/students/:studentId/mistake-records`
- `GET /api/mistake-records/:mistakeRecordId`
- `PATCH /api/mistake-records/:mistakeRecordId/star`
- `GET /api/students/:studentId/concept-notes`
- `PATCH /api/concept-notes/:noteId/star`

### 我的最愛

- `GET /api/students/:studentId/favorites`
- `GET /api/students/:studentId/favorites/mistakes`
- `GET /api/students/:studentId/favorites/concept-notes`

### 生成考題

- `POST /api/exams/generate`
- `POST /api/exams/:examId/submissions`
- `POST /api/exams/:examId/questions/:questionId/save-to-mistakes`

### 分析

- `GET /api/students/:studentId/analytics/summary?range=30d&limit=5`
- `GET /api/students/:studentId/analytics/charts?range=30d`
- `GET /api/dashboard/students?classId=...&range=30d&sortBy=mistakeCount`
- `GET /api/dashboard/summary?classId=...&range=30d&limit=5`
- `GET /api/dashboard/students/:studentId/concepts?classId=...&range=30d&limit=5`

## 7. 技術建議

若 repo 目前尚未有明確 backend 技術，MVP 建議：

- Node.js + Express
- SQLite 作為初期資料庫
- `better-sqlite3` 或 `sqlite3` 作為 SQLite 套件
- 使用 `npm run db:init` 建立資料表
- 使用 `npm run db:seed` 匯入 `demoData/demoData1`
- 使用 `npm start` 啟動 server

若組員已決定其他技術，請以組員決定為準。

## 8. 不要做的事

- 不要先串真正 AI API。
- 不要把 API 格式改到和 README 不一致。
- 不要另外新增 Favorite table，除非團隊後續決定要改設計。
- 不要把大量 demo data 寫死在 route 裡，應盡量放到 seed 或資料層。
- 不要提交 `.env`、API key、token、密碼。
