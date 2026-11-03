import { appState } from "./state.js";
import { apiOk, apiFail } from "./utils.js";

const API_BASE_URL = "/api";
const teacherProfiles = new Map();
const studentMistakeCache = new Map();

async function request(endpoint, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const url = `${API_BASE_URL}${endpoint}${search.toString() ? `?${search}` : ""}`;

  try {
    const response = await fetch(url);
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      return apiFail(payload.error?.code || "REQUEST_FAILED", payload.error?.message || "請求失敗");
    }
    return apiOk(payload.data);
  } catch (error) {
    return apiFail("NETWORK_ERROR", error.message || "網路錯誤");
  }
}

function normalizeTeacherLogin(email, password, classIds) {
  return apiOk({
    teacherId: "teacher_001",
    name: "陳老師",
    email,
    classIds
  });
}

export function getStudentProfile(studentId) {
  return teacherProfiles.get(studentId) || appState.dashboardStudents.find((student) => student.studentId === studentId) || null;
}

export function getStudentMistakes(studentId) {
  return studentMistakeCache.get(studentId) || [];
}

export async function apiLoginTeacher(email, password) {
  const validCredentials = [
    { email: "teacher001@example.com", password: "12345678" },
    { email: "teacher1@example.com", password: "12345678" },
    { email: "teacher2@example.com", password: "abcdefgh" }
  ];

  const isValid = validCredentials.some((credential) => credential.email === email && credential.password === password);
  if (!isValid) {
    return apiFail("INVALID_LOGIN", "帳號或密碼錯誤");
  }

  const classesRes = await apiGetTeacherClasses();
  if (!classesRes.success) {
    return classesRes;
  }

  const classIds = classesRes.data
    .map((item) => item.id)
    .filter((id) => id !== "all");

  return normalizeTeacherLogin(email, password, classIds);
}

export async function apiGetStudents() {
  return request("/students");
}

export async function apiGetTeacherClasses() {
  return request("/teacher/classes");
}

export async function apiGetDashboardStudents({
  classId,
  range = "30d",
  sortBy = "mistakeCount",
  from,
  to
}) {
  const result = await request("/dashboard/students", {
    classId,
    range,
    sortBy,
    from,
    to
  });

  if (result.success) {
    result.data.forEach((student) => {
      teacherProfiles.set(student.studentId, student);
    });
  }

  return result;
}

export async function apiGetDashboardSummary({
  classId,
  range = "30d",
  limit = 5,
  from,
  to
}) {
  return request("/dashboard/summary", {
    classId,
    range,
    limit,
    from,
    to
  });
}

export async function apiGetClassCharts({
  classId,
  range = "30d",
  from,
  to
}) {
  return request("/dashboard/charts", {
    classId,
    range,
    from,
    to
  });
}

export async function apiGetKnowledgeOverview({
  classId,
  range = "30d",
  from,
  to,
  limit = 5
}) {
  return request("/dashboard/concepts-risk", {
    classId,
    range,
    from,
    to,
    limit
  });
}

export async function apiGetStudentConcepts({
  studentId,
  classId,
  range = "30d",
  limit = 5,
  from,
  to
}) {
  return request(`/dashboard/students/${studentId}/concepts`, {
    classId,
    range,
    limit,
    from,
    to
  });
}

export async function apiGetStudentCharts({
  studentId,
  classId,
  range = "30d",
  from,
  to
}) {
  return request(`/dashboard/students/${studentId}/charts`, {
    classId,
    range,
    from,
    to
  });
}

export async function apiGetStudentMistakeRecords({
  studentId,
  starredOnly = false
}) {
  const result = await request(`/students/${studentId}/mistakes`, {
    starredOnly: starredOnly ? "true" : undefined
  });

  if (result.success) {
    studentMistakeCache.set(studentId, result.data);
  }

  return result;
}
