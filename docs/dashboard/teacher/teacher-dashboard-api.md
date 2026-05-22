# 老師端 Dashboard API

> 狀態：已實作  
> 後端實作路徑：`backend/src/routes/teacherRoutes.js`、`backend/src/routes/dashboardRoutes.js`  
> 統計邏輯：`backend/src/services/dashboardService.js`  
> Quiz 作答 seed：`demoData/demoData1` 的 `studentAnalyticsSummary.generatedExamAccuracy` → `exam_submissions` / `exam_answers`

## 文件目的

這份文件整合原本的正式版與 draft，保留：

- 已實作端點與實際回傳欄位
- 前端頁面和 API 對照
- 關鍵計算規則
- 向後相容端點的定位

## 回應格式

- 成功：`{ "success": true, "data": ... }`
- 失敗：`{ "success": false, "error": { "code": "STRING", "message": "說明" } }`
- 時間：ISO 8601（建議 `+08:00`）
- 欄位：camelCase

## 頁面對照

| 前端頁面 | API | 說明 |
|------|------|------|
| 共用班級／期間篩選 | `GET /api/teacher/classes` | 班級下拉選單 |
| Dashboard | `GET /api/dashboard/overview` | KPI、錯題趨勢、Top5、無錯題學生、提示列 |
| Dashboard 圖表 | `GET /api/dashboard/charts` | 錯題趨勢、知識點分布、單元分布 |
| 學生列表 | `GET /api/dashboard/students` | 搜尋、排序、分頁 |
| 學生詳情 | `GET /api/dashboard/students/:studentId/detail` | 一支聚合詳情 API |
| 知識點管理 | `GET /api/dashboard/concepts-risk` | 風險 KPI、Top5、風險表 |

---

## 共用 Query 參數

| 參數 | 必填 | 說明 |
|------|------|------|
| `classId` | 多數端點必填 | 班級 ID；`scope=allClasses` 時可省略 |
| `scope` | 否 | `allClasses`：彙總老師可見在冊學生，`overview`、`students` 支援 |
| `range` | 是 | `7d` \| `30d` \| `custom` |
| `from`, `to` | `custom` 時必填 | `YYYY-MM-DD` 或完整 ISO；未帶時區會補 `+08:00` |

### Quiz 答對率

統計期間內、班級範圍內學生的 `exam_submissions` + `exam_answers`，以 `submitted_at` 落在 `[from, to]` 為準。

| 層級 | 公式 | 欄位 |
|------|------|------|
| 全班 | 正確總題數 ÷ 總答題數 | `generatedExamAccuracy.accuracyRate` |
| 單生 | 同上 | `generatedExamAccuracyRate` 或 `generatedExamAccuracy.accuracyRate` |

- `correctCount`：期間內 `exam_answers.is_correct = 1` 的筆數
- `totalAnswered`：期間內有計入的作答題數
- `totalAnswered === 0` 時：全班 `accuracyRate` 為 `null`；學生列表為 `null`

### frontend-prototype 相容

`frontend-prototype` 使用以下 class id 與欄位名稱；後端 teacher dashboard API 會支援這些格式：

| 前端 class id | 說明 |
|------|------|
| `all` | 全部學生 |
| `class_jh1_bio_01` | 國一生物1班 |
| `class_jh1_bio_02` | 國一生物2班 |
| `class_jh3_bio_review_01` | 國三複習生物班 |

相容欄位：

- `GET /api/dashboard/students` 回傳 array，學生列包含 `quizAccuracy`（百分比整數）與 `generatedExamAccuracyRate`（0~1）
- `GET /api/dashboard/concepts-risk` 額外回傳 `totalMistakeCount`、`mostImpactedConcept`、`topWeakConcepts`、`conceptRiskList`
- `conceptRiskList[].riskLevel` 使用 `高`、`中`、`低`
- 支援 `range=14d`
- 支援 `sortBy=quizAccuracy`

---

## 1. `GET /api/teacher/classes`

用途：班級下拉選單。

```bash
curl "http://localhost:3001/api/teacher/classes"
```

```json
{
  "success": true,
  "data": [
    {
      "id": "class_jh1_bio_01",
      "name": "國一生物1班",
      "gradeYear": "高二",
      "subjectId": "subject_bio",
      "subjectName": "生物"
    }
  ]
}
```

前端若需要「全部學生」，建議用虛擬選項搭配 `scope=allClasses`。

---

## 2. `GET /api/dashboard/overview`

用途：Dashboard 主頁。

### UI 對照

