# 學生端前端 — 瀏覽器本地執行

學生端目前使用 **mock API**（`frontend/src/data/mockApi.js` + `localStorage`），**不必**先開 backend 也能瀏覽各頁面。

## 步驟

### 1. 安裝依賴（第一次）

```bash
cd frontend
npm install
```

### 2. 啟動開發伺服器

```bash
npm start
```

幾秒後瀏覽器會自動開啟；若沒有，手動開啟：

```text
http://localhost:3000
```

### 3. 建議瀏覽路徑

| 路徑 | 頁面 |
|------|------|
| `/` | AI 問答首頁（Home） |
| `/menu` | 功能選單 |
| `/chapters` | 錯題本（依章節） |
| `/important-mistake` | 重要錯題 |
| `/important-concept` | 重要觀念筆記 |
| `/concept` | 知識點筆記 |
| `/chat-history` | 歷史對話 |
| `/diagnostic-quiz` | 生成考題／測驗 |
| `/dashboard` | 學生分析 Dashboard |
| `/account` | 帳戶 |

從首頁可進選單；或直接改網址列路徑。

### 4. 停止

在執行 `npm start` 的終端機按 `Ctrl + C`。

## 常見問題

| 狀況 | 處理 |
|------|------|
| `Could not find package.json` | 確認在 `frontend` 目錄執行 |
| 3000 埠被占用 | 終端機依提示選 `Y` 改用其他埠，或關掉占用 3000 的程式 |
| 畫面空白 | 開開發者工具 Console 看錯誤；重新 `npm install` 後再 `npm start` |
| 資料是空的 | 重新整理；mock 會在首次載入時寫入 `localStorage` |

## 之後接真實後端

需把 `mockApi.js` 改為 `fetch('http://localhost:3001/api/...')`，並在 backend 執行 `npm start`。目前 MVP 以 mock 為主。
