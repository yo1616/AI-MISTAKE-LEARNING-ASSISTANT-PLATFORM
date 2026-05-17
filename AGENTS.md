# AGENTS.md

本 repo 是「補習班個別化學習支援系統」專案。請 Codex 在進行任何實作前，先閱讀：

1. `README.md`
2. `demoData/demoData1`
3. `docs/database-design.md`
4. `docs/backend-todo.md`

## 專案目標

建立一個補習班學生個別化學習支援系統，包含：

- 學生端：AI 問答、歷史對話、錯題紀錄、知識點筆記、我的最愛、生成考題、學生分析。
- 老師端：班級列表、全班學生錯題統計、班級常錯觀念、單一學生分析。

## 實作原則

- 以 `README.md` 的 API 格式為最高優先。
- 以 `demoData/demoData1` 作為 seed data 與測試依據。
- `docs/database-design.md` 是資料庫 schema 與關係設計依據。
- `docs/backend-todo.md` 是建議開發順序。
- 不要一次大量重構，請分階段實作。
- 目前先做 MVP，不需要串真正 AI API。
- AI 回覆、觀念分類、生成考題可以先使用 mock function。
- 回傳格式需維持：
  - 成功：`{ "success": true, "data": ... }`
  - 失敗：`{ "success": false, "error": { "code": "STRING", "message": "說明" } }`
- 時間格式使用 ISO 8601。
- API 對外欄位使用 README 的 camelCase。
- 資料庫內部欄位可使用 snake_case，但 API 層需轉換。

## 資料分類規則

學生端內容主分類：

```text
subjectId >> unitId >> conceptId
```

老師端分析主分類：

```text
classId / className
```

## 重要設計限制

- `session` 是聊天容器，不代表只有一題。
- 同一個 `session` 可以有多個 `questionGroupId`。
- 真正切分每一題的是 `questionGroupId`。
- 我的最愛不另外建立 Favorite table，使用：
  - `mistake_records.starred`
  - `mistake_records.starred_at`
  - `concept_notes.starred`
  - `concept_notes.starred_at`
- 錯題先依 README/demoData 設計為 `mistake_records`，不用另外拆 `mistakes` table。
- `concept` 是分類用觀念標籤。
- `concept_note` 是學生個人的知識點筆記，不等於 `concept`。

## 安全規則

- 不要提交 `.env`。
- 不要提交 API key、token、密碼。
- 不要把敏感資訊寫死在程式碼裡。
- 不要刪除既有 README 或 demoData，除非使用者明確要求。

## 完成標準

每次修改後，請盡量確認：

- 程式可以啟動。
- 資料庫可以初始化。
- seed 可以匯入 demoData。
- 主要 API 可以回傳 README 規格格式。
- 若無法測試，請明確說明原因與尚未驗證的部分。
