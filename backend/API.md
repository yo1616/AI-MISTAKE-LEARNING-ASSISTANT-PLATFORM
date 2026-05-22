# Backend API Documentation

## 1. Development Setup

進入 backend 專案、安裝套件、初始化資料庫、匯入 seed data，並啟動 server：

```bash
cd backend
npm install
npm run db:init
npm run db:seed
npm start
```

如果在 Windows PowerShell 執行 `npm` 時遇到 execution policy 限制，可以改用：

```powershell
npm.cmd run db:init
npm.cmd run db:seed
npm.cmd start
```

資料庫預設建立在：

```text
backend/data/app.sqlite
```

此檔案不應該 commit。

## 2. Base URL

預設 base URL：

```text
http://localhost:3001/api
```

## 3. Response Format

成功格式：

```json
{
  "success": true,
  "data": {}
}
```

失敗格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## 4. Health Check

### GET `/api/health`

用途：確認 backend server 是否正常運作。

範例：

```bash
curl http://localhost:3001/api/health
```

主要回傳欄位：

- `status`
- `service`
- `timestamp`

## 5. Student APIs

### GET `/api/students/:studentId`

用途：取得單一學生基本資料。

範例：

```bash
curl http://localhost:3001/api/students/student_001
```

主要回傳欄位：

- `id`
- `name`
- `email`
- `phone`
- `gradeYear`

### GET `/api/students/:studentId/classes`

用途：取得學生所屬班級。

範例：

```bash
curl http://localhost:3001/api/students/student_001/classes
```

主要回傳欄位：

- `classId`
- `className`
- `gradeYear`
- `subjectId`
- `subjectName`

### GET `/api/students/:studentId/mistakes`

用途：取得學生錯題列表，包含 subject、class、unit、subUnit、concept 顯示資訊。

範例：

```bash
curl http://localhost:3001/api/students/student_001/mistakes
```

主要回傳欄位：

- `mistakeRecordId`
- `questionText`
- `studentQuestion`
- `correctAnswer`
- `aiSummary`
- `fullExplanation`
- `inputType`
- `questionImageUrl`
- `starred`
- `starredAt`
- `alertTriggered`
- `createdAt`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`

### GET `/api/students/:studentId/concept-notes`

用途：取得學生觀念筆記列表。

範例：

```bash
curl http://localhost:3001/api/students/student_001/concept-notes
```

主要回傳欄位：

- `noteId`
- `noteTitle`
- `noteContent`
- `starred`
- `starredAt`
- `createdAt`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`

### GET `/api/students/:studentId/chat-sessions`

用途：取得學生 AI 對話紀錄列表，依更新時間由新到舊排序。

範例：

```bash
curl http://localhost:3001/api/students/student_001/chat-sessions
```

主要回傳欄位：

- `sessionId`
- `title`
- `inputType`
- `startedAt`
- `updatedAt`
- `questionGroupCount`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`

### GET `/api/students/:studentId/generated-exams`

用途：取得學生所有生成考卷 / 練習題紀錄，依建立時間由新到舊排序。

範例：

```bash
curl http://localhost:3001/api/students/student_001/generated-exams
```

主要回傳欄位：

- `examId`
- `studentId`
- `title`
- `examType`
- `sourceType`
- `createdAt`
- `questionCount`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`

### GET `/api/students/:studentId/dashboard`

用途：取得學生端分析表資料，包含總錯題數、總概念數、Quiz 答對率、依單元的錯誤分布、常錯知識點排行。

範例：

```bash
curl "http://localhost:3001/api/students/student_001/dashboard?from=2026-04-21&to=2026-05-21"
curl "http://localhost:3001/api/students/student_001/dashboard?range=30d"
curl "http://localhost:3001/api/students/student_001/dashboard?classId=class_hs2_bio_01&from=2026-04-21&to=2026-05-21"
```

主要 query 參數：

- `from`, `to`
- 或 `range=7d|30d|custom`
- `classId`（可選）
- `unitLimit`
- `conceptLimit`

主要回傳欄位：

- `studentId`
- `studentName`
- `range`
- `from`
- `to`
- `summary.totalMistakes`
- `summary.totalConcepts`
- `summary.quizAccuracy.correctCount`
- `summary.quizAccuracy.totalAnswered`
- `summary.quizAccuracy.accuracyRate`
- `unitDistribution[]`
- `topWeakConcepts[]`

## 6. Chat Session APIs

### GET `/api/chat-sessions/:sessionId`

用途：取得單一 AI 對話基本資料。

範例：

