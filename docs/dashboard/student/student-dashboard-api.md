# 學生端 Dashboard API 規格

> 狀態：draft
> 目標：支援學生端「分析表」頁面
> 原則：成功回傳 `{ success, data }`，失敗回傳 `{ success, error }`，時間使用 ISO 8601，欄位使用 camelCase

---

## 1. 頁面需求

學生端分析表在選定期間內，需要顯示每位學生自己的學習統計：

- 總錯題數：期間內上傳並建立的錯題筆數
- 總概念數：期間內錯題所涵蓋的知識點數量
- 答對率：期間內 Quiz 答對題數 / 期間內 Quiz 總作答題數
- 錯誤分布：依單元統計錯題數
- 常錯知識點：依知識點名稱統計錯題數

---

## 2. API 設計建議

建議學生端分析表使用一支主 API 完成，不要把 KPI、單元分布、知識點排行拆成多支 API。

### GET `/api/students/:studentId/dashboard`

用途：取得單一學生在指定期間內的 Dashboard 資料。

範例：

```bash
curl "http://localhost:3001/api/students/student_001/dashboard?from=2026-04-21&to=2026-05-21"
```

如果要和現有 dashboard route 風格一致，也可以改成：

### GET `/api/dashboard/students/:studentId/summary`

兩種命名都可以，但建議正式實作只保留一種。

---

## 3. Query 參數

| 參數 | 必填 | 說明 |
|------|------|------|
| `from` | 是 | 起始日期，格式 `YYYY-MM-DD` |
| `to` | 是 | 結束日期，格式 `YYYY-MM-DD` |
| `classId` | 否 | 若同一學生可能跨班級統計，可加入班級篩選；若學生端只看自己可先不需要 |
| `unitLimit` | 否 | 錯誤分布最多回傳幾個單元，預設可為 `10` |
| `conceptLimit` | 否 | 常錯知識點最多回傳幾筆，預設可為 `10` |

### 期間定義

- `mistake_records.created_at` 落在期間內，算入錯題統計
- `exam_submissions.submitted_at` 落在期間內，算入 Quiz 統計
- 建議實際查詢時將日期轉為：
  - `from`: `YYYY-MM-DDT00:00:00+08:00`
  - `to`: `YYYY-MM-DDT23:59:59+08:00`

---

## 4. Response 結構

```json
{
  "success": true,
  "data": {
    "studentId": "student_001",
    "studentName": "王哈哈",
    "from": "2026-04-21T00:00:00+08:00",
    "to": "2026-05-21T23:59:59+08:00",
    "summary": {
      "totalMistakes": 12,
      "totalMistakesIncrease": {
        "currentCount": 12,
        "previousCount": 109,
        "increaseRate": 0.11009174311926606
      },
      "totalConcepts": 5,
      "totalConceptsIncrease": {
        "currentCount": 5,
        "previousCount": 96,
        "increaseRate": 0.052083333333333336
      },
      "quizAccuracy": {
        "correctCount": 18,
        "totalAnswered": 24,
        "accuracyRate": 0.75,
        "increase": {
          "currentCount": 18,
          "previousCount": 212,
          "increaseRate": 0.08490566037735849
        }
      },
      "quizAccuracyIncrease": {
        "currentCount": 18,
        "previousCount": 212,
        "increaseRate": 0.08490566037735849
      }
    },
    "unitDistribution": [
      {
        "unitId": "unit_bio_002",
        "unitName": "單元二 呼吸作用",
        "mistakeCount": 6,
        "percentage": 0.5
      },
      {
        "unitId": "unit_bio_001",
        "unitName": "單元一 人體的運輸與防禦",
        "mistakeCount": 6,
        "percentage": 0.5
      }
    ],
    "topWeakConcepts": [
      {
        "conceptId": "concept_bio_003",
        "conceptName": "氣體交換",
        "mistakeCount": 3
      },
      {
        "conceptId": "concept_bio_001",
        "conceptName": "血液循環方向",
        "mistakeCount": 2
      }
    ]
  }
}
```

---

## 5. 欄位定義

### 5.1 Summary

| 欄位 | 型別 | 說明 |
|------|------|------|
| `summary.totalMistakes` | number | 期間內錯題總筆數 |
| `summary.totalMistakesIncrease.currentCount` | number | 選取期間內新增錯題數，等於 `summary.totalMistakes` |
| `summary.totalMistakesIncrease.previousCount` | number | `from` 以前該學生累積錯題數 |
| `summary.totalMistakesIncrease.increaseRate` | number \| null | `currentCount / previousCount`，前端顯示百分比時乘 100；若 `previousCount = 0` 回 `null` |
| `summary.totalConcepts` | number | 期間內 distinct `conceptId` 數量 |
| `summary.totalConceptsIncrease.currentCount` | number | 選取期間內新增 distinct `conceptId` 數量，等於 `summary.totalConcepts` |
| `summary.totalConceptsIncrease.previousCount` | number | `from` 以前該學生錯題涉及的累積 distinct `conceptId` 數量 |
| `summary.totalConceptsIncrease.increaseRate` | number \| null | `currentCount / previousCount`，前端顯示百分比時乘 100；若 `previousCount = 0` 回 `null` |
| `summary.quizAccuracy.correctCount` | number | 期間內 Quiz 作答正確題數 |
| `summary.quizAccuracy.totalAnswered` | number | 期間內 Quiz 總作答題數 |
| `summary.quizAccuracy.accuracyRate` | number \| null | `correctCount / totalAnswered`，範圍 0~1；若無作答則回 `null` |
| `summary.quizAccuracy.increase.currentCount` | number | 選取期間內 Quiz 答對題數，等於 `summary.quizAccuracy.correctCount` |
| `summary.quizAccuracy.increase.previousCount` | number | `from` 以前該學生累積 Quiz 答對題數 |
| `summary.quizAccuracy.increase.increaseRate` | number \| null | `currentCount / previousCount`，前端顯示百分比時乘 100；若 `previousCount = 0` 回 `null` |
| `summary.quizAccuracyIncrease` | object | 同 `summary.quizAccuracy.increase`，提供給卡片直接取用 |

