# Dashboard API Testing Guide

> 目標：快速確認 student dashboard 與 teacher dashboard API 是否可用，且回傳欄位能對上目前前端需求。

## 1. 共用準備

第一次測試或資料被清掉時，先初始化並匯入 seed data：

```bash
cd backend
npm install
npm run db:init
npm run db:seed
npm start
```

預設 API base URL：

```text
http://localhost:3001/api
```

seed data 主要可用測試資料：

| 類型 | 值 |
|------|------|
| student id | `student_001` |
| student class id | `class_hs2_bio_01` |
| teacher prototype class id | `class_jh1_bio_01` |
| all classes id | `all` |
| 建議日期區間 | `from=2026-04-21&to=2026-05-21` |

---

## 2. Student Dashboard 測試

### 2.1 主 API

```bash
curl "http://localhost:3001/api/students/student_001/dashboard?classId=class_hs2_bio_01&from=2026-04-21&to=2026-05-21"
```

也可以不帶 `classId`，查該學生所有班級：

```bash
curl "http://localhost:3001/api/students/student_001/dashboard?from=2026-04-21&to=2026-05-21"
```

### 2.2 必看欄位

新規格欄位：

| 欄位 | 預期 |
|------|------|
| `studentId` | `student_001` |
| `classId` | 有帶 `classId` 時應為 `class_hs2_bio_01` |
| `className` | 有帶 `classId` 時應為 `高二生物班` |
| `summary.totalMistakes` | number |
| `summary.totalConcepts` | number |
| `summary.quizAccuracy.correctCount` | number |
| `summary.quizAccuracy.totalAnswered` | number |
| `summary.quizAccuracy.accuracyRate` | number 或 `null` |
| `unitDistribution[]` | 單元錯誤分布 |
| `topWeakConcepts[]` | 常錯知識點 |

main frontend 相容欄位：

| 欄位 | 說明 |
|------|------|
| `totalMistakes` | 對應 `summary.totalMistakes` |
| `starredNotes` | 目前相容舊畫面，對應總概念數 |
| `generatedExamAccuracy` | 對應 `summary.quizAccuracy` |
| `conceptDistribution[]` | 給舊 mock summary 格式使用 |
| `unitDistribution[].count` | 給舊 mock summary 格式使用 |

### 2.3 Service 合約檢查

不用啟動 server，也可以直接檢查 service 回傳 shape：

```bash
cd backend
node - <<'NODE'
const svc = require('./src/services/dashboard/studentDashboardService');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const result = svc.getDashboard('student_001', {
  classId: 'class_hs2_bio_01',
  from: '2026-04-21',
  to: '2026-05-21'
});

assert(result.ok, JSON.stringify(result.error));
const data = result.data;

assert(data.studentId === 'student_001', 'studentId mismatch');
assert(data.classId === 'class_hs2_bio_01', 'classId mismatch');
assert(data.className === '高二生物班', 'className mismatch');
assert(data.totalMistakes === data.summary.totalMistakes, 'totalMistakes alias mismatch');
assert(data.generatedExamAccuracy === data.summary.quizAccuracy, 'generatedExamAccuracy alias mismatch');
assert(Array.isArray(data.unitDistribution), 'unitDistribution should be array');
assert(Array.isArray(data.topWeakConcepts), 'topWeakConcepts should be array');

console.log('student dashboard ok');
NODE
```

---

## 3. Teacher Dashboard 測試

Teacher dashboard 目前有支援 `frontend-prototype` 的 class id：

| 前端 class id | 說明 |
|------|------|
| `all` | 全部學生 |
| `class_jh1_bio_01` | 國一生物1班 |
| `class_jh1_bio_02` | 國一生物2班 |
| `class_jh3_bio_review_01` | 國三複習生物班 |

### 3.1 班級下拉

```bash
curl "http://localhost:3001/api/teacher/classes"
```

預期至少包含：

- `all`
- `class_jh1_bio_01`
- `class_jh1_bio_02`
- `class_jh3_bio_review_01`

### 3.2 Dashboard summary

```bash
curl "http://localhost:3001/api/dashboard/summary?classId=class_jh1_bio_01&range=30d"
```

必看欄位：

- `weeklyMistakeCount`
- `studentCount`
- `classQuizAccuracy`
- `averageWeakConceptCount`
- `topWeakConcepts[]`

### 3.3 Dashboard charts

```bash
curl "http://localhost:3001/api/dashboard/charts?classId=class_jh1_bio_01&range=30d"
```

必看欄位：