```bash
curl http://localhost:3001/api/chat-sessions/chat_001
```

主要回傳欄位：

- `sessionId`
- `studentId`
- `title`
- `inputType`
- `startedAt`
- `updatedAt`
- `questionGroupCount`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`

### GET `/api/chat-sessions/:sessionId/messages`

用途：取得單一對話中的所有訊息，依 `createdAt` 由舊到新排序。

範例：

```bash
curl http://localhost:3001/api/chat-sessions/chat_001/messages
```

主要回傳欄位：

- `messageId`
- `sessionId`
- `role`
- `messageType`
- `questionGroupId`
- `inputType`
- `content`
- `questionText`
- `questionImageUrl`
- `createdAt`

## 7. Mistake APIs

### GET `/api/mistakes/:mistakeRecordId`

用途：取得單一錯題詳細資料。

範例：

```bash
curl http://localhost:3001/api/mistakes/mistake_record_001
```

主要回傳欄位：

- `mistakeRecordId`
- `studentId`, `studentName`
- `questionText`
- `studentQuestion`
- `studentAnswer`
- `correctAnswer`
- `aiSummary`
- `fullExplanation`
- `inputType`
- `questionImageUrl`
- `starred`
- `starredAt`
- `alertTriggered`
- `createdAt`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`
- `sourceSessionId`
- `questionGroupId`

### GET `/api/mistakes/:mistakeRecordId/related-notes`

用途：透過 `concept_note_mistakes` 查詢和該錯題相關的觀念筆記。

範例：

```bash
curl http://localhost:3001/api/mistakes/mistake_record_001/related-notes
```

主要回傳欄位：

- `noteId`
- `studentId`, `studentName`
- `noteTitle`
- `noteContent`
- `starred`
- `starredAt`
- `createdAt`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`
- `sourceSessionId`
- `questionGroupId`

### PATCH `/api/mistakes/:mistakeRecordId/star`

用途：收藏或取消收藏錯題。

Request body：

```json
{
  "starred": true
}
```

或：

```json
{
  "starred": false
}
```

範例：

```bash
curl -X PATCH http://localhost:3001/api/mistakes/mistake_record_002/star \
  -H "Content-Type: application/json" \
  -d "{\"starred\":true}"
```

成功後回傳該錯題最新 detail。

## 8. Concept Note APIs

### GET `/api/concept-notes/:noteId`

用途：取得單一觀念筆記詳細資料。

範例：

```bash
curl http://localhost:3001/api/concept-notes/note_001
```

主要回傳欄位：

- `noteId`
- `studentId`, `studentName`
- `noteTitle`
- `noteContent`
- `starred`
- `starredAt`
- `createdAt`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`
- `sourceSessionId`
- `questionGroupId`

### GET `/api/concept-notes/:noteId/related-mistakes`

用途：透過 `concept_note_mistakes` 查詢和該觀念筆記相關的錯題。

範例：

```bash
curl http://localhost:3001/api/concept-notes/note_001/related-mistakes
```

主要回傳欄位：

- `mistakeRecordId`
- `studentId`, `studentName`
- `questionText`
- `studentQuestion`
- `studentAnswer`
- `correctAnswer`
- `aiSummary`
- `fullExplanation`
- `inputType`
- `questionImageUrl`
- `starred`
- `starredAt`
- `alertTriggered`
- `createdAt`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`
- `sourceSessionId`
- `questionGroupId`

### PATCH `/api/concept-notes/:noteId/star`

用途：收藏或取消收藏觀念筆記。

Request body：

```json
{
  "starred": true
}
```

或：

```json
{
  "starred": false
}
```

範例：

```bash
curl -X PATCH http://localhost:3001/api/concept-notes/note_001/star \
  -H "Content-Type: application/json" \
  -d "{\"starred\":true}"
