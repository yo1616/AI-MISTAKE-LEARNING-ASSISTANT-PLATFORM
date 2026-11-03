import { appState } from "../state.js";
import {
  apiGetDashboardSummary,
  apiGetDashboardStudents,
  apiGetClassCharts
} from "../api.js";
import { getClassNameById } from "../utils.js";
import {
  getMain,
  setActiveMenu,
  showError,
  getRangeLabel,
  renderApiToolbar,
  bindClassAndRangeControls,
  renderTopWeakConceptBars,
  renderTrendBarsFromApi
} from "../shared.js";
import { showStudentDetail } from "./students.js";

function renderTopWeakStudentRows(rows) {
  const topWeakStudents = [...rows]
    .sort((a, b) => {
      if (b.weakConceptCount !== a.weakConceptCount) {
        return b.weakConceptCount - a.weakConceptCount;
      }
      return b.mistakeCount - a.mistakeCount;
    })
    .slice(0, 3);

  if (topWeakStudents.length === 0) {
    return `
      <div class="td-row" style="grid-template-columns:1fr">
        <div style="color:#999">本期間沒有可顯示的學生資料。</div>
      </div>
    `;
  }

  return topWeakStudents
    .map((student) => `
      <div class="td-row inactive-grid">
        <div><span class="ava">${student.name[0]}</span>${student.name}</div>
        <div>${student.gradeYear}</div>
        <div>${student.mistakeCount}</div>
        <div>${student.weakConceptCount}</div>
        <div><span class="tag">${student.className}</span></div>
        <div>
          <button class="btn-xs student-detail-btn" data-student-id="${student.studentId}">
            詳情→
          </button>
        </div>
      </div>
    `)
    .join("");
}

export async function showDashboard() {
  setActiveMenu("dashboard");

  const summaryRes = await apiGetDashboardSummary({
    classId: appState.currentClassId,
    range: appState.currentRange,
    limit: 5,
    from: appState.currentFrom,
    to: appState.currentTo
  });

  const studentsRes = await apiGetDashboardStudents({
    classId: appState.currentClassId,
    range: appState.currentRange,
    sortBy: "mistakeCount",
    from: appState.currentFrom,
    to: appState.currentTo
  });

  const chartsRes = await apiGetClassCharts({
    classId: appState.currentClassId,
    range: appState.currentRange,
    from: appState.currentFrom,
    to: appState.currentTo
  });

  if (!summaryRes.success) return showError(summaryRes.error.message);
  if (!studentsRes.success) return showError(studentsRes.error.message);
  if (!chartsRes.success) return showError(chartsRes.error.message);

  const summary = summaryRes.data;
  const studentRows = studentsRes.data;
  appState.dashboardStudents = studentRows;
  const activeStudentCount = studentRows.filter((student) => student.mistakeCount > 0).length;

  const averageQuizAccuracy =
  studentRows.length === 0
    ? 0
    : Math.round(
        studentRows.reduce((sum, student) => sum + student.quizAccuracy, 0) /
          studentRows.length
      );

  const averageWeakConceptCount =
    studentRows.length === 0
      ? 0
      : (
          studentRows.reduce((sum, student) => sum + student.weakConceptCount, 0) /
          studentRows.length
        ).toFixed(1);

  getMain().innerHTML = `
    <div class="pg-title">Dashboard</div>
    <div class="pg-sub">
      ${getClassNameById(appState.currentClassId)} · ${getRangeLabel(summary.range)} · 生物科
    </div>

    ${renderApiToolbar()}

    <div class="m4">
      <div class="mc">
        <div class="mc-l">期間新增錯題</div>
        <div class="mc-v">${summary.weeklyMistakeCount}</div>
      </div>
      <div class="mc">
        <div class="mc-l">活躍學生數</div>
        <div class="mc-v">${activeStudentCount}</div>
        <div class="mc-d">期間內新增錯題數 > 0</div>
      </div>
      <div class="mc">
        <div class="mc-l">平均 Quiz 答對率</div>
        <div class="mc-v">${averageQuizAccuracy}%</div>
        <div class="mc-d">總答對題數 / 總作答題數</div>
      </div>
      <div class="mc">
        <div class="mc-l">平均不熟悉知識點數</div>
        <div class="mc-v">${averageWeakConceptCount}</div>
        <div class="mc-d">每位學生平均卡住幾個觀念</div>
      </div>
    </div>

    <div class="two">
      <div class="card" style="position:relative">
        <div class="card-t">錯題趨勢</div>
        ${renderTrendBarsFromApi(chartsRes.data.mistakeTrend)}
      </div>
      <div class="card">
        <div class="card-t">最常錯知識點 top 5</div>
        ${renderTopWeakConceptBars(summary.topWeakConcepts)}
      </div>
    </div>

    <div style="font-size:15px;font-weight:600;color:#111;margin-bottom:8px">
      本期間不熟悉知識點前三的學生
    </div>

    <div class="tbl">
      <div class="th-row inactive-grid">
        <div>學生</div>
        <div>年級</div>
        <div>錯題數</div>
        <div>不熟悉知識點數</div>
        <div>班級</div>
        <div></div>
      </div>
      ${renderTopWeakStudentRows(studentRows)}
    </div>
  `;

  bindClassAndRangeControls(showDashboard);

  document.querySelectorAll(".student-detail-btn").forEach((button) => {
    button.addEventListener("click", () => {
      showStudentDetail(button.dataset.studentId);
    });
  });
}
