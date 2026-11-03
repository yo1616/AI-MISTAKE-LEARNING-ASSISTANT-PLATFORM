# Teacher Dashboard

這個模組是老師端儀表板，會由後端以靜態頁面的方式提供在 `/teacher/`。它透過後端 API 顯示班級總覽、學生分析與知識點風險資訊。

## 模組職責

- 呈現老師端分析畫面
- 呼叫後端 dashboard API
- 提供班級切換、學生詳情與知識點風險檢視

## 重要檔案

- HTML 入口： `frontend/teacherDashboard/index.html`
- API 層： `frontend/teacherDashboard/js/api.js`
- 啟動檔： `frontend/teacherDashboard/js/main.js`
- 各頁元件： `frontend/teacherDashboard/js/components/`

## 執行方式

老師端由後端提供，啟動 backend 後開啟：

```txt
http://localhost:3001/teacher/
```

`frontend/teacherDashboard/js/api.js` 以 `/api` 作為 base path，因此預設就是與同一個 Express 後端一起運作。

## 維護注意事項

- 這個模組是純 HTML / CSS / JavaScript，沒有獨立的 package 或 bundler。
- 相關 API 請參考 `docs/api.md`。
