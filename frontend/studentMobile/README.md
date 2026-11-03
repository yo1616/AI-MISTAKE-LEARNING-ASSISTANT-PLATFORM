# Student Frontend

這個模組是學生端網頁，使用 React 建立，負責提問、錯題整理、觀念筆記、收藏、生成練習題、聊天紀錄與個人學習分析等流程。

## 模組職責

- 提供 `/student` 下的學生端操作流程
- 透過共用 service layer 呼叫後端 API
- 維護前端輕量 UI 狀態，例如收藏與頁面互動
- 在本機開發時將 API 請求 proxy 到後端

## 重要檔案

- App 與路由： `frontend/studentMobile/src/App.js`
- API service layer： `frontend/studentMobile/src/services/api.js`
- 頁面： `frontend/studentMobile/src/pages/`
- Favorites context： `frontend/studentMobile/src/data/FavoritesContext.js`

## 使用方式

最終整合版由 backend 直接提供，入口為：

```txt
http://localhost:3001/student
```

若只需要單獨開發學生端，再使用 React dev server：

```bash
npm install
npm start
```

開發伺服器網址：`http://localhost:3000/`

開發環境會透過 `frontend/studentMobile/package.json` 內的 `proxy` 設定，把 API 請求轉到 `http://localhost:3001`。

## 維護注意事項

- 正式可維護的學生端原始碼集中在 `frontend/studentMobile/src/`。
- `CURRENT_STUDENT_ID` 目前固定為 `student_001`。
- API base URL 預設為 `/api`，可用 `REACT_APP_API_BASE_URL` 覆蓋。
- 若要透過後端提供正式版學生端，需先 build，再由 Express 於 `/student` 提供，且 backend 會對 `/student/*` 做 SPA fallback。