- `mistakeTrend[]`
- `conceptDistribution[]`
- `unitDistribution[]`
- `classQuizAccuracy`

### 3.4 學生列表

```bash
curl "http://localhost:3001/api/dashboard/students?classId=class_jh1_bio_01&range=30d&sortBy=quizAccuracy"
```

注意：這支為了對上 `frontend-prototype`，回傳 `data` 是 array。

每筆學生必看欄位：

- `studentId`
- `name`
- `gradeYear`
- `className`
- `mistakeCount`
- `weakConceptCount`
- `activeDays`
- `quizCorrectCount`
- `quizTotalCount`
- `quizAccuracy`

### 3.5 知識點管理

```bash
curl "http://localhost:3001/api/dashboard/concepts-risk?classId=class_jh1_bio_01&range=30d"
```

必看欄位：

- `totalMistakeCount`
- `highRiskConceptCount`
- `mostImpactedConcept`
- `topWeakConcepts[]`
- `conceptRiskList[]`

`conceptRiskList[].riskLevel` 應為中文：

- `高`
- `中`
- `低`

### 3.6 學生詳情圖表子 API

```bash
curl "http://localhost:3001/api/dashboard/students/student_001/concepts?classId=class_jh1_bio_01&range=30d"
curl "http://localhost:3001/api/dashboard/students/student_001/charts?classId=class_jh1_bio_01&range=30d"
```

必看欄位：

- `topWeakConcepts[]`
- `conceptDistribution[]`
- `unitDistribution[]`
- `mistakeTrend[]`（charts）

### 3.7 Service 合約檢查

不用啟動 server，也可以直接跑：

```bash
cd backend
node - <<'NODE'
const teacherService = require('./src/services/teacherService');
const svc = require('./src/services/dashboard/teacherDashboardService');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const classes = teacherService.getTeacherClasses();
assert(classes.some((c) => c.id === 'all'), 'missing all class');
assert(classes.some((c) => c.id === 'class_jh1_bio_01'), 'missing class_jh1_bio_01');

const query = {
  classId: 'class_jh1_bio_01',
  range: '30d',
  from: '2026-05-01',
  to: '2026-05-16'
};

const students = svc.getStudents({ ...query, sortBy: 'quizAccuracy' });
assert(students.ok, JSON.stringify(students.error));
assert(Array.isArray(students.data), 'students data should be array');
assert('quizAccuracy' in students.data[0], 'student row missing quizAccuracy');
assert('quizCorrectCount' in students.data[0], 'student row missing quizCorrectCount');
assert('quizTotalCount' in students.data[0], 'student row missing quizTotalCount');

const summary = svc.getSummary(query);
assert(summary.ok, JSON.stringify(summary.error));
assert('classQuizAccuracy' in summary.data, 'summary missing classQuizAccuracy');
assert('averageWeakConceptCount' in summary.data, 'summary missing averageWeakConceptCount');

const charts = svc.getClassCharts(query);
assert(charts.ok, JSON.stringify(charts.error));
assert(Array.isArray(charts.data.mistakeTrend), 'charts missing mistakeTrend');
assert(Array.isArray(charts.data.conceptDistribution), 'charts missing conceptDistribution');
assert(Array.isArray(charts.data.unitDistribution), 'charts missing unitDistribution');

const risk = svc.getConceptsRisk(query);
assert(risk.ok, JSON.stringify(risk.error));
assert(Array.isArray(risk.data.conceptRiskList), 'risk missing conceptRiskList');
if (risk.data.conceptRiskList.length > 0) {
  assert(['高', '中', '低'].includes(risk.data.conceptRiskList[0].riskLevel), 'riskLevel should be Chinese label');
}

console.log('teacher dashboard ok');
NODE
```

---

## 4. 常見失敗

| 狀況 | 檢查 |
|------|------|
| `CLASS_NOT_FOUND` | student dashboard 用 `class_hs2_bio_01`；teacher dashboard prototype 用 `class_jh1_bio_01` |
| `INVALID_RANGE` | 可用 `7d`、`14d`、`30d`、`custom` |
| `INVALID_CUSTOM_RANGE` | `custom` 時要帶 `from=YYYY-MM-DD&to=YYYY-MM-DD` |
| `STUDENT_NOT_IN_CLASS` | 確認學生是否屬於該班級；例如 `student_001` 可用 `class_hs2_bio_01` 或 teacher prototype 的 `class_jh1_bio_01` |
| 圖表空白 | 確認日期區間是否含 seed data；建議先用 `2026-04-21` 到 `2026-05-21` |
