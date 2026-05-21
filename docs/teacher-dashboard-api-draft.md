# 老師端 Dashboard／統計 API 規格草稿

> **狀態**：已實作；正式文件見 [`teacher-dashboard-api.md`](teacher-dashboard-api.md)，`README.md` §8、`backend/API.md` §10。  
> **原則**：成功 `{ success, data }`、失敗 `{ success, error }`、ISO 8601、camelCase、`range` 為 `7d` | `30d` | `custom`（`custom` 時必填 `from`、`to`）。  
> **設計原則**：**一頁一主 API**；共用篩選參數；不為每張 KPI 卡或每張圖各開一支。

---

## 0. 前端頁面 ↔ API 對照（建議實作）

老師端側欄共 **3 個主頁** + **1 個詳情子頁**（由學生列表點「詳情」進入）。建議 **5 支 API**（含班級下拉）。


| 前端頁面          | 首次載入建議呼叫                                        | 備註                                |
| ------------- | ----------------------------------------------- | --------------------------------- |
| 共用：班級／期間篩選    | `GET /api/teacher/classes`                      | 下拉選單；進入老師端時可先打一次。                 |
| **Dashboard** | `GET /api/dashboard/overview`                   | 三 KPI、錯題趨勢、最常錯 Top5、無錯題學生表、頂部提示列。 |
| **學生列表**      | `GET /api/dashboard/students`                   | 表格 + 搜尋 + 排序；點列進詳情。               |
| **學生詳情**      | `GET /api/dashboard/students/:studentId/detail` | 四 KPI、建議列、兩圖、標籤、錯題列表；**一支聚合**。    |
| **知識點管理**     | `GET /api/dashboard/concepts-risk`              | 四 KPI、Top5 圖、教學建議、風險表。            |


```
teacher/classes          → 三頁共用篩選
dashboard/overview       → Dashboard 頁
dashboard/students       → 學生列表頁
dashboard/students/:id/detail → 學生詳情頁
dashboard/concepts-risk  → 知識點管理頁
```

**不建議**：詳情頁拆成 `concepts` + `charts` + `mistakes` 三支（除非堅持零新路徑、完全沿用 README 舊端點）。

---

## 1. 共用 Query 參數

三頁資料 API（`overview`、`students`、`concepts-risk`、`detail`）共用：


| 參數           | 必填           | 說明                                                      |
| ------------ | ------------ | ------------------------------------------------------- |
| `classId`    | 與 `scope` 擇一 | 單一班級；UI「國一生物 1 班」等。                                     |
| `scope`      | 否            | `allClasses` = 老師名下在冊學生彙總（UI「全部學生」）；MVP 可先只做 `classId`。 |
| `range`      | 是            | `7d` | `30d` | `custom`（UI「近 7 天／近 30 天」）。              |
| `from`, `to` | `custom` 時必填 | 建議切日時區固定 `+08:00`，文件寫死避免趨勢圖錯日。                          |

### Quiz 答對率計算（生成考卷作答）

統計期間內、範圍內學生的生成考作答（`exam_submissions` + `exam_answers`，以 `submitted_at` 落在 `[from, to]` 為準）：

| 層級 | 公式 | API 欄位 |
|------|------|----------|
| **全班（Dashboard）** | **正確總題數 ÷ 總答題數** | `generatedExamAccuracy.accuracyRate` |
| **單一學生** | 同上，僅該生作答 | `generatedExamAccuracyRate` 或 `generatedExamAccuracy.accuracyRate` |

- `correctCount`：期間內 `exam_answers.is_correct = 1` 的筆數（正確總題數）。
- `totalAnswered`：期間內有計入的作答題數（總答題數）。
- `accuracyRate` = `correctCount / totalAnswered`（0～1）；`totalAnswered === 0` 時全班可回 `accuracyRate: null` 或 `0`（實作前與前端約定）；單一學生列表建議回 `null`。

**學生列表**另加：


