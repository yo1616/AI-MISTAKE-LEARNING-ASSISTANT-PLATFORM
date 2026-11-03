# 資料模型

## 持久化方式

系統目前使用 SQLite。正式 schema 定義在 `backend/src/db/schema.sql`，seed data 由 `backend/src/db/seedDb.js` 從 `seeds/feature-demo-data.json` 匯入。

## 核心資料群組

### 身分與班級關係

- `users`：學生與老師共用的基礎帳號資料
- `teachers`
- `students`
- `subjects`
- `classes`
- `student_classes`

這組資料用來描述使用者身分、班級與科目關係，以及學生所屬班級。

### 學習內容結構

- `units`
- `sub_units`
- `concepts`

這組資料定義學習內容的主要分類階層：

`subject -> unit -> sub_unit -> concept`

錯題、觀念筆記與生成題目都依附在這條分類路徑上。

### 對話與提問流程

- `chat_sessions`
- `question_groups`
- `chat_messages`
- `message_images`

設計用途：

- `chat_sessions`：以時間為主軸的對話容器
- `question_groups`：同一個 session 中單題或單組追問的邏輯分組
- `chat_messages`：學生與 AI 的訊息內容
- `message_images`：圖片提問相關資訊

### 學習成果物

- `mistake_records`
- `concept_notes`
- `generated_exams`
- `generated_exam_questions`

設計用途：

- `mistake_records`：從提問或生成題流程沉澱出的錯題
- `concept_notes`：整理後的觀念筆記
- `generated_exams` 與 `generated_exam_questions`：後續生成的練習內容

## 分類規則

### 學生端

學生端複習內容以學習內容為主軸：

`subject -> unit -> sub_unit -> concept`

適用於：

- 錯題整理
- 觀念筆記
- 生成練習題

### 老師端

老師端分析以班級為主軸：

`class -> student -> concept trends`

老師端看到的是統計結果、弱點觀念與風險趨勢，而不是完整聊天內容。

## 重要欄位

### `mistake_records`

重點欄位：

- `student_id`
- `subject_id`
- `class_id`
- `unit_id`
- `sub_unit_id`
- `concept_id`
- `source_session_id`
- `source_exam_id`
- `question_text`
- `student_answer`
- `correct_answer`
- `ai_summary`
- `full_explanation`
- `starred`
- `alert_triggered`
- `error_count`
- `review_status`

### `concept_notes`

重點欄位：

- `student_id`
- `source_session_id`
- `question_group_id`
- `subject_id`
- `class_id`
- `unit_id`
- `sub_unit_id`
- `concept_id`
- `note_title`
- `note_content`
- `starred`

### `generated_exams`

重點欄位：

- `student_id`
- `subject_id`
- `unit_id`
- `sub_unit_id`
- `concept_id`
- `class_id`
- `question_count`
- `difficulty`
- `question_type`

## 維護說明

- 目前 seed data 仍以生物科情境為主。
- schema 已明確區分時間導向的聊天資料與內容導向的複習資料。
- 若要擴充科目、班級或學生，除了更新 seed data，也要檢查前端是否仍有固定 ID 假設。