| UI 區塊 | Response 欄位 |
|------|------|
| 頂部提示「本期間有 N 位學生無錯題紀錄」 | `studentsWithNoMistakes.count` 或 `alertBanner.message` |
| 期間新增錯題 | `newMistakeCount` |
| 活躍學生數 | `activeStudentCount` |
| 平均 Quiz 答對率 | `generatedExamAccuracy` |
| 錯題趨勢 | `mistakeTrend[]` |
| 最常錯知識點 Top 5 | `topConceptsByMistakeCount[]` |
| 無錯題學生表格 | `studentsWithNoMistakes.students[]` |

### Query

| Query | 說明 |
|-------|------|
| `classId` | 必填（除非 `scope=allClasses`） |
| `range`, `from`, `to` | 見共用參數 |
| `limit` | Top 知識點筆數，預設 `5` |

```bash
curl "http://localhost:3001/api/dashboard/overview?classId=class_jh1_bio_01&range=30d"
```

主要 `data` 欄位：

| 欄位 | 說明 |
|------|------|
| `enrolledStudentCount` | 在冊學生數 |
| `newMistakeCount` | 期間新錯題筆數 |
| `activeStudentCount` | 期間至少 1 筆錯題的學生數 |
| `generatedExamAccuracy` | `{ correctCount, totalAnswered, accuracyRate }` |
| `mistakeTrend` | `[{ date, count }]` |
| `topConceptsByMistakeCount` | `[{ conceptId, conceptName, mistakeCount, rank }]` |
| `studentsWithNoMistakes` | `{ count, students[] }` |
| `alertBanner` | `{ type, message }` |

### 計算定義

| 欄位 | 定義 |
|------|------|
| `newMistakeCount` | 期間內 `mistake_records` 新增筆數 |
| `activeStudentCount` | 期間內至少 1 筆新錯題的 distinct 學生數 |
| `topConceptsByMistakeCount` | 全班錯題筆數加總 per concept，取 Top `limit` |
| `studentsWithNoMistakes` | 在冊且 `mistakeCount === 0` 的學生 |

### 與舊 `summary` 的關係

- 推薦以前端主頁使用 `overview`
- `GET /api/dashboard/summary` 視為 `overview` 的子集或向後相容端點
- `weeklyMistakeCount` 對應 `newMistakeCount`

---

## 2.1 `GET /api/dashboard/charts`

用途：Dashboard 主頁圖表資料，對應 `frontend-prototype` 的 `apiGetClassCharts()`。

```bash
curl "http://localhost:3001/api/dashboard/charts?classId=class_jh1_bio_01&range=30d"
```

主要欄位：

- `mistakeTrend`
- `conceptDistribution`
- `unitDistribution`

---

## 3. `GET /api/dashboard/students`

用途：學生列表頁。

### UI 對照

| 表格欄位 | Response 欄位 |
|------|------|
| 學生 | `name` |
| 年級 | `gradeYear` |
| 期間錯題數 | `mistakeCount` |
| 不熟悉知識點數 | `weakConceptCount` |
| 本月活躍天數 | `activeDays` |
| Quiz 答對率 | `generatedExamAccuracyRate` |

### Query

| Query | 說明 |
|-------|------|
| `q` | 姓名部分比對 |
| `sortBy` | `mistakeCount` \| `weakConceptCount` \| `activeDays` \| `generatedExamAccuracyRate` \| `quizAccuracy` \| `name` |
| `sortOrder` | `asc` \| `desc`（預設 `desc`） |
| `page`, `limit` | 分頁，可省略 |

```bash
curl "http://localhost:3001/api/dashboard/students?classId=class_jh1_bio_01&range=30d&sortBy=mistakeCount"
```

`data.students[]` 每筆含：

- `studentId`
- `name`
- `gradeYear`
- `classId`
- `className`
- `mistakeCount`
- `weakConceptCount`
- `activeDays`
- `generatedExamAccuracyRate`

### 計算定義

| 欄位 | 定義 |
|------|------|
| `weakConceptCount` | 該生期間錯題中的 distinct `conceptId` |
| `activeDays` | 期間內有新增錯題的 distinct 日期數 |
| `generatedExamAccuracyRate` | 該生期間正確總題數 ÷ 總答題數；無作答回 `null` |

---

## 4. `GET /api/dashboard/students/:studentId/detail`

用途：學生詳情頁，一支聚合。

### UI 對照