| 參數              | 說明                           |
| --------------- | ---------------------------- |
| `q`             | 搜尋學生姓名（部分比對）。                |
| `sortBy`        | 見 §4。                        |
| `sortOrder`     | 可選 `asc` | `desc`，預設 `desc`。 |
| `page`, `limit` | 分頁；MVP 可整班一次回傳。              |


**學生詳情**另加：


| 參數                 | 說明                         |
| ------------------ | -------------------------- |
| `mistakeLimit`     | 錯題列表筆數，預設 `20`。            |
| `weakConceptLimit` | 常錯標籤／分布用，預設 `4`（對應 UI 前四）。 |


---

## 2. `GET /api/teacher/classes`

**用途**：側欄三頁頂部「班級／全部學生」下拉。

**Response**（沿用 README）：

```json
{
  "success": true,
  "data": [
    { "id": "class_hs1_bio_01", "name": "國一生物 1 班", "gradeYear": "國一", "subjectId": "subject_bio", "subjectName": "生物" }
  ]
}
```

前端可另加虛擬選項「全部學生」→ 打 API 時改傳 `scope=allClasses`（或約定省略 `classId`）。

---

## 3. `GET /api/dashboard/overview` — Dashboard 頁

### 3.1 UI 區塊對照


| UI 區塊                 | Response 欄位                                                     |
| --------------------- | --------------------------------------------------------------- |
| 頂部提示「本期間有 N 位學生無錯題紀錄」 | `studentsWithNoMistakes.count`（或 `alertBanner.message` mock 組字） |
| 期間新增錯題                | `newMistakeCount`                                               |
| 活躍學生數（期間新增錯題 > 0）     | `activeStudentCount`                                            |
| 平均 Quiz 答對率           | `generatedExamAccuracy`：`accuracyRate` = 正確總題數 ÷ 總答題數（見 §1） |
| 錯題趨勢（長條圖）             | `mistakeTrend[]`：`{ date, count }`                              |
| 最常錯知識點 Top 5（橫條圖）     | `topConceptsByMistakeCount[]`：依**錯題筆數**排序                       |
| 期間內無錯題紀錄之學生（表格）       | `studentsWithNoMistakes.students[]`                             |


### 3.2 Query

`classId` 或 `scope`、`range`、`from`、`to`、`limit`（Top5 預設 5）。

