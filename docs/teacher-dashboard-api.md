# 老師端 Dashboard API（已實作）

> 後端實作路徑：`backend/src/routes/teacherRoutes.js`、`backend/src/routes/dashboardRoutes.js`  
> 統計邏輯：`backend/src/services/dashboardService.js`  
> Quiz 作答 seed：`demoData/demoData1` 的 `studentAnalyticsSummary.generatedExamAccuracy` → `exam_submissions` / `exam_answers`

## 回應格式

- 成功：`{ "success": true, "data": ... }`
- 失敗：`{ "success": false, "error": { "code": "STRING", "message": "說明" } }`
- 時間：ISO 8601（建議 `+08:00`）
- 欄位：camelCase

## 共用 Query 參數

| 參數 | 必填 | 說明 |
|------|------|------|
| `classId` | 多數端點必填 | 班級 ID；`scope=allClasses` 時可省略（見各端點） |
| `scope` | 否 | `allClasses`：彙總老師可見在冊學生（`overview`、`students` 支援） |
| `range` | 是 | `7d` \| `30d` \| `custom` |
| `from`, `to` | `custom` 時必填 | `YYYY-MM-DD` 或完整 ISO；未帶時區會補 `+08:00` |

### Quiz 答對率（生成考卷）

統計期間內、班級範圍內學生的 `exam_submissions` + `exam_answers`（以 `submitted_at` 落在 `[from, to]` 為準）：

| 層級 | 公式 | 欄位 |
|------|------|------|
| 全班 | 正確總題數 ÷ 總答題數 | `generatedExamAccuracy.accuracyRate` |
| 單生 | 同上 | `generatedExamAccuracyRate` 或 `generatedExamAccuracy.accuracyRate` |

- `totalAnswered === 0` 時：全班 `accuracyRate` 為 `null`；學生列表為 `null`。

---

## 1. `GET /api/teacher/classes`

班級下拉選單。

```bash
curl "http://localhost:3001/api/teacher/classes"
```

```json
{
  "success": true,
  "data": [
    {
      "id": "class_hs2_bio_01",
      "name": "高二生物班",
      "gradeYear": "高二",
      "subjectId": "subject_bio",
      "subjectName": "生物"
    }
  ]
}
```

---

## 2. `GET /api/dashboard/overview`

Dashboard 頁：KPI、錯題趨勢、Top5、無錯題學生、提示列。

| Query | 說明 |
|-------|------|
| `classId` | 必填（除非 `scope=allClasses`） |
| `range`, `from`, `to` | 見共用參數 |
| `limit` | Top 知識點筆數，預設 `5` |

```bash
curl "http://localhost:3001/api/dashboard/overview?classId=class_hs2_bio_01&range=30d"
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

---

## 3. `GET /api/dashboard/students`

學生列表頁。

| Query | 說明 |
|-------|------|
| `q` | 姓名部分比對 |
| `sortBy` | `mistakeCount` \| `weakConceptCount` \| `activeDays` \| `generatedExamAccuracyRate` \| `name` |
| `sortOrder` | `asc` \| `desc`（預設 `desc`） |
| `page`, `limit` | 分頁（可省略，一次回傳全班） |

```bash
curl "http://localhost:3001/api/dashboard/students?classId=class_hs2_bio_01&range=30d&sortBy=mistakeCount"
```

`data.students[]` 每筆含：`studentId`、`name`、`gradeYear`、`classId`、`className`、`mistakeCount`、`weakConceptCount`、`activeDays`、`generatedExamAccuracyRate`。

---

## 4. `GET /api/dashboard/students/:studentId/detail`

學生詳情（一支聚合）。

| Query | 說明 |
|-------|------|
| `classId` | **必填** |
| `mistakeLimit` | 錯題列表筆數，預設 `20` |
| `weakConceptLimit` | 常錯標籤數，預設 `4` |

```bash
curl "http://localhost:3001/api/dashboard/students/student_001/detail?classId=class_hs2_bio_01&range=30d"
```

含：`generatedExamAccuracy`、`insightBanner`（mock）、`conceptDistribution`、`mistakeTrend`、`topWeakConcepts`、`frequentMistakeTags`、`mistakeRecords[]`。

---

## 5. `GET /api/dashboard/concepts-risk`

知識點管理頁（需指定 `classId`）。

```bash
curl "http://localhost:3001/api/dashboard/concepts-risk?classId=class_hs2_bio_01&range=30d"
```

含：`totalMistakesInPeriod`、`highRiskConceptCount`、`mostAffectedConcept`、`mostMistakenConcept`、`topConceptsByMistakeCount`、`teachingSuggestion`（mock）、`conceptRiskRows[]`（含 `riskLevel`、`suggestedAction`）。

### KPI 與排名規則（期間內、班級範圍）

| 欄位 | 算法 |
|------|------|
| **高風險知識點數** `highRiskConceptCount` | 符合「高」風險的 distinct 知識點數 |
| **最多學生卡關** `mostAffectedConcept` | **影響學生數**（distinct 出錯學生）最多；同分時以錯題數較多者優先 |
| **最常錯知識點** `mostMistakenConcept` | **錯題筆數**排名第一名（同 `topConceptsByMistakeCount[0]`） |

### 風險等級（`conceptRiskRows[].riskLevel`）

| 等級 | 條件（滿足任一即成立；先判高再判中） |
|------|--------------------------------------|
| `high` | 期間錯題數 ≥ 5，或影響學生數 ≥ 3 |
| `medium` | 期間錯題數 ≥ 3，或影響學生數 ≥ 2（且非 `high`） |
| `low` | 不符合高／中 |

`affectedRatio` 仍回傳（`affectedStudentCount / enrolledStudentCount`）供 UI 參考，**不**用於風險分級。

---

## 6. 向後相容（README 舊端點）

| 端點 | 說明 |
|------|------|
| `GET /api/dashboard/summary` | 由 `overview` 衍生的子集（`weeklyMistakeCount`、`topWeakConcepts` 等） |
| `GET /api/dashboard/students/:id/concepts` | 詳情子集 |
| `GET /api/dashboard/students/:id/charts` | 含 `generatedExamAccuracyTrend`（依 submission 日期聚合） |

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
curl "http://localhost:3001/api/dashboard/overview?classId=class_hs2_bio_01&range=custom&from=2026-05-01&to=2026-05-10"
```

`class_hs2_bio_01` 預期 Quiz 全班約 **5 / 7 ≈ 0.71**（`student_001` 2/3、`student_002` 3/4）。
