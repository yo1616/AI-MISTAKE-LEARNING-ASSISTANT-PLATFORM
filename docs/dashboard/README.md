# Dashboard API Docs

## Student

- [student-dashboard-api.md](./student/student-dashboard-api.md)
- 主 API：`GET /api/students/:studentId/dashboard`

## Teacher

- [teacher-dashboard-api.md](./teacher/teacher-dashboard-api.md)

## API Overview

| 區塊 | API | 說明 |
|------|-----|------|
| Student Dashboard | `GET /api/students/:studentId/dashboard` | 學生分析表主 API，回傳總錯題數、總概念數、Quiz 答對率、單元錯誤分布、常錯知識點 |
| Teacher Filter | `GET /api/teacher/classes` | 老師端班級下拉選單 |
| Teacher Overview | `GET /api/dashboard/overview` | 老師端 Dashboard 主頁 |
| Teacher Students | `GET /api/dashboard/students` | 老師端學生列表頁 |
| Teacher Student Detail | `GET /api/dashboard/students/:studentId/detail` | 老師端學生詳情頁 |
| Teacher Concepts Risk | `GET /api/dashboard/concepts-risk` | 老師端知識點風險頁 |

## Notes

- Dashboard 測試步驟見 [dashboard-testing.md](./dashboard-testing.md)
- Student 詳細規格見 [student/student-dashboard-api.md](./student/student-dashboard-api.md)
- Teacher 正式規格見 [teacher/teacher-dashboard-api.md](./teacher/teacher-dashboard-api.md)