### 3.3 Response 範例

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "from": "2026-04-20T00:00:00+08:00",
    "to": "2026-05-20T23:59:59+08:00",
    "classId": "class_hs1_bio_01",
    "className": "國一生物 1 班",
    "subjectName": "生物",

    "enrolledStudentCount": 32,
    "newMistakeCount": 23,
    "activeStudentCount": 6,
    "generatedExamAccuracy": {
      "correctCount": 160,
      "totalAnswered": 192,
      "accuracyRate": 0.83
    },

    "mistakeTrend": [
      { "date": "2026-05-01", "count": 2 },
      { "date": "2026-05-03", "count": 4 }
    ],

    "topConceptsByMistakeCount": [
      {
        "conceptId": "concept_bio_005",
        "conceptName": "光合作用",
        "mistakeCount": 4,
        "rank": 1
      }
    ],

    "studentsWithNoMistakes": {
      "count": 3,
      "students": [
        {
          "studentId": "student_008",
          "name": "張雅筑",
          "gradeYear": "國一",
          "classId": "class_hs1_bio_01",
          "className": "國一生物 1 班",
          "mistakeCount": 0,
          "weakConceptCount": 0
        }
      ]
    },

    "alertBanner": {
      "type": "info",
      "message": "本期間有 3 位學生無錯題紀錄"
    }
  }
}
```

### 3.4 欄位定義


| 欄位                          | 定義                                                                   |
| --------------------------- | -------------------------------------------------------------------- |
| `newMistakeCount`           | 期間內 `mistake_records` 新增筆數（範圍內學生＋班級／科目篩選）。                           |
| `activeStudentCount`        | 期間內至少 1 筆新錯題的 distinct 學生數。                                          |
| `generatedExamAccuracy`     | 全班期間生成考：`correctCount`（正確總題數）、`totalAnswered`（總答題數）、`accuracyRate` = `correctCount / totalAnswered`。 |
| `topConceptsByMistakeCount` | 全班錯題筆數加總 per concept，取 Top `limit`。                                  |
| `studentsWithNoMistakes`    | 在冊且 `mistakeCount === 0`；表格「詳情」導向 §5 `detail`。                       |


### 3.5 與 README `summary` 的關係

實作可二選一併入正式文件：

- **推薦**：以 `overview` 為準；`summary` 標記 deprecated 或僅回傳子集。  
- `weeklyMistakeCount` → 對應 `newMistakeCount`（用語與 UI 一致）。

---

## 4. `GET /api/dashboard/students` — 學生列表頁

### 4.1 UI 區塊對照


| 表格欄位     | Response 欄位                                            |
| -------- | ------------------------------------------------------ |
| 學生       | `name`（可加 `avatarInitial` 由前端從姓名產生）                    |
| 年級       | `gradeYear`                                            |
| 期間錯題數    | `mistakeCount`                                         |
| 不熟悉知識點數  | `weakConceptCount`                                     |
| 本月活躍天數   | `activeDays`（見下方：與 `range` 一致，UI 文案可仍寫「本月」若 range=30d） |
| Quiz 答對率 | `generatedExamAccuracyRate`                            |
| 詳情 →     | 前端導向 `/students/:studentId` + 同組 `classId`、`range`     |


### 4.2 Query

`classId` 或 `scope`、`range`、`from`、`to`、`q`、`sortBy`、`sortOrder`、`page`、`limit`。

`**sortBy` 對應 UI 下拉**：


| UI 文案（範例）  | `sortBy`                    |
| ---------- | --------------------------- |
| 依期間錯題數     | `mistakeCount`              |
| 依不熟悉知識點數   | `weakConceptCount`          |
| 依活躍天數      | `activeDays`                |
| 依 Quiz 答對率 | `generatedExamAccuracyRate` |


### 4.3 Response 範例

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "classId": "class_hs1_bio_01",
    "className": "國一生物 1 班",
    "total": 32,
    "students": [
      {
        "studentId": "student_001",
        "name": "林宇婕",
        "gradeYear": "國一",
        "classId": "class_hs1_bio_01",
        "className": "國一生物 1 班",
        "mistakeCount": 6,
        "weakConceptCount": 4,
        "activeDays": 18,
        "generatedExamAccuracyRate": 0.84
      }
    ]
  }
}
```


| 欄位                          | 定義                                  |
| --------------------------- | ----------------------------------- |
| `weakConceptCount`          | 該生期間錯題中 distinct `conceptId`（重複不算）。 |
| `activeDays`                | 期間內有新增錯題的 distinct 日曆天數。            |
| `generatedExamAccuracyRate` | 該生期間：**正確總題數 ÷ 總答題數**（與 §1 相同，僅範圍為單生）；無作答回 `null`。 |


---

## 5. `GET /api/dashboard/students/:studentId/detail` — 學生詳情頁

### 5.1 UI 區塊對照


| UI 區塊                            | Response 欄位                                                 |
| -------------------------------- | ----------------------------------------------------------- |
| 標題列（姓名、年級、班級、加入日期）               | `name`、`gradeYear`、`className`、`joinedAt`                   |
| 期間錯題數 / 不熟悉知識點 / 活躍天數 / Quiz 答對率 | 同列表四欄 + `generatedExamAccuracy` 物件                          |
| 矯正狀態建議列                          | `insightBanner`（mock 規則見下）                                  |
| 常錯知識點分布（橫條圖）                     | `conceptDistribution[]`：`{ conceptId, conceptName, count }` |
| 錯題趨勢（僅有錯題的日期）                    | `mistakeTrend[]`                                            |
| 常錯標籤                             | `frequentMistakeTags[]`（通常 = `topWeakConcepts` 名稱列表）        |
| 錯題紀錄列表                           | `mistakeRecords[]`：`title`、`conceptName`、`createdAt`        |