| UI 區塊 | Response 欄位 |
|------|------|
| 標題列 | `name`、`gradeYear`、`className`、`joinedAt` |
| 四個 KPI | `mistakeCount`、`weakConceptCount`、`activeDays`、`generatedExamAccuracy` |
| 矯正狀態建議列 | `insightBanner` |
| 常錯知識點分布 | `conceptDistribution[]` |
| 錯題趨勢 | `mistakeTrend[]` |
| 常錯標籤 | `frequentMistakeTags[]` |
| 錯題紀錄列表 | `mistakeRecords[]` |

### Query

| Query | 說明 |
|-------|------|
| `classId` | 必填 |
| `mistakeLimit` | 錯題列表筆數，預設 `20` |
| `weakConceptLimit` | 常錯標籤數，預設 `4` |

```bash
curl "http://localhost:3001/api/dashboard/students/student_001/detail?classId=class_jh1_bio_01&range=30d"
```

主要欄位：

- `generatedExamAccuracy`
- `insightBanner`
- `conceptDistribution`
- `mistakeTrend`
- `topWeakConcepts`
- `frequentMistakeTags`
- `mistakeRecords[]`

### 補充規則

- `insightBanner` 目前是 mock 規則，不是 AI 動態生成
- `mistakeRecords[].title` 優先用 `questionText`，否則退回 `aiSummary`，再不行為「未命名錯題」

---

## 5. `GET /api/dashboard/concepts-risk`

用途：知識點管理頁，需要指定 `classId`。

```bash
curl "http://localhost:3001/api/dashboard/concepts-risk?classId=class_jh1_bio_01&range=30d"
```

主要欄位：

- `totalMistakesInPeriod`
- `highRiskConceptCount`
- `mostAffectedConcept`
- `mostMistakenConcept`
- `topConceptsByMistakeCount`
- `teachingSuggestion`
- `conceptRiskRows[]`

### UI 對照

| UI 區塊 | Response 欄位 |
|------|------|
| 期間總錯題數 | `totalMistakesInPeriod` |
| 高風險知識點數 | `highRiskConceptCount` |
| 最多學生卡關 | `mostAffectedConcept` |
| 最常錯知識點 | `mostMistakenConcept` |
| 最常錯 Top 5 | `topConceptsByMistakeCount[]` |
| 教學建議 | `teachingSuggestion` |
| 風險列表 | `conceptRiskRows[]` |

### KPI 與排名規則

| 欄位 | 算法 |
|------|------|
| `highRiskConceptCount` | 符合高風險條件的 distinct 知識點數 |
| `mostAffectedConcept` | 影響學生數最多；同分時錯題數較多者優先 |
| `mostMistakenConcept` | 錯題筆數第一名 |

### 風險等級

| 等級 | 條件 |
|------|------|
| `high` | 期間錯題數 ≥ 5，或影響學生數 ≥ 3 |
| `medium` | 期間錯題數 ≥ 3，或影響學生數 ≥ 2，且非 `high` |
| `low` | 不符合高／中 |

- `affectedRatio` 會回傳給 UI，但不參與風險分級
- `suggestedAction` 目前是 mock 規則

---

## 6. 向後相容端點

| 端點 | 說明 |
|------|------|
| `GET /api/dashboard/summary` | 由 `overview` 衍生的子集 |
| `GET /api/dashboard/students/:id/concepts` | 詳情子集 |
| `GET /api/dashboard/students/:id/charts` | 含 `generatedExamAccuracyTrend` |

---

## 錯誤碼

| code | 說明 |
|------|------|
| `INVALID_RANGE` | 缺少或無效的 `range` |
| `INVALID_CUSTOM_RANGE` | `custom` 時 `from`/`to` 無效 |
| `MISSING_CLASS_ID` | 缺少 `classId` |
| `CLASS_NOT_FOUND` | 班級不存在 |
| `STUDENT_NOT_FOUND` | 學生不存在 |
| `STUDENT_NOT_IN_CLASS` | 學生不在該班 |
| `SCOPE_NOT_SUPPORTED` | 該端點不支援 `scope=allClasses` |

---

## 本地驗證

```bash
cd backend
npm run db:init
npm run db:seed
npm start
```

demo 錯題與 Quiz 作答集中在 `2026-05-03`，除 `range=30d` 外也可用：

```bash
curl "http://localhost:3001/api/dashboard/overview?classId=class_jh1_bio_01&range=custom&from=2026-05-01&to=2026-05-10"
```

`class_jh1_bio_01` 預期 Quiz 全班約 **5 / 7 ≈ 0.71**，其中：

- `student_001` 約 `2 / 3`
- `student_002` 約 `3 / 4`
