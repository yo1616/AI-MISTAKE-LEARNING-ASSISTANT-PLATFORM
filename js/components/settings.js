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

export function showSettingsPage() {
  setActiveMenu("settings");

  getMain().innerHTML = `
    <div class="pg-title">個人設定</div>
    <div class="pg-sub">老師帳號、預設班級與顯示期間設定</div>

    <div class="settings-grid">
      <div class="card">
        <div class="card-t">帳號資訊</div>

        <label class="form-label">老師名稱</label>
        <input class="form-input" id="teacherNameInput" value="${appState.teacherName}" />

        <label class="form-label">Email</label>
        <input class="form-input" id="teacherEmailInput" value="${appState.teacherEmail}" />

        <button class="add-btn" id="saveProfileBtn">儲存設定</button>
      </div>

      <div class="card">
        <div class="card-t">預設查看範圍</div>

        <label class="form-label">目前班級</label>
        <select class="form-input" id="settingsClassSelect">${getClassOptions()}</select>

        <label class="form-label">目前時間範圍</label>
        <select class="form-input" id="settingsRangeSelect">${getRangeOptions()}</select>

        <div class="settings-date-row" id="settingsDateRow">
          <input class="form-input" type="date" id="settingsFromDate" value="${appState.currentFrom}" />
          <input class="form-input" type="date" id="settingsToDate" value="${appState.currentTo}" />
        </div>

        <button class="add-btn" id="applyDefaultBtn">套用到系統</button>
      </div>

      <div class="card">
        <div class="card-t">系統狀態</div>

        <div class="settings-row"><span>目前科目</span><strong>生物</strong></div>
        <div class="settings-row"><span>目前班級</span><strong>${getClassNameById(appState.currentClassId)}</strong></div>
        <div class="settings-row"><span>目前期間</span><strong>${getRangeLabel()}</strong></div>

        <button class="btn-xs danger" id="logoutBtn">登出並重新選班</button>
      </div>
    </div>

    <div class="notice" id="settingsMessage" style="display:none"></div>
  `;

  const dateRow = document.getElementById("settingsDateRow");
  const settingsRangeSelect = document.getElementById("settingsRangeSelect");

  const syncDateRow = () => {
    dateRow.style.display = settingsRangeSelect.value === "custom" ? "grid" : "none";
  };

  syncDateRow();

  settingsRangeSelect.addEventListener("change", syncDateRow);

  document.getElementById("saveProfileBtn").addEventListener("click", () => {
    appState.teacherName = document.getElementById("teacherNameInput").value.trim() || "老師";
    appState.teacherEmail = document.getElementById("teacherEmailInput").value.trim() || "teacher@example.com";

    const msg = document.getElementById("settingsMessage");
    msg.style.display = "block";
    msg.textContent = "已儲存老師帳號設定。";
  });

  document.getElementById("applyDefaultBtn").addEventListener("click", () => {
    appState.currentClassId = document.getElementById("settingsClassSelect").value;
    appState.currentClassName = appState.classes.find((item) => item.id === appState.currentClassId)?.name || "";
    appState.currentRange = settingsRangeSelect.value;
    appState.currentFrom = document.getElementById("settingsFromDate").value;
    appState.currentTo = document.getElementById("settingsToDate").value;

    showDashboard();
  });

  document.getElementById("logoutBtn").addEventListener("click", logoutTeacher);
}