### 5.2 錯誤分布

依單元彙總錯題數，給前端畫圓環圖或列表。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `unitDistribution[].unitId` | string \| null | 單元 id |
| `unitDistribution[].unitName` | string | 單元名稱 |
| `unitDistribution[].mistakeCount` | number | 該單元錯題數 |
| `unitDistribution[].percentage` | number | 該單元錯題數 / 總錯題數，範圍 0~1 |

### 5.3 常錯知識點

依知識點名稱顯示排行。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `topWeakConcepts[].conceptId` | string \| null | 知識點 id |
| `topWeakConcepts[].conceptName` | string | 知識點名稱 |
| `topWeakConcepts[].mistakeCount` | number | 該知識點在期間內的錯題數 |

---

## 6. 計算規則

### 總錯題數

定義：該學生在指定期間內新增的 `mistake_records` 筆數。

```text
totalMistakes = count(mistake_records)
where student_id = :studentId
and created_at between from and to
```

新增百分比：

```text
totalMistakesIncrease.increaseRate =
  count(mistake_records where created_at between from and to)
  / count(mistake_records where created_at < from)
```

### 總概念數

定義：該學生在指定期間內錯題所涉及的不重複知識點數。

```text
totalConcepts = count(distinct concept_id)
where student_id = :studentId
and created_at between from and to
```

新增百分比：

```text
totalConceptsIncrease.increaseRate =
  count(distinct concept_id where created_at between from and to)
  / count(distinct concept_id where created_at < from)
```

### 答對率

定義：該學生在指定期間內 Quiz 作答的正確題數除以總作答題數。

```text
accuracyRate = correctCount / totalAnswered
```

其中：

- `correctCount` = `exam_answers.is_correct = 1` 的筆數
- `totalAnswered` = 該期間內所有 `exam_answers` 筆數
- 若 `totalAnswered = 0`，建議回傳 `accuracyRate: null`

答對題數新增百分比：

```text
quizAccuracyIncrease.increaseRate =
  count(correct exam_answers where submitted_at between from and to)
  / count(correct exam_answers where submitted_at < from)
```

若分母為 0，`increaseRate` 回 `null`。

### 錯誤分布

定義：將期間內錯題依 `unit_id` 分組後計數。

```text
unit mistake percentage = unitMistakeCount / totalMistakes
```

### 常錯知識點

定義：將期間內錯題依 `concept_id` 分組後計數，依 `mistakeCount DESC` 排序。

---

## 7. SQL / 資料來源建議

### 7.1 總錯題數與總概念數

資料表：

- `mistake_records`

需要欄位：

- `student_id`
- `concept_id`
- `unit_id`
- `created_at`

### 7.2 答對率

資料表：

- `exam_submissions`
- `exam_answers`

需要欄位：

- `exam_submissions.student_id`
- `exam_submissions.submitted_at`
- `exam_answers.submission_id`
- `exam_answers.is_correct`

### 7.3 單元名稱與知識點名稱

資料表：

- `units`
- `concepts`

需要欄位：

- `units.id`
- `units.name`
- `concepts.id`
- `concepts.name`

---

## 8. 前端欄位對照

| UI 區塊 | Response 欄位 |
|------|------|
| 總錯題數 | `summary.totalMistakes` |
| 總概念數 | `summary.totalConcepts` |
| 答對率 | `summary.quizAccuracy.accuracyRate` |
| 錯誤分布 | `unitDistribution[]` |
| 常錯知識點 | `topWeakConcepts[]` |

前端顯示時：

- 答對率可轉成 `%` 顯示，例如 `0.75 -> 75%`
- `unitDistribution[].percentage` 可轉成 `%` 顯示，例如 `0.5 -> 50%`

---

## 9. 錯誤回傳

### 期間格式錯誤

```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "from and to are required in YYYY-MM-DD format"
  }
}
```

### 學生不存在

```json
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Student not found"
  }
}
```

### 起訖日期顛倒

```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_ORDER",
    "message": "from must be earlier than or equal to to"
  }
}
```

---

## 10. MVP 實作建議

如果你現在要先把學生端 dashboard 接起來，MVP 建議只做這一支：

### GET `/api/students/:studentId/dashboard`

原因：

- 一支就能滿足目前分析表畫面
- 前端只需要打一個 request
- 後端比較容易維護欄位一致性
- 之後若要補趨勢、比較前一期、成長率，再往 `summary` 裡擴充即可

### MVP 必做欄位

- `summary.totalMistakes`
- `summary.totalConcepts`
- `summary.quizAccuracy`
- `unitDistribution`
- `topWeakConcepts`

### MVP 可先不做

- `+11.01%` 這類成長率
- 與上一期間比較
- 多班級切換下的跨班彙總
- 每日趨勢折線圖

---

## 11. 與目前畫面對齊的補充

你現在這張分析表上的資料意義應對如下：

- `總錯題數`：看 `summary.totalMistakes`
- `總概念數`：看 `summary.totalConcepts`
- `答對率`：看 `summary.quizAccuracy.accuracyRate`
- `錯誤分布`：看 `unitDistribution[].unitName`
- `常錯知識點`：看 `topWeakConcepts[].conceptName`

目前畫面上的綠色成長百分比若還沒有真實比較邏輯，建議先拿掉或先固定不顯示，避免誤導。
