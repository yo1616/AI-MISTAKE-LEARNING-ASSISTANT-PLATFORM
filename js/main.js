import { appState } from "./state.js";
import { apiGetTeacherClasses } from "./api.js";
import { showLoginPage } from "./components/login.js";
import { showDashboard } from "./components/dashboard.js";
import { showStudentList } from "./components/students.js";
import { showKnowledgePage } from "./components/knowledge.js";
import { showSettingsPage } from "./components/settings.js";

function bindSidebarEvents() {
  document.querySelectorAll(".s-item[data-page]").forEach((item) => {
    item.addEventListener("click", () => {
      if (!appState.isLoggedIn) {
        showLoginPage();
        return;
      }

      const page = item.dataset.page;

      if (page === "dashboard") showDashboard();
      else if (page === "students") showStudentList();
      else if (page === "knowledge") showKnowledgePage();
      else if (page === "settings") showSettingsPage();
    });
  });
}

async function initApp() {
  const classesRes = await apiGetTeacherClasses();

  if (classesRes.success) {
    appState.classes = classesRes.data;
  }

  bindSidebarEvents();
  showLoginPage();
}

initApp();
