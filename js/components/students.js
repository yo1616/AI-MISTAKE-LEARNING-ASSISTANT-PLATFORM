import { appState } from "../state.js";
import {
  apiGetDashboardStudents,
  apiGetStudentConcepts,
  apiGetStudentCharts,
  getStudentProfile,
  getStudentMistakes
} from "../api.js";
import {
  getClassNameById,
  getMistakeBadgeClass,
  getCorrectionComment,
  isStudentInClass
} from "../utils.js";
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

function renderStudentRows(data) {
  const studentRows = document.getElementById("studentRows");

  if (!studentRows) return;

  if (data.length === 0) {
    studentRows.innerHTML = `
      <div class="td-row" style="grid-template-columns:1fr">
        <div style="color:#999">找不到符合條件的學生</div>
      </div>
    `;
    return;
  }

  studentRows.innerHTML = data
    .map((student) => `
      <div class="td-row student-grid">
        <div><span class="ava">${student.name[0]}</span>${student.name}</div>
        <div>${student.gradeYear}</div>
        <div>${student.mistakeCount}</div>
        <div><span class="${getMistakeBadgeClass(student.weakConceptCount)}">${student.weakConceptCount}</span></div>
        <div>${student.activeDays}</div>
        <div>${student.quizAccuracy}%</div>
        <div>
          <button class="btn-xs student-detail-btn" data-student-id="${student.studentId}">
            詳情→
          </button>
        </div>
      </div>
    `)
    .join("");

  bindStudentDetailButtons();
}

function bindStudentDetailButtons() {
  document.querySelectorAll(".student-detail-btn").forEach((button) => {
    button.addEventListener("click", () => {
      showStudentDetail(button.dataset.studentId);
    });
  });
}

function filterStudentRows() {
  const keyword = document.getElementById("studentSearch")?.value.trim() || "";
  const filtered = appState.dashboardStudents.filter((student) => student.name.includes(keyword));
  renderStudentRows(filtered);
}

export async function showStudentList() {
  setActiveMenu("students");

  const res = await apiGetDashboardStudents({
    classId: appState.currentClassId,
    range: appState.currentRange,
    sortBy: appState.currentSortBy,
    from: appState.currentFrom,
    to: appState.currentTo
  });

  if (!res.success) return showError(res.error.message);

  appState.dashboardStudents = res.data;

  getMain().innerHTML = `
    <div class="pg-title">學生列表</div>
    <div class="pg-sub">
      ${getClassNameById(appState.currentClassId)} · ${getRangeLabel()} · 只顯示目前班級學生
    </div>

    ${renderApiToolbar()}

    <div class="toolbar">
      <input class="sbox" id="studentSearch" placeholder="搜尋學生姓名…" />
      <select class="fsel" id="sortFilter">
        <option value="mistakeCount" ${appState.currentSortBy === "mistakeCount" ? "selected" : ""}>依期間錯題數</option>
        <option value="weakConceptCount" ${appState.currentSortBy === "weakConceptCount" ? "selected" : ""}>依不熟悉知識點數</option>
        <option value="activeDays" ${appState.currentSortBy === "activeDays" ? "selected" : ""}>本月活躍天數</option>
        <option value="quizAccuracy" ${appState.currentSortBy === "quizAccuracy" ? "selected" : ""}>Quiz答對率</option>
      </select>
    </div>

    <div class="tbl">
      <div class="th-row student-grid">
        <div>學生</div>
        <div>年級</div>
        <div>期間錯題數</div>
        <div>不熟悉知識點數</div>
        <div>本月活躍天數</div>
        <div>Quiz答對率</div>
        <div></div>
      </div>
      <div id="studentRows"></div>
    </div>
  `;

  renderStudentRows(appState.dashboardStudents);
  bindClassAndRangeControls(showStudentList);

  document.getElementById("studentSearch").addEventListener("input", filterStudentRows);

  document.getElementById("sortFilter").addEventListener("change", (event) => {
    appState.currentSortBy = event.target.value;
    showStudentList();
  });
}