### 5.2 Query

`classId`（必填，避免跨班學生 id 歧義）、`range`、`from`、`to`、`weakConceptLimit`、`mistakeLimit`。

### 5.3 Response 範例

```json
{
  "success": true,
  "data": {
    "studentId": "student_001",
    "name": "林宇婕",
    "gradeYear": "國一",
    "classId": "class_hs1_bio_01",
    "className": "國一生物 1 班",
    "joinedAt": "2026-02-01T00:00:00+08:00",
    "range": "30d",

    "mistakeCount": 6,
    "weakConceptCount": 4,
    "activeDays": 18,
    "generatedExamAccuracy": {
      "correctCount": 21,
      "totalAnswered": 25,
      "accuracyRate": 0.84
    },

    "insightBanner": {
      "level": "medium",
      "message": "矯正狀態中等，建議持續追蹤高頻錯題"
    },

    "conceptDistribution": [
      { "conceptId": "concept_bio_001", "conceptName": "細胞構造", "count": 2 },
      { "conceptId": "concept_bio_005", "conceptName": "光合作用", "count": 2 }
    ],

    "mistakeTrend": [
      { "date": "2026-05-01", "count": 1 },
      { "date": "2026-05-03", "count": 2 }
    ],

    "topWeakConcepts": [
      { "conceptId": "concept_bio_001", "conceptName": "細胞構造", "mistakeCount": 2, "rank": 1 }
    ],

    "frequentMistakeTags": ["細胞構造", "光合作用", "顯微鏡使用", "呼吸作用"],

    "mistakeRecords": [
      {
        "mistakeRecordId": "mistake_001",
        "title": "動物細胞與植物細胞的主要差異為何？",
        "conceptId": "concept_bio_001",
        "conceptName": "細胞構造",
        "createdAt": "2026-05-01T10:00:00+08:00"
      }
    ]
  }
}
```

### 5.4 `insightBanner`（MVP mock 建議）

依 `mistakeCount`、`weakConceptCount`、`generatedExamAccuracy.accuracyRate` 簡單分級，例如：

- `level`: `low` | `medium` | `high`
- `message`: 固定模板字串（之後可改 AI）

### 5.5 `title` 來源

優先 `questionText` 摘要；若空則 `aiSummary` 前 N 字；再不行用「未命名錯題」。

---

## 6. `GET /api/dashboard/concepts-risk` — 知識點管理頁

### 6.1 UI 區塊對照


| UI 區塊             | Response 欄位                                                   |
| ----------------- | ------------------------------------------------------------- |
| 期間總錯題數            | `totalMistakesInPeriod`                                       |
| 高風險知識點數           | `highRiskConceptCount`                                        |
| 最多學生卡關（知識點 + 人數）  | `mostAffectedConcept`：`{ conceptName, affectedStudentCount }` |
| 最常錯知識點（知識點 + 錯題數） | `mostMistakenConcept`：`{ conceptName, mistakeCount }`         |
| 最常錯 Top 5 橫條圖     | `topConceptsByMistakeCount[]`                                 |
| 教學建議（右側文案）        | `teachingSuggestion`（mock）                                    |
| 知識點風險列表           | `conceptRiskRows[]`                                           |


### 6.2 風險等級與 KPI（已實作：絕對錯題數／影響學生數）

| KPI / 排名 | 算法 |
| ---------- | ---- |
| **高風險知識點數** | 期間錯題數 ≥ 5 **或** 影響學生數 ≥ 3 的 distinct 知識點數 |
| **最多學生卡關** `mostAffectedConcept` | 影響學生數（不同學生出錯人數）最多；非錯題筆數 |
| **最常錯知識點** `mostMistakenConcept` | 期間錯題筆數排名第一 |

| `riskLevel` | 條件（滿足任一；先判高再判中） |
| ----------- | ------------------------------ |
| `high`      | 期間錯題數 ≥ 5，或影響學生數 ≥ 3 |
| `medium`    | 期間錯題數 ≥ 3，或影響學生數 ≥ 2（且非 high） |
| `low`       | 不符合高／中 |

