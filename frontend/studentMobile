# Mistake Learning System (Frontend)

以 **React** 建立的學習輔助前端，核心目標是把學生的提問、錯題、重點觀念、即時測驗與學習分析整合在同一個介面中，幫助使用者進行「錯題驅動」的複習。

---

## 專案特色

- 🧠 **錯題追蹤**：記錄學生提問與解析內容，建立錯題資料。
- ⭐ **收藏機制**：可收藏重要錯題與重要觀念（Favorites）。
- 📝 **即時測驗**：依單元範圍與題數生成題目，測後可加入錯題本。
- 📊 **學習分析**：顯示錯誤分佈、常錯知識點與整體學習概況。
- 💬 **對話紀錄**：保存學習對話，支援歷史紀錄展開與刪除。

---

## 技術棧

- **React 19**
- **React Router DOM 6**
- **Create React App / react-scripts 5**
- **Context API**（`FavoritesContext` 管理收藏狀態）
- **Fetch API**（串接後端 `http://localhost:3001/api`）

---

## 主要路由（`src/App.js`）

| 路徑 | 頁面 | 說明 |
|---|---|---|
| `/` | HomePage | 提問入口（文字/圖片）、AI 回覆、可收藏 |
| `/menu` | MenuPage | 功能選單 |
| `/chapters` | ChapterListPage | 章節錯題列表 |
| `/mistake/:chapterId` | MistakeDetailPage | 單章錯題詳情 |
| `/concept` | ConceptPage | 觀念總覽 |
| `/important-concept` | ImportantConceptPage | 收藏觀念 |
| `/important-mistake` | ImportantMistakePage | 收藏錯題 |
| `/diagnostic-quiz` | DiagnosticQuizPage | 即時測驗 |
| `/dashboard` | DashboardPage | 分析儀表板 |
| `/account` | AccountPage | 個人設定 |
| `/chat-history` | ChatHistoryPage | 對話紀錄 |

---

## 專案結構（重點）

```bash
src/
├── App.js
├── components/         # UI 元件（列表、按鈕、標頭、題卡等）
├── data/               # Context 與本地資料設定
│   └── FavoritesContext.js
├── pages/              # 各功能頁
├── services/           # API 請求封裝
│   └── api.js
├── style/              # 各頁樣式
└── utils/              # 工具函式（如時間格式）
```

---

## API 整合說明

前端預設會呼叫：

```txt
http://localhost:3001/api
```

主要包含：

- 基礎資料：subjects / units / subunits / concepts
- 錯題：查詢、建立、收藏切換、明細
- 概念筆記：查詢、收藏切換、明細
- 對話：session 與 messages 管理
- 分析：summary / charts
- 學生資料：profile

> `src/services/api.js` 目前使用固定學生 ID：`student_001`（可依需求改為登入態）。

---

## 安裝與啟動

### 1) 安裝套件

```bash
npm install
```

### 2) 啟動前端

```bash
npm start
```

預設會開在：`http://localhost:3000`

### 3) 建置（Production）

```bash
npm run build
```

---

## 可用 Scripts

- `npm start`：啟動開發模式
- `npm test`：執行測試
- `npm run build`：輸出 production build
- `npm run eject`：彈出 CRA 設定（不可逆）

---

## 目前已實作的學習流程（摘要）

1. 使用者在 Home 提問（可附圖片）
2. 系統建立聊天 session 並儲存訊息
3. 生成回答後，將內容轉存為錯題資料
4. 錯題與觀念可被收藏，集中於重要列表
5. 即時測驗可依單元出題，錯題可回寫到錯題本
6. Dashboard 依資料統整錯誤分佈與常錯知識點

---

## 已知注意事項

- 本專案依賴本機後端 API（`localhost:3001`），若後端未啟動，部分頁面會無資料或報錯。
- 部分流程含暫時性 mock/預設行為（例如測驗題目 fallback）。
- `HomePage` 目前同時有 localStorage 與 API 的收藏/資料邏輯，後續可再整併一致。

---

## 後續可優化方向

- 導入登入機制（取代固定 `student_001`）
- 抽離 API Base URL 為環境變數（`.env`）
- 補齊錯誤處理與 loading state 一致性
- 增加單元/整合測試覆蓋率
- 統一資料來源（localStorage vs backend API）

---

## License

此專案目前未指定授權條款；若要公開於 GitHub，建議補上 `LICENSE`（例如 MIT）。
