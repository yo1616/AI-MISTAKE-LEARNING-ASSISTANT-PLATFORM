# AI MISTAKE LEARNING ASSISTANT PLATFORM ｜補習班個別化學習AI支援系統

[English](./README.md) | [**繁體中文**](./README.zh-TW.md)

**AI 驅動的個人化學習與教學數據分析平台**

**React · Node.js · Express · SQLite · Gemini API · REST API**

本專案旨在開發一套結合人工智慧與學習數據分析的輔助平台，協助補習班辨識學生反覆出錯的知識概念、追蹤學習弱點，並提供教師更具系統性的教學分析與決策依據。

本系統由**五人開發團隊**共同完成，並透過**三輪實際補習班訪談**蒐集使用者需求，將真實教育情境中的問題轉換為具體系統功能，建立整合學生端、教師端與 AI 分析模組的資訊系統。

---

## 1. 專案概述（Project Overview）

### 問題背景

在傳統補習班的教學環境中，學生經常在相同知識概念上反覆犯錯，但教師缺乏有效率的工具，系統性地記錄、辨識與追蹤這些學習問題。

單次錯題紀錄通常只能反映當下的作答情況，難以呈現學生長期的學習模式，也不容易辨識持續存在的知識缺口。

### 解決方案

本專案開發的錯題學習系統，將學生錯題紀錄、AI 輔助分析與教師教學儀表板整合至同一平台。

系統主要服務兩類使用者：

- **學生端：** 紀錄錯題、辨識薄弱知識點，並透過 AI 生成的練習題進行針對性複習。
- **教師端：** 追蹤學生學習表現、分析常見錯誤概念，並利用學習數據支援個人化教學。

本平台的核心目標，是將分散的錯題紀錄轉化為結構化、可分析的學習資訊，協助建立更具數據依據的教學模式。

---

## 2. 開發流程與系統整合（Development Process & System Integration）

本專案透過團隊合作完成使用者研究、需求分析、系統架構設計、AI 功能整合及應用程式測試。

### 需求分析與專案協作

- 透過三輪補習班訪談，了解學生與教師在學習紀錄、錯題管理及教學分析上的實際需求。
- 將使用者需求轉換為具體系統功能與開發優先順序。
- 協調五人團隊的開發工作與系統整合進度。

### 系統架構與 API 設計

- 設計 RESTful API 規格，串接 React 前端、Express 後端與 SQLite 資料庫。
- 建立一致的 JSON 回應格式、ISO 8601 時間格式及錯誤處理規範。
- 透過標準化 API 通訊方式，完成前後端模組整合。

### AI 整合與工作流程設計

- 整合 Gemini API，支援 AI 輔助知識概念分析與題目生成。
- 建立 **Mock Mode 與 Real AI Mode**，支援系統開發、測試與成本控制。
- 將 AI 分析流程與學生學習紀錄及應用程式服務串接。

### 資料庫與應用程式整合

- 開發後端整合邏輯，支援 SQLite 資料操作。
- 建立資料庫初始化與測試資料匯入流程。
- 透過共用後端服務，提供學生端與教師端的系統功能。

---

## 3. 核心功能（Key Features）

### 產品畫面（Product Preview）

#### 系統介面

![系統介面](./screenshots/interface.png)

### 學生學習介面

- 上傳並紀錄作答錯誤的題目。
- 利用 AI 輔助辨識題目所屬知識點。
- 整理歷史錯題與學習紀錄。
- 根據薄弱概念生成個人化練習題。

### 教師分析儀表板

- 檢視班級整體錯題統計與學習趨勢。
- 辨識高頻錯誤或高風險知識點。
- 分析近 7 天、30 天或系統支援的自訂期間學習表現。
- 查看個別學生學習分析，輔助教學規劃。

---

## 4. 系統架構（System Architecture）

```text
                學生端介面
                  (React)
                     |
                     v
                Express API
                     |
          +----------+----------+
          |                     |
          v                     v
       SQLite              AI 服務層
        資料庫                   |
          |               Mock / Gemini API
          |                     |
          +----------+----------+
                     |
                     v
                 學習數據分析
                     |
                     v
               教師分析儀表板
```

系統透過共用後端服務，整合學習紀錄、AI 輔助處理流程與教師端數據分析功能。

### AI 執行模式（AI Execution Modes）