function renderStudentTags(concepts) {
  if (!concepts || concepts.length === 0) return `<span class="tag">暫無資料</span>`;
  return concepts.map((item) => `<span class="tag">${item.conceptName}</span>`).join("");
}

function renderMistakeRecords(student, classId, range, from, to) {
  const records = getStudentMistakes(student, classId, range, from, to);

  if (records.length === 0) {
    return `
      <div class="mi">
        <div class="mq" style="color:#aaa">目前沒有符合條件的錯題紀錄</div>
      </div>
    `;
  }

  return records
    .map((mistake) => `
      <div class="mi">
        <div class="mq">${mistake.question}</div>
        <div class="mft">
          <span class="tag">${mistake.conceptName}</span>
          <span class="mdt">${mistake.date}</span>
        </div>
      </div>
    `)
    .join("");
}

export async function showStudentDetail(studentId) {
  setActiveMenu("students");

  const student = getStudentProfile(studentId);
  if (!student) return showError("找不到這位學生的資料。");

  const conceptsRes = await apiGetStudentConcepts({
    studentId,
    classId: appState.currentClassId,
    range: appState.currentRange,
    limit: 5,
    from: appState.currentFrom,
    to: appState.currentTo
  });

  const chartsRes = await apiGetStudentCharts({
    studentId,
    classId: appState.currentClassId,
    range: appState.currentRange,
    from: appState.currentFrom,
    to: appState.currentTo
  });

  if (!conceptsRes.success) return showError(conceptsRes.error.message);
  if (!chartsRes.success) return showError(chartsRes.error.message);

  const mistakes = getStudentMistakes(
    student,
    appState.currentClassId,
    appState.currentRange,
    appState.currentFrom,
    appState.currentTo
  );

  const weakConceptCount = new Set(mistakes.map((mistake) => mistake.conceptId)).size;

  getMain().innerHTML = `
    <div class="back" id="backToStudents">← 返回學生列表</div>

    <div class="prow">
      <div class="ava-lg">${student.name[0]}</div>
      <div>
        <div class="pname">${student.name}</div>
        <div class="pmeta">
          ${student.gradeYear} · ${getClassNameById(appState.currentClassId)} · 加入 ${student.joinedAt}
        </div>
      </div>
    </div>

    ${renderApiToolbar()}

    <div class="m4">
      <div class="mc">
        <div class="mc-l">期間錯題數</div>
        <div class="mc-v">${mistakes.length}</div>
      </div>
      <div class="mc">
        <div class="mc-l">不熟悉知識點數</div>
        <div class="mc-v">${weakConceptCount}</div>
      </div>
      <div class="mc">
        <div class="mc-l">本月活躍天數</div>
        <div class="mc-v">${student.activeDays}</div>
      </div>
      <div class="mc">
        <div class="mc-l">Quiz答對率</div>
        <div class="mc-v">${student.quizAccuracy}%</div>
      </div>
    </div>

    <div class="notice">${getCorrectionComment(student.correctionRate)}</div>

    <div class="two-eq">
      <div class="card">
        <div class="card-t">常錯知識點分布</div>
        ${renderTopWeakConceptBars(conceptsRes.data.topWeakConcepts)}
      </div>
      <div class="card">
        <div class="card-t">錯題趨勢</div>
        ${renderTrendBarsFromApi(chartsRes.data.mistakeTrend)}
      </div>
    </div>

    <div class="card" style="margin-bottom:14px">
      <div class="card-t">常錯標籤</div>
      <div class="tw">${renderStudentTags(conceptsRes.data.topWeakConcepts)}</div>
    </div>

    <div class="card">
      <div class="card-t">錯題紀錄</div>
      ${renderMistakeRecords(
        student,
        appState.currentClassId,
        appState.currentRange,
        appState.currentFrom,
        appState.currentTo
      )}
    </div>
  `;

  document.getElementById("backToStudents").addEventListener("click", showStudentList);

  bindClassAndRangeControls(() => {
    const selectedStudentStillInClass = isStudentInClass(student, appState.currentClassId);

    if (selectedStudentStillInClass) {
      showStudentDetail(studentId);
    } else {
      showStudentList();
    }
  });
}
