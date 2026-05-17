# 個別化學習支援系統｜老師端前端 Prototype

本專案為「個別化學習支援系統」的老師端前端 Prototype，主要目標是協助補習班老師依據學生錯題紀錄，快速掌握班級整體學習狀況、學生個別弱點，以及高風險知識點。

目前版本為純前端實作，使用 HTML、CSS、JavaScript Modules 製作互動介面，並透過 mock JSON API 模擬後端資料回傳。之後若後端 API 完成，可以將目前的 mock API function 替換成 `fetch("/api/...")` 串接真實資料。

---

## 一、老師端fronted 功能概述

本系統目前支援以下功能：

1. 老師帳號登入
2. 登入後選擇查看範圍
   - 全部學生
   - 國一生物1班
   - 國一生物2班
   - 國三複習生物班
3. Dashboard 班級總覽
4. 學生列表與排序篩選
5. 單一學生詳情錯題分析
6. 知識點管理與風險分析
7. 個人設定頁面


---

## 二、使用技術

本專案目前使用：

- HTML
- CSS
- JavaScript
- JavaScript Modules
- Mock JSON API
- Live Server

---

## 三、專案結構

```text
project/
├── index.html
├── style.css
└── js/
    ├── main.js
    ├── state.js
    ├── data.js
    ├── api.js
    ├── utils.js
    ├── shared.js
    └── components/
        ├── login.js
        ├── dashboard.js
        ├── students.js
        ├── knowledge.js
        └── settings.js

| 檔案                        | 負責什麼                | 簡單說法                  |
| ------------------------- | ----------------        | --------------------- |
| `main.js`                 | 初始化系統、綁定 sidebar   | 系統入口                  |
| `state.js`                | 存目前狀態                | 記住現在登入誰、看哪班、選哪個期間     |
| `data.js`                 | mock data               | 假資料庫                  |
| `api.js`                  | mock API                 | 模擬後端                  |
| `utils.js`                | 共用計算工具              | 日期篩選、分組、判斷學生是否在班級     |
| `shared.js`               | 共用 UI                   | 時間篩選、班級下拉、錯誤訊息、圖表 bar |
| `components/login.js`     | 登入與選班級              | 登入流程                  |
| `components/dashboard.js` | Dashboard             | 班級總覽                  |
| `components/students.js`  | 學生列表與學生詳情        | 學生分析                  |
| `components/knowledge.js` | 知識點管理                | 知識點風險分析               |
| `components/settings.js`  | 個人設定                  | 老師設定頁                 |