`affectedRatio` 仍可回傳供 UI，不參與分級。

`**suggestedAction`（mock 範例）**：


| `riskLevel` | 文案範例   |
| ----------- | ------ |
| `high`      | 建議全班複習 |
| `medium`    | 建議分組補救 |
| `low`       | 建議個別追蹤 |


### 6.3 Response 範例

```json
{
  "success": true,
  "data": {
    "range": "30d",
    "classId": "class_hs1_bio_01",
    "className": "國一生物 1 班",
    "enrolledStudentCount": 32,

    "totalMistakesInPeriod": 23,
    "highRiskConceptCount": 1,

    "mostAffectedConcept": {
      "conceptId": "concept_bio_005",
      "conceptName": "光合作用",
      "affectedStudentCount": 3
    },

    "mostMistakenConcept": {
      "conceptId": "concept_bio_005",
      "conceptName": "光合作用",
      "mistakeCount": 4
    },

    "topConceptsByMistakeCount": [
      { "conceptId": "concept_bio_005", "conceptName": "光合作用", "mistakeCount": 4, "rank": 1 }
    ],

    "teachingSuggestion": "建議優先處理高風險知識點，其中「光合作用」影響學生數最多。",

    "conceptRiskRows": [
      {
        "conceptId": "concept_bio_005",
        "conceptName": "光合作用",
        "unitId": "unit_bio_02",
        "unitName": "單元二 生命的能量",
        "mistakeCount": 4,
        "affectedStudentCount": 3,
        "affectedRatio": 0.094,
        "riskLevel": "high",
        "suggestedAction": "建議全班複習"
      }
    ]
  }
}
```

### 6.4 分頁（選用）

風險表資料量大時可加 `page`、`limit` 只回 `conceptRiskRows`；KPI 與 Top5 仍一次回傳。MVP 可整表一次回傳。

---

## 7. 端點總覽與 README 對照


| 端點                                       | 頁面        | README 現況                        |
| ---------------------------------------- | --------- | -------------------------------- |
| `GET /api/teacher/classes`               | 共用        | 已有                               |
| `GET /api/dashboard/overview`            | Dashboard | **新增**（取代／超集 `summary`）          |
| `GET /api/dashboard/students`            | 學生列表      | 已有，**擴充** `activeDays`、`q`、分頁、排序 |
| `GET /api/dashboard/students/:id/detail` | 學生詳情      | **新增**（建議取代拆三支）                  |
| `GET /api/dashboard/concepts-risk`       | 知識點管理     | **新增**                           |



| README 既有（可保留向後相容）                         | 建議                       |
| ------------------------------------------ | ------------------------ |
| `GET /api/dashboard/summary`               | 由 `overview` 涵蓋或回傳子集     |
| `GET /api/dashboard/students/:id/concepts` | 與 `detail` 重疊，deprecated |
| `GET /api/dashboard/students/:id/charts`   | 與 `detail` 重疊，deprecated |


---

## 8. 實作順序建議（後端）

1. 共用：`range` 解析、`classId`／學生範圍 SQL、切日 helper。
2. `students`（列表欄位齊了，詳情可重用同一套 per-student 聚合）。
3. `overview`（全班 aggregate + trend + 無錯題名單）。
4. `concepts-risk`（per-concept 聚合 + 風險等級 + mock 文案）。
5. `detail`（組裝 5 的欄位 + `mistakeRecords`）。

---

## 9. 併入正式文件前檢查清單

- 「全部學生」：`scope=allClasses` 或省略 `classId` 定案。  
- `activeDays` 與 UI「本月活躍天數」文案是否改為跟隨 `range`。  
- 切日時區、`from`/`to` 是否含當日結束。  
- 風險比例閾值是否抽成設定。  
- `teachingSuggestion`、`insightBanner`、`suggestedAction` mock 規則。  
- `overview` 與 `summary` 是否只留一支。  
- 是否要將本草稿併入 `README.md` §8 與 `backend/API.md`。

