import { appState } from "./state.js";

export function getMain() {
  return document.getElementById("main");
}

export function setActiveMenu(pageName) {
  document.querySelectorAll(".s-item[data-page]").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });
}

export function showError(message) {
  getMain().innerHTML = `
    <div class="pg-title">發生錯誤</div>
    <div class="notice">${message}</div>
  `;
}

function normalizeCustomDateRange(from, to, changedField) {
  if (!from || !to) {
    return { from, to };
  }

  if (from <= to) {
    return { from, to };
  }

  if (changedField === "from") {
    return { from, to: from };
  }

  return { from: to, to };
}

export function getClassOptions(selectedClassId = appState.currentClassId) {
  return appState.classes
    .map((classItem) => `
      <option value="${classItem.id}" ${classItem.id === selectedClassId ? "selected" : ""}>
        ${classItem.name}
      </option>
    `)
    .join("");
}

export function getRangeOptions(selectedRange = appState.currentRange) {
  const options = [
    { value: "7d", label: "近7天" },
    { value: "14d", label: "近14天" },
    { value: "30d", label: "近30天" },
    { value: "custom", label: "自訂期間" }
  ];

  return options
    .map((item) => `
      <option value="${item.value}" ${item.value === selectedRange ? "selected" : ""}>
        ${item.label}
      </option>
    `)
    .join("");
}

export function getRangeLabel(range = appState.currentRange) {
  const labels = {
    "7d": "近7天",
    "14d": "近14天",
    "30d": "近30天",
    custom: `${appState.currentFrom} 至 ${appState.currentTo}`
  };

  return labels[range] || range;
}

export function renderDatePickerControls() {
  if (appState.currentRange !== "custom") return "";

  return `
    <label class="date-label">起</label>
    <input class="date-input" type="date" id="fromDate" value="${appState.currentFrom}" max="${appState.currentTo}" />
    <label class="date-label">迄</label>
    <input class="date-input" type="date" id="toDate" value="${appState.currentTo}" min="${appState.currentFrom}" />
  `;
}

export function renderApiToolbar() {
  return `
    <div class="toolbar api-toolbar">
      <select class="fsel" id="classSelect">${getClassOptions()}</select>
      <select class="fsel" id="rangeSelect">${getRangeOptions()}</select>
      ${renderDatePickerControls()}
    </div>
  `;
}

export function bindClassAndRangeControls(onChange) {
  document.getElementById("classSelect")?.addEventListener("change", (event) => {
    appState.currentClassId = event.target.value;
    appState.currentClassName = appState.classes.find((item) => item.id === event.target.value)?.name || "";
    onChange();
  });

  document.getElementById("rangeSelect")?.addEventListener("change", (event) => {
    appState.currentRange = event.target.value;
    onChange();
  });

  document.getElementById("fromDate")?.addEventListener("change", (event) => {
    const normalized = normalizeCustomDateRange(event.target.value, appState.currentTo, "from");
    appState.currentFrom = normalized.from;
    appState.currentTo = normalized.to;
    onChange();
  });

  document.getElementById("toDate")?.addEventListener("change", (event) => {
    const normalized = normalizeCustomDateRange(appState.currentFrom, event.target.value, "to");
    appState.currentFrom = normalized.from;
    appState.currentTo = normalized.to;
    onChange();
  });
}

export function renderTopWeakConceptBars(topWeakConcepts) {
  if (!topWeakConcepts || topWeakConcepts.length === 0) {
    return `<div style="font-size:11px;color:#aaa">目前沒有錯題資料</div>`;
  }

  const maxCount = Math.max(...topWeakConcepts.map((item) => item.mistakeCount), 1);

  return topWeakConcepts
    .map((concept) => {
      const width = Math.max(8, Math.round((concept.mistakeCount / maxCount) * 100));

      return `
        <div class="br">
          <div class="bl">${concept.conceptName}</div>
          <div class="bb"><div class="bf" style="width:${width}%"></div></div>
          <div class="bn">${concept.mistakeCount}</div>
        </div>
      `;
    })
    .join("");
}

export function renderTrendBarsFromApi(trendData) {
  if (!trendData || trendData.length === 0) {
    return `<div style="font-size:11px;color:#aaa">目前沒有趨勢資料</div>`;
  }

  const maxCount = Math.max(...trendData.map((item) => item.count), 1);

  return `
    <div class="tbars">
      ${trendData
        .map((item) => {
          const height = Math.max(10, Math.round((item.count / maxCount) * 84));

          return `
            <div class="tb${item.count === maxCount ? " hi" : ""}" style="height:${height}%">
              <span class="tooltip">${item.count}</span>
            </div>
          `;
        })
        .join("")}
    </div>
    <div class="tlbls">
      ${trendData.map((item) => `<div class="tl">${item.date.slice(5)}</div>`).join("")}
    </div>
  `;
}
