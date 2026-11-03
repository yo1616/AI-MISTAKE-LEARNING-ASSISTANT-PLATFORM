# Backend

後端是以 Express 與 SQLite 組成的整合層，負責提供學生端與老師端 API、處理資料持久化、整合 AI 服務，並提供老師端與已建置學生端的靜態資源。

## 模組職責

- 提供 `/api` 下的 REST API
- 管理 SQLite 資料存取
- 彙整學生與班級分析資料
- 串接 mock / real AI 服務
- 於 `/teacher/` 與 `/student` 提供前端靜態資源

## 重要檔案

- 入口： `backend/server.js`
- Express 組裝： `backend/src/app.js`
- 路由： `backend/src/routes/`
- 服務層： `backend/src/services/`
- 資料表 schema： `backend/src/db/schema.sql`
- seed script： `backend/src/db/seedDb.js`

## 開發方式

安裝相依套件：

```bash
npm install
```

初始化並灌入資料庫：

```bash
npm run db:init
npm run db:seed
```

啟動後端：

```bash
npm start
```

預設 port：`3001`

## 相關正式文件

- API 文件： `docs/api.md`
- 資料模型： `docs/data-model.md`
- AI 串接： `docs/ai-integration.md`

## 維護注意事項

- `backend/src/routes/dashboardRoutes.js` 目前直接導出老師端 dashboard 路由群組。
- 前端靜態資源的提供方式定義在 `backend/src/app.js`。
- 多數學生端與老師端流程都依賴 seed data，啟動前應先完成 `db:init` 與 `db:seed`。
