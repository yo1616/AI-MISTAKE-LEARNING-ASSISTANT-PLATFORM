# 系統架構

## 總覽

系統可分成四個互相協作的層次：

1. Student frontend
2. Teacher dashboard
3. Backend API and analytics services
4. AI runtime abstraction

後端是整個系統的整合中心，負責將 SQLite 資料、REST API、AI 服務與前端入口整合在一起。它會在 `/api` 提供 API，在 `/teacher/` 提供老師端，並可在 `/student` 提供已建置的學生端。

## 執行元件

### 學生端前端

- 位置： `frontend/studentMobile`
- 技術： React 18、React Router、Fetch API
- 角色：學生提問、錯題整理、觀念筆記、收藏、生成練習題、分析與聊天紀錄

### 老師端前端

- 位置： `frontend/teacherDashboard`
- 技術：靜態 HTML、CSS、JavaScript modules
- 角色：班級總覽、學生分析、知識點風險與老師端統計視圖

### 後端

- 位置： `backend`
- 技術： Express、better-sqlite3
- 角色：路由處理、資料持久化、統計彙整、靜態資源提供與 AI 整合

### AI 層

- 位置： `ai`
- 模式：
  - `mock`: rule-based and deterministic
  - `real`: provider-backed inference
- 目前 real provider：Gemini

## 主要流程

### 學生提問流程

1. 學生端透過 `/api/chat-sessions` 或 `/api/chat-sessions/:sessionId/messages` 送出問題。
2. 後端建立或延續 session，並記錄對話訊息。
3. AI 端點提供觀念推薦與解題回覆。
4. 前端可將結果保存成錯題紀錄與觀念筆記。
5. 後續複習頁面再透過學生端 API 讀取錯題、筆記、收藏與生成題目。

### 老師端分析流程

1. 老師端透過 `/api/teacher` 與 `/api/dashboard` 相關端點取得班級與分析資料。
2. 後端將錯題、觀念分布、生成考題表現與學生趨勢資料進行彙整。
3. 老師端只呈現統計與分析結果，不顯示完整聊天逐字內容。

## 資料邊界

- 聊天紀錄是以時間為主軸，儲存在 session、question group 與 message 中。
- 錯題與觀念筆記是以學習內容為主軸，依 subject、unit、sub-unit、concept 組織。
- 老師端分析是以班級為主軸，從持久化的錯題與考題資料衍生。

## 前端提供方式

最終整合版入口：

- `http://localhost:3001/teacher/`: teacher dashboard static files
- `http://localhost:3001/student`: built student frontend

若需單獨開發學生端，才使用：

- `http://localhost:3000/`: React dev server

學生端開發伺服器會把 API 請求 proxy 到 `http://localhost:3001`。

## AI 模式切換

- `AI_MODE=mock`： `ai/mockAiService.js`
- `AI_MODE=real`： `ai/realAiService.js`

切換邏輯定義於 `ai/index.js`。

## 目前限制

- 目前 seed data 以生物科情境為主。
- 學生端目前固定使用單一 student ID。
- 老師端依賴後端提供的 `/api` 路徑，並不是獨立可部署的單頁應用。