```

成功後回傳該觀念筆記最新 detail。

## 9. Generated Exam APIs

### GET `/api/generated-exams/:examId`

用途：取得單一生成考卷 / 練習題基本資料。

範例：

```bash
curl http://localhost:3001/api/generated-exams/generated_exam_001
```

主要回傳欄位：

- `examId`
- `studentId`, `studentName`
- `title`
- `examType`
- `sourceType`
- `createdAt`
- `questionCount`
- `subjectId`, `subjectName`
- `classId`, `className`
- `unitId`, `unitName`
- `subUnitId`, `subUnitName`
- `conceptId`, `conceptName`

### GET `/api/generated-exams/:examId/questions`

用途：取得生成考卷底下的題目。

範例：

```bash
curl http://localhost:3001/api/generated-exams/generated_exam_001/questions
```

主要回傳欄位：

- `questionId`
- `examId`
- `questionOrder`
- `questionStyle`
- `title`
- `passage`
- `questionText`
- `options`
- `answer`
- `explanation`
- `starred`
- `starredAt`
- `createdAt`

### GET `/api/generated-exams/:examId/source-mistakes`

用途：透過 `generated_exam_selected_mistakes` 查詢生成考卷來源錯題。

範例：

```bash
curl http://localhost:3001/api/generated-exams/generated_exam_001/source-mistakes
```

主要回傳欄位：

- `mistakeRecordId`
- `questionText`
- `studentQuestion`
- `correctAnswer`
- `aiSummary`
- `fullExplanation`
- `subjectName`
- `className`
- `unitName`
- `subUnitName`
- `conceptName`
- `createdAt`

## 10. Teacher Dashboard APIs

規格詳見 [`docs/dashboard/teacher/teacher-dashboard-api.md`](../docs/dashboard/teacher/teacher-dashboard-api.md)。`npm run db:seed` 會依 `demoData/demoData1` 的 `studentAnalyticsSummary` 寫入 `exam_submissions` / `exam_answers`，供 Quiz 答對率統計。

### GET `/api/teacher/classes`

```bash
curl http://localhost:3001/api/teacher/classes
```

### GET `/api/dashboard/overview`

```bash
curl "http://localhost:3001/api/dashboard/overview?classId=class_jh1_bio_01&range=30d"
```

### GET `/api/dashboard/charts`

```bash
curl "http://localhost:3001/api/dashboard/charts?classId=class_jh1_bio_01&range=30d"
```

### GET `/api/dashboard/students`

```bash
curl "http://localhost:3001/api/dashboard/students?classId=class_jh1_bio_01&range=30d&sortBy=quizAccuracy&sortOrder=desc"
```

### GET `/api/dashboard/students/:studentId/detail`

```bash
curl "http://localhost:3001/api/dashboard/students/student_001/detail?classId=class_jh1_bio_01&range=30d"
```

### GET `/api/dashboard/concepts-risk`

```bash
curl "http://localhost:3001/api/dashboard/concepts-risk?classId=class_jh1_bio_01&range=30d"
```

### 向後相容

```bash
curl "http://localhost:3001/api/dashboard/summary?classId=class_jh1_bio_01&range=30d"
curl "http://localhost:3001/api/dashboard/students/student_001/concepts?classId=class_jh1_bio_01&range=30d"
curl "http://localhost:3001/api/dashboard/students/student_001/charts?classId=class_jh1_bio_01&range=30d"
```

Dashboard 相關錯誤碼：`INVALID_RANGE`、`INVALID_CUSTOM_RANGE`、`MISSING_CLASS_ID`、`CLASS_NOT_FOUND`、`STUDENT_NOT_FOUND`、`STUDENT_NOT_IN_CLASS`、`SCOPE_NOT_SUPPORTED`。

Teacher Dashboard 兼容 `frontend-prototype`：`classId` 可使用 `all`、`class_jh1_bio_01`、`class_jh1_bio_02`、`class_jh3_bio_review_01`；`range` 支援 `7d`、`14d`、`30d`、`custom`；學生列表可用 `sortBy=quizAccuracy`。

## 11. Common Error Codes

目前常見錯誤碼：

- `STUDENT_NOT_FOUND`：找不到學生。
- `CHAT_SESSION_NOT_FOUND`：找不到對話紀錄。
- `MISTAKE_NOT_FOUND`：找不到錯題。
- `CONCEPT_NOTE_NOT_FOUND`：找不到觀念筆記。
- `GENERATED_EXAM_NOT_FOUND`：找不到生成考卷 / 練習題。
- `INVALID_STARRED_VALUE`：`starred` 不是 boolean。

## 12. Notes for Frontend Integration

- 所有 API 預設回傳 JSON。
- `starred` 欄位會回傳 boolean。
- `starredAt` 可能是 ISO 字串或 `null`。
- `options` 在 generated exam questions API 中會回傳 array。
- `backend/data/app.sqlite` 不應該 commit。
- `backend/node_modules/` 不應該 commit。
- 老師端 Dashboard API 見 [`docs/dashboard/teacher/teacher-dashboard-api.md`](../docs/dashboard/teacher/teacher-dashboard-api.md) 與本文件 §10。
- Windows PowerShell 對 `curl -d` 的 JSON quoting 較容易出錯；若遇到 request body 解析錯誤，可以改用 `Invoke-RestMethod` 或在 cmd 中執行 curl。
