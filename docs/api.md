# API 文件

## 共用規則

- Base URL：`http://localhost:3001/api`
- 成功格式：

```json
{
  "success": true,
  "data": {}
}
```

- 失敗格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## 健康檢查與 AI 狀態

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | 後端健康檢查 |
| `GET` | `/ai/status` | 回傳目前 AI mode、provider、是否有 key 與 model |
| `POST` | `/ai/ask` | 取得 AI 解題回覆與觀念推薦 |
| `POST` | `/ai/practice-question` | 依觀念生成單題練習題 |

## 基礎字典資料

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/subjects` | 取得科目列表 |
| `GET` | `/subjects/:subjectId/units` | 取得某科目下的單元 |
| `GET` | `/units/:unitId/subunits` | 取得某單元下的子單元 |
| `GET` | `/units/:unitId/sub-units` | 與上方相同的 alias |
| `GET` | `/concepts` | 依科目、單元或子單元查詢觀念 |

## 學生端 API

### 學生資料與班級

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/students` | 取得學生列表 |
| `GET` | `/students/:studentId` | 取得單一學生資料 |
| `GET` | `/students/:studentId/classes` | 取得學生對應班級 |

### 學生複習資料

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/students/:studentId/mistakes` | 取得學生錯題 |
| `GET` | `/students/:studentId/concept-notes` | 取得學生觀念筆記 |
| `GET` | `/students/:studentId/favorites` | 取得收藏摘要 |
| `GET` | `/students/:studentId/favorites/mistakes` | 取得收藏錯題 |
| `GET` | `/students/:studentId/favorites/concept-notes` | 取得收藏觀念筆記 |
| `GET` | `/students/:studentId/chat-sessions` | 取得聊天 session 列表 |
| `GET` | `/students/:studentId/generated-exams` | 取得生成考題紀錄 |

### 學生分析

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/students/:studentId/analytics/summary` | 學生 dashboard 摘要 |
| `GET` | `/students/:studentId/analytics/charts` | 學生 dashboard 圖表資料 |
| `GET` | `/students/:studentId/dashboard` | 聚合後的學生 dashboard 資料 |

常用 query 參數：

- `range`：`7d`、`30d` 或 `custom`
- `from`、`to`：當 `range=custom` 時使用
- `limit`：限制 top-N 類型的資料筆數

## 聊天紀錄 API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/chat-sessions` | 建立 session 並送出第一題 |
| `GET` | `/chat-sessions/:sessionId` | 取得單一 session |
| `GET` | `/chat-sessions/:sessionId/messages` | 取得某 session 的訊息 |
| `POST` | `/chat-sessions/:sessionId/messages` | 在既有 session 中新增訊息 |
| `PATCH` | `/chat-sessions/:sessionId/title` | 更新某個 session 的標題 |
| `DELETE` | `/chat-sessions/:sessionId` | 刪除某個 session |

建立與續傳流程中常見欄位：

- `studentId`
- `subjectId`
- `unitId`
- `subUnitId`
- `inputType`: `text`, `photo`, or `photo_text`
- `questionText`
- `questionImageUrl`
- `messageType`
- `questionGroupId`

更新標題時常見欄位：

- `title`

## 錯題 API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/mistakes` | 建立錯題紀錄 |
| `GET` | `/mistakes/:mistakeRecordId` | 取得單一錯題 |
| `GET` | `/mistakes/:mistakeRecordId/related-notes` | 取得相關觀念筆記 |
| `PATCH` | `/mistakes/:mistakeRecordId/star` | 更新收藏狀態 |

常用篩選參數：

- `starredOnly`
- `unitId`
- `subUnitId`
- `conceptId`
- `excludeInvalid`

## 觀念筆記 API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/concept-notes` | 建立觀念筆記 |
| `GET` | `/concept-notes/:noteId` | 取得單一觀念筆記 |
| `GET` | `/concept-notes/:noteId/related-mistakes` | 取得相關錯題 |
| `PATCH` | `/concept-notes/:noteId/star` | 更新收藏狀態 |

## 生成考題 API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/generated-exams/:examId` | 取得單一生成考題 |
| `GET` | `/generated-exams/:examId/questions` | 取得題目列表 |
| `GET` | `/generated-exams/:examId/source-mistakes` | 取得出題來源錯題 |

目前學生端前端生成練習題時，入口主要是 `POST /ai/practice-question`；若要查詢已保存的生成考題資料，則走 `/generated-exams` 相關路徑。

## 老師端基礎 API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/teacher/classes` | 取得老師端班級篩選資料 |

## 老師端 Dashboard API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/dashboard/overview` | 班級完整總覽 |
| `GET` | `/dashboard/summary` | 給首頁摘要卡片使用的 summary |
| `GET` | `/dashboard/charts` | 班級圖表資料 |
| `GET` | `/dashboard/concepts-risk` | 知識點風險分析 |
| `GET` | `/dashboard/students` | 某班級下的學生列表 |
| `GET` | `/dashboard/students/:studentId/detail` | 單一學生詳情聚合資料 |
| `GET` | `/dashboard/students/:studentId/concepts` | 單一學生弱點觀念 |
| `GET` | `/dashboard/students/:studentId/charts` | 老師端內的學生圖表資料 |

常用 query 參數：

- `classId`
- `range`
- `from`
- `to`
- `sortBy`
- `limit`

## 文件依據

這份文件以實際掛載的路由為準：

- `backend/src/app.js`
- `backend/src/routes/`

若 controller 或 route 有調整，這份文件也應同步更新。
