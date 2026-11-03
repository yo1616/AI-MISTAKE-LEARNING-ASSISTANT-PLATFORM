# AI 串接

## 用途

AI 層目前負責三件事：

- 為學生提問推薦觀念
- 生成解題回覆或說明
- 生成後續練習題

## 模式切換

AI runtime 由 `ai/index.js` 中的 `AI_MODE` 控制：

- `mock`： `ai/mockAiService.js`
- `real`： `ai/realAiService.js`

## 目前的 real provider

目前 real mode 實作使用 Gemini API。

必要環境變數：

- `GEMINI_API_KEY`

可選環境變數：

- `GEMINI_MODEL`
- `GEMINI_BASE_URL`

repo 內仍保留 `OPENAI_MODEL` 作為舊相容欄位，但目前真正送出的 real request 是 Gemini。

若從根目錄使用既有 script 啟動：

- `npm run start:mock`
- `npm run start:real`

則不需要手動設定 `AI_MODE`，script 會自動切換模式。

## 後端入口

後端對外提供的 AI 相關 API 為：

- `GET /api/ai/status`
- `POST /api/ai/ask`
- `POST /api/ai/practice-question`

實作入口：

- `backend/src/controllers/aiController.js`

## Prompt 與輸出格式

prompt builder 位於：

- `ai/promptTemplates.js`

補充參考：

- `ai/prompt.md`
- `ai/returnFormat.md`

目前 real mode 會要求 structured JSON，涵蓋：

- 觀念推薦
- 解題回覆
- 練習題生成

## 維護建議

- 前後端整合開發時優先使用 `mock` mode。
- 只有在環境變數設定完成後才切到 `real` mode。
- 若修改 prompt 或 schema，應同步驗證前端仍能接收既有欄位，例如 recommendation 與 generated question 的 key。
