import { appState } from "../state.js";
import { getClassNameById } from "../utils.js";
import {
  getMain,
  setActiveMenu,
  getClassOptions,
  getRangeOptions,
  getRangeLabel
} from "../shared.js";
import { logoutTeacher } from "./login.js";
import { showDashboard } from "./dashboard.js";

function renderTeachingClassList() {
  const classes = appState.classes.filter((classItem) => {
    return classItem.id !== "all";
  });

  if (classes.length === 0) {
    return `
      <div class="empty-text">
        目前沒有可查看的班級
      </div>
    `;
  }

  return classes
    .map((classItem) => {
      return `
        <div class="class-chip">
          ${classItem.name}
        </div>
      `;
    })
    .join("");
}

export function showSettingsPage() {
  setActiveMenu("settings");

  const main = getMain();

  const teacherName = appState.teacherName || "未登入";
  const teacherEmail = appState.teacherEmail || "-";
  const teacherId = appState.currentTeacherId || "-";
  const currentClassName =
    appState.currentClassName ||
    getClassNameById(appState.currentClassId) ||
    "尚未選擇";

  main.innerHTML = `
    <div class="pg-title">個人設定</div>
    <div class="pg-sub">
      查看目前登入老師資訊、負責班級與系統狀態
    </div>

    <div class="settings-grid">
      <div class="card">
        <div class="card-t">老師個人資訊</div>

        <div class="profile-box">
          <div class="profile-avatar">
            ${teacherName[0] || "老"}
          </div>

          <div>
            <div class="profile-name">${teacherName}</div>
            <div class="profile-email">${teacherEmail}</div>
          </div>
        </div>

        <div class="settings-row">
          <span>老師編號</span>
          <strong>${teacherId}</strong>
        </div>

        <div class="settings-row">
          <span>授課科目</span>
          <strong>生物</strong>
        </div>
      </div>

      <div class="card">
        <div class="card-t">負責班級</div>
        <div class="class-chip-list">
          ${renderTeachingClassList()}
        </div>
      </div>

      <div class="card">
        <div class="card-t">系統狀態</div>

        <div class="settings-row">
          <span>目前科目</span>
          <strong>生物</strong>
        </div>

        <div class="settings-row">
          <span>目前查看範圍</span>
          <strong>${currentClassName}</strong>
        </div>

        <div class="settings-row">
          <span>目前期間</span>
          <strong>${getRangeLabel()}</strong>
        </div>

        <div class="settings-row">
          <span>登入狀態</span>
          <strong>已登入</strong>
        </div>

        <button class="btn-xs danger" id="logoutBtn">
          登出
        </button>
      </div>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    logoutTeacher();
  });
}