| 模式 | 說明 | 是否需要 API Key |
|---|---|---|
| **Mock Mode** | 使用模擬 AI 回應，支援開發與展示 | 不需要 |
| **Real AI Mode** | 透過 Gemini API 執行 AI 分析 | 需要 |

Mock Mode 讓系統在沒有外部 API 金鑰或額外 API 使用成本的情況下，仍能進行功能展示。

透過區分模擬與真實 AI 執行模式，也能降低應用程式整合測試對外部 AI 服務的依賴。

---

## 5. 技術架構（Technology Stack）

| 系統層級 | 使用技術 |
|---|---|
| 前端 | React |
| 後端 | Node.js、Express |
| 資料庫 | SQLite |
| AI 整合 | Google Gemini API |
| 系統通訊 | RESTful API、JSON |
| 開發工具與流程 | npm、資料庫測試資料匯入腳本 |
| 測試與展示 | Mock / Real AI Modes |

---

## 6. 安裝與執行（Getting Started）

**環境需求：** Node.js 18 以上版本及 npm。

以下指令適用於類 Unix 作業環境。

### 安裝步驟

```bash
npm --prefix backend install
npm --prefix frontend/studentMobile install

npm run db:init
npm run db:seed
npm run build:student
```

### 方式 A — Mock Mode（建議使用）

不需要 API Key，即可啟動系統：

```bash
npm run start:mock
```

### 方式 B — Real AI Mode

於本機環境設定 Gemini API Key：

```bash
export GEMINI_API_KEY="YOUR_API_KEY"
npm run start:real
```

請勿將 API 金鑰或其他敏感憑證提交至 GitHub Repository。

### 本機存取網址

| 介面 | 網址 |
|---|---|
| 學生端介面 | `http://localhost:3001/student/` |
| 教師端儀表板 | `http://localhost:3001/teacher/` |

*以上指令依據專案既有安裝說明整理，實際使用前應確認目前 Repository 的指令設定與資料夾結構。*

---

## 7. API 設計與文件（API Design & Documentation）

後端透過 RESTful API 提供錯題分析、學習對話紀錄、AI 練習題生成與教學儀表板分析等功能。

### 主要 API 範例

| 方法 | API 路徑 | 功能 |
|---|---|---|
| POST | `/api/ai/concept-classification` | 進行題目知識概念分類 |
| POST | `/api/chat-sessions` | 建立學習對話紀錄 |
| POST | `/api/exams/generate` | 生成個人化練習題 |
| GET | `/api/dashboard/summary` | 取得班級整體學習分析摘要 |

API 文件包含請求與回應格式、共用資料規範，以及錯誤處理機制。

**[查看 API 技術文件](./API_DOCS.md)**

---

## 8. 專案成果與學習收穫（Project Outcomes & Learnings）

本專案完成一套整合學生端、教師端與 AI 分析功能的應用程式原型，結合 AI 學習輔助、結構化資料管理與教學數據分析。

### 專案成果

- 完成整合學生端與教師端的可運作系統原型。
- 串接學習紀錄、AI 知識概念分析及個人化題目生成流程。
- 建立共用後端服務與一致的 API 通訊規範。
- 實作 Mock Mode 與 Real AI Mode，支援開發與系統展示。
- 完成整合系統的功能展示。

### 主要學習收穫

- 將實際使用者訪談結果轉換為系統功能需求。
- 建立一致的 API 規範，支援多人協作開發。
- 將 AI 服務整合至完整應用程式工作流程。
- 協調五人開發團隊的工作與系統整合。
- 運用 Mock Mode 降低測試流程對外部 AI 服務的依賴。

### 專案範圍與限制

本系統為根據真實使用者訪談需求所開發的學術專案原型。

目前尚未驗證大規模正式部署成效、實際學習成果改善程度，或正式產品環境下的系統可靠性。

未來可持續進行使用者測試、提升 AI 分析準確性、改善系統擴充能力，並建立學習成效評估機制。

---

## 9. 專案資訊（Project Information）

**專案名稱：** Mistake Learning System — AI 錯題學習輔助平台

**專案類型：** 大學團隊開發專案

**開發團隊：** 五人團隊

**開發流程：** 使用者研究 · 需求分析 · 系統設計 · AI 整合 · 應用程式測試

**核心領域：** 教育科技 · AI 應用開發 · 系統整合 · 學習數據分析

**專案狀態：** 已完成可運作的學術系統原型

---
