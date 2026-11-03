# 📚 Mistake Learning System (補習班個別化學習支援系統)

> 從「單一錯題紀錄」走向「數據化教學」，結合 AI 解析與知識點追蹤的個別化學習支援系統。

![Tech Stack](https://img.shields.io/badge/Tech_Stack-Node.js_|_Express_|_React_|_SQLite-blue)
![AI Models](https://img.shields.io/badge/AI-Gemini_API-green)

## 💡 專案背景與痛點解決
本專案為針對真實補習班（敦南復興文理補習班）進行 3 輪實地訪談後開發之系統。
解決補習班傳統教學的痛點：**「學生反覆在同一個知識點犯錯，但老師難以長期追蹤並給予個別化輔導」**。

系統分為「學生端」與「老師端（Dashboard）」：
* **學生端**：拍照上傳錯題，AI 自動解析知識點並歸檔，自動生成相似題/素養題 (Quiz) 進行弱點打擊。
* **老師端**：透過 Dashboard 快速掌握班級錯題趨勢與「高風險知識點」，輔助教學決策。

## 👨‍💻 開發團隊與分工 (Team & Roles)
本專案由 5 人團隊共同開發，**本人（Patrick Tsai / yo1616）擔任專案組長與前後端整合負責人**，主要貢獻包含：
* **專案管理與需求分析**：主持補習班實地訪談，釐清使用者痛點，規劃開發時程與團隊分工。
* **前後端 API 設計與整合**：制定嚴謹的 RESTful API 規格（包含統一回傳 UTF-8 JSON、ISO 8601 時間格式及完整 Error Code），並實作後端架構，確保前端 React 資料串接無誤。
* **AI API 串接與雙模式架構**：串接 Gemini API 進行語意分析；設計 `Mock` 與 `Real` 雙模式執行環境，提升開發測試效率並節省 API 成本。
* **系統部署與環境建置**：撰寫 `db:seed` 資料庫初始化腳本與 `npm` 啟動指令，實現單一後端同時服務前台與後台的一鍵啟動架構。

---

## 🚀 執行與啟動說明 (Quick Start)

本專案建議以「單一後端提供整套系統」的方式使用。支援 Unix-like 環境。
* **環境需求**：Node.js 18+ / npm

### 1. 安裝套件與資料庫初始化
```bash
npm --prefix backend install
npm --prefix frontend/studentMobile install

npm run db:init
npm run db:seed
npm run build:student
```

### 2. 啟動系統 (雙模式支援)

**方案 A：Mock 驗收版 (推薦，無需 API Key)**
使用內建假資料模擬 AI 回應，適合快速檢視系統完整流程與圖表。
```bash
npm run start:mock
```

**方案 B：Real AI 體驗版 (需 Gemini API Key)**
啟動真實 AI 模型，可實際上傳問題進行解析與題目生成。
```bash
export GEMINI_API_KEY="你的_GEMINI_API_KEY"
npm run start:real
```

### 3. 開啟系統
* **👨‍🏫 老師端 (Dashboard)**：`http://localhost:3001/teacher/`
* **🎓 學生端 (Mobile Web)**：`http://localhost:3001/student/`

---

## 📄 API 規格與資料結構設計 (API Specifications)

本專案採用前後端分離架構。為了讓前端團隊順利串接，本人設計了完整的 RESTful API 規格書，規範了前後端資料交換的結構（包含統一回傳 UTF-8 JSON、ISO 8601 時間格式及完整 Error Code 處理）。

👉 **[點擊此處查看完整的 API 規格書 (API_DOCS.md)](./API_DOCS.md)**

*(以下為核心 API 端點簡述)*
- `POST /api/ai/concept-classification`：接收學生上傳內容，透過 Gemini 判斷所屬知識點。
- `POST /api/chat-sessions`：建立聊天容器，並透過 `questionGroupId` 切分題目。
- `POST /api/exams/generate`：選擇弱點知識點，由 AI 生成專屬考題。
- `GET /api/dashboard/summary`：整合班級錯題數據，提供 7d/30d 圖表與高風險知識點預警。T /api/dashboard/students/:studentId/charts`
- **邏輯**：整合錯題資料，提供 7d/30d/自訂期間 的圖表數據，並依照「錯題數」或「影響學生數」計算知識點的風險等級。
