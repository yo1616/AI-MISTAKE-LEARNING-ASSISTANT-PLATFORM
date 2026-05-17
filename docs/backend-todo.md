# Backend TODO

本文件提供 Codex 與組員實作順序參考。請每次只做一個 phase，完成後測試並 commit。

## Phase 0: Repo 檢查

- [ ] 閱讀 `README.md`
- [ ] 閱讀 `demoData/demoData1`
- [ ] 閱讀 `docs/database-design.md`
- [ ] 確認 backend 目前檔案狀態
- [ ] 確認是否已有 `package.json`
- [ ] 確認要使用的 backend 技術

## Phase 1: Backend 基礎架構

- [ ] 建立 backend 的 Node.js/Express 基本架構
- [ ] 建立 `backend/server.js` 或 `backend/src/server.js`
- [ ] 建立 routes/controllers/services/data access 分層
- [ ] 建立統一 response helper：success/error
- [ ] 建立基本錯誤處理 middleware
- [ ] 提供 `npm start`

## Phase 2: Database Schema

- [ ] 建立 SQLite 資料庫設定
- [ ] 建立 schema SQL 或 migration script
- [ ] 建立以下核心資料表：
  - [ ] users
  - [ ] teachers
  - [ ] students
  - [ ] subjects
  - [ ] classes
  - [ ] student_classes
  - [ ] units
  - [ ] concepts
  - [ ] chat_sessions
  - [ ] question_groups
  - [ ] chat_messages
  - [ ] message_images
  - [ ] mistake_records
  - [ ] concept_notes
  - [ ] concept_note_mistakes
  - [ ] generated_exams
  - [ ] generated_exam_selected_mistakes
  - [ ] generated_exam_questions
  - [ ] exam_submissions
  - [ ] exam_answers
- [ ] 提供 `npm run db:init`

## Phase 3: Seed Demo Data

- [ ] 讀取 `demoData/demoData1`
- [ ] 將 students 匯入 students / student_classes
- [ ] 將 subjects 匯入 subjects
- [ ] 將 classes 匯入 classes
- [ ] 將 units 匯入 units
- [ ] 將 concepts 匯入 concepts
- [ ] 將 chatSessions 匯入 chat_sessions
- [ ] 將 messages 匯入 chat_messages / question_groups
- [ ] 將 mistakeRecords 匯入 mistake_records
- [ ] 將 conceptNotes 匯入 concept_notes / concept_note_mistakes
- [ ] 將 generated exams/submissions 相關資料匯入對應表
- [ ] 提供 `npm run db:seed`
- [ ] 提供簡單檢查指令或 API 確認資料匯入成功

## Phase 4: 基礎資料 API

- [ ] `GET /api/students`
- [ ] `GET /api/subjects`
- [ ] `GET /api/units?subjectId=...`
- [ ] `GET /api/concepts?subjectId=...&unitId=...`
- [ ] `GET /api/teacher/classes`

## Phase 5: Chat API

- [ ] `GET /api/students/:studentId/chat-sessions?sort=updatedAt_desc`
- [ ] `GET /api/chat-sessions/:sessionId/messages`
- [ ] `POST /api/chat-sessions`
- [ ] `POST /api/chat-sessions/:sessionId/messages`
- [ ] mock AI concept classification
- [ ] mock assistant answer
- [ ] 正確建立或更新 question_group_count、updated_at

## Phase 6: Mistakes / Notes / Favorites API

- [ ] `GET /api/students/:studentId/mistake-records`
- [ ] `GET /api/mistake-records/:mistakeRecordId`
- [ ] `PATCH /api/mistake-records/:mistakeRecordId/star`
- [ ] `GET /api/students/:studentId/concept-notes`
- [ ] `PATCH /api/concept-notes/:noteId/star`
- [ ] `GET /api/students/:studentId/favorites`
- [ ] `GET /api/students/:studentId/favorites/mistakes`
- [ ] `GET /api/students/:studentId/favorites/concept-notes`

## Phase 7: Generated Exam API

- [ ] `POST /api/exams/generate`
- [ ] mock 生成題目
- [ ] 儲存 generated_exam
- [ ] 儲存 selected mistakes
- [ ] 儲存 generated_exam_questions
- [ ] `POST /api/exams/:examId/submissions`
- [ ] 儲存 submission 與 answers
- [ ] 回傳正解、詳解、canSaveToMistakes
- [ ] `POST /api/exams/:examId/questions/:questionId/save-to-mistakes`

## Phase 8: Analytics API

- [ ] `GET /api/students/:studentId/analytics/summary?range=30d&limit=5`
- [ ] `GET /api/students/:studentId/analytics/charts?range=30d`
- [ ] `GET /api/dashboard/students?classId=...&range=30d&sortBy=mistakeCount`
- [ ] `GET /api/dashboard/summary?classId=...&range=30d&limit=5`
- [ ] `GET /api/dashboard/students/:studentId/concepts?classId=...&range=30d&limit=5`

## Phase 9: 測試與整理

- [ ] `npm install` 成功
- [ ] `npm run db:init` 成功
- [ ] `npm run db:seed` 成功
- [ ] `npm start` 成功
- [ ] 用瀏覽器/Postman 測試主要 GET API
- [ ] 用 Postman 測試主要 POST/PATCH API
- [ ] 更新 README 的 backend 啟動方式
