import { appState } from "../state.js";
import { apiLoginTeacher, apiGetTeacherClasses } from "../api.js";
import { getMain } from "../shared.js";
import { showDashboard } from "./dashboard.js";

export function hideSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const main = document.querySelector(".main");
  if (sidebar) {
    sidebar.style.display = "none";
  }
  if (main) {
    main.style.marginLeft = "0";
  }
}

export function showSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const main = document.querySelector(".main");
  if (sidebar) {
    sidebar.style.display = "flex";
  }
  if (main) {
    main.style.marginLeft = "";
  }
}

export function showLoginPage() {
  const main = getMain();

  main.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="login-title">老師端登入</div>
        <div class="login-subtitle">個別化學習支援系統｜生物科</div>

        <div class="form-group">
          <label>老師帳號</label>
          <input
            type="email"
            id="teacherEmail"
            class="login-input"
            placeholder="請輸入 Email"
            value="teacher1@example.com"
          />
        </div>

        <div class="form-group">
          <label>密碼</label>
          <input
            type="password"
            id="teacherPassword"
            class="login-input"
            placeholder="請輸入密碼"
            value="12345678"
          />
        </div>

        <div id="loginError" class="login-error"></div>

        <button class="login-btn" id="loginBtn">登入</button>

        <div class="login-hint">
          測試帳號一：teacher1@example.com / 12345678<br />
          測試帳號二：teacher2@example.com / abcdefgh
        </div>
      </div>
    </div>
  `;

  hideSidebar();

  document
    .getElementById("loginBtn")
    .addEventListener("click", handleTeacherLogin);

  document
    .getElementById("teacherPassword")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleTeacherLogin();
      }
    });
}

async function handleTeacherLogin() {
  const emailInput = document.getElementById("teacherEmail");
  const passwordInput = document.getElementById("teacherPassword");
  const errorBox = document.getElementById("loginError");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    errorBox.textContent = "請輸入帳號與密碼";
    return;
  }

  const res = await apiLoginTeacher(email, password);

  if (!res.success) {
    errorBox.textContent = res.error.message;
    return;
  }

  appState.currentTeacher = res.data;
  appState.currentTeacherId = res.data.teacherId;
  appState.isLoggedIn = true;
  appState.teacherName = res.data.name;
  appState.teacherEmail = res.data.email;
  appState.allowedClassIds = res.data.classIds || [];

  showClassSelectPage();
}

export async function showClassSelectPage() {
  const main = getMain();
  const res = await apiGetTeacherClasses();

  if (!res.success) {
    main.innerHTML = `
      <div class="notice">
        無法載入班級資料：${res.error.message}
      </div>
    `;
    return;
  }

  appState.classes = res.data;

  main.innerHTML = `
    <div class="login-page">
      <div class="login-card class-card">
        <div class="login-title">選擇查看班級</div>
        <div class="login-subtitle">
          ${appState.teacherName}，請選擇要進入的生物班級
        </div>

        <div class="class-list">
          ${res.data
            .map(
              (cls) => `
                <button
                  class="class-option"
                  data-class-id="${cls.id}"
                  data-class-name="${cls.name}"
                >
                  <div class="class-name">${cls.name}</div>
                  <div class="class-desc">查看學生列表、統計與分析</div>
                </button>
              `
            )
            .join("")}
        </div>

        <button class="logout-btn" id="logoutBtn">登出</button>
      </div>
    </div>
  `;

  hideSidebar();

  document.querySelectorAll(".class-option").forEach((button) => {
    button.addEventListener("click", () => {
      enterClass(button.dataset.classId, button.dataset.className);
    });
  });

  document
    .getElementById("logoutBtn")
    .addEventListener("click", logoutTeacher);
}

function enterClass(classId, className) {
  appState.currentClassId = classId;
  appState.currentClassName = className;
  appState.isLoggedIn = true;

  showSidebar();
  showDashboard();
}

export function logoutTeacher() {
  appState.currentTeacher = null;
  appState.currentTeacherId = "";
  appState.isLoggedIn = false;
  appState.currentClassId = "";
  appState.currentClassName = "";
  appState.allowedClassIds = [];
  appState.classes = [];
  appState.dashboardStudents = [];
  appState.teacherName = "老師";
  appState.teacherEmail = "";

  hideSidebar();
  showLoginPage();
}
