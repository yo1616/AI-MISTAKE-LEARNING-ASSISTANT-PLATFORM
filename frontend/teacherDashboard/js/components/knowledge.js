import { appState } from "../state.js";
import { apiGetKnowledgeOverview } from "../api.js";
import {
  getMain,
  setActiveMenu,
  showError,
  renderApiToolbar,
  bindClassAndRangeControls,
  renderTopWeakConceptBars
} from "../shared.js";

function buildKnowledgeChapters(conceptRiskList = []) {
  const chapterMap = new Map();

  conceptRiskList.forEach((concept) => {
    const chapterId = concept.unitId || "uncategorized";
    if (!chapterMap.has(chapterId)) {
      chapterMap.set(chapterId, {
        id: chapterId,
        name: concept.unitName || "未分類單元",
        concepts: []
      });
    }

    chapterMap.get(chapterId).concepts.push({
      conceptId: concept.conceptId,
      conceptName: concept.conceptName,
      mistakeCount: concept.mistakeCount
    });
  });

  return [...chapterMap.values()].map((chapter) => ({
    ...chapter,
    concepts: chapter.concepts.sort((a, b) => b.mistakeCount - a.mistakeCount)
  }));
}

export async function showKnowledgePage() {
  setActiveMenu("knowledge");

  const overviewRes = await apiGetKnowledgeOverview({
    classId: appState.currentClassId,
    range: appState.currentRange,
    from: appState.currentFrom,
    to: appState.currentTo,
    limit: 5
  });

  if (!overviewRes.success) {
    return showError(overviewRes.error.message);
  }

  const overview = overviewRes.data;

  getMain().innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div>
        <div class="pg-title">知識點管理</div>
        <div class="pg-sub">
          依目前班級與期間統計學生錯題，協助老師判斷優先補救觀念
        </div>
      </div>
    </div>

    ${renderApiToolbar()}

    <div class="m3">
      <div class="mc">
        <div class="mc-l">期間總錯題數</div>
        <div class="mc-v">${overview.totalMistakeCount}</div>
        <div class="mc-d">目前篩選期間內</div>
      </div>

      <div class="mc">
        <div class="mc-l">高風險知識點數</div>
        <div class="mc-v">${overview.highRiskConceptCount}</div>
        <div class="mc-d">錯題數高或影響多人</div>
      </div>

      <div class="mc">
        <div class="mc-l">最多學生卡關</div>
        <div class="mc-v" style="font-size:16px">
          ${overview.mostImpactedConcept?.conceptName || "暫無資料"}
        </div>
        <div class="mc-d">
          ${overview.mostImpactedConcept ? `影響 ${overview.mostImpactedConcept.affectedStudentCount} 位學生` : "目前沒有錯題資料"}
        </div>
      </div>
    </div>

    <div class="two">
      <div class="card">
        <div class="card-t">最常錯知識點 Top 5</div>
        ${renderTopWeakConceptBars(overview.topWeakConcepts)}
      </div>

      <div class="card">
        <div class="card-t">教學建議</div>
        <div style="font-size:14px;color:#555;line-height:1.9">
          ${renderKnowledgeSuggestion(overview)}
        </div>
      </div>
    </div>

    <div style="font-size:14px;font-weight:600;color:#111;margin-bottom:8px">
      知識點風險列表
    </div>

    <div class="tbl">
      <div class="th-row knowledge-risk-grid">
        <div>知識點</div>
        <div>所屬單元</div>
        <div>期間錯題數</div>
        <div>影響學生數</div>
        <div>風險等級</div>
      </div>

      <div id="knowledgeRiskRows">
        ${renderKnowledgeRiskRows(overview.conceptRiskList)}
      </div>
    </div>
    
  `;

  bindClassAndRangeControls(showKnowledgePage);
  renderKnowledgeList(buildKnowledgeChapters(overview.conceptRiskList));
}

function renderKnowledgeSuggestion(overview) {
  if (overview.totalMistakeCount === 0) {
    return "目前篩選期間內沒有錯題紀錄，可以維持原本教學進度。";
  }

  if (overview.highRiskConceptCount > 0) {
    return `建議優先處理高風險知識點，尤其是「${overview.mostImpactedConcept?.conceptName || "目前最高風險觀念"}」，因為它影響的學生人數最多。`;
  }

  return "目前沒有明顯高風險知識點，可針對中低風險觀念安排小範圍複習。";
}

function getRiskClass(riskLevel) {
  if (riskLevel === "高") return "bhi";
  if (riskLevel === "中") return "bmd";
  return "bok";
}

function renderKnowledgeRiskRows(conceptRiskList) {
  if (!conceptRiskList || conceptRiskList.length === 0) {
    return `
      <div class="td-row" style="grid-template-columns:1fr">
        <div style="color:#999">目前沒有符合條件的知識點錯題資料</div>
      </div>
    `;
  }

  return conceptRiskList.map((concept) => {
    return `
      <div class="td-row knowledge-risk-grid">
        <div>${concept.conceptName}</div>
        <div>${concept.unitName}</div>
        <div>${concept.mistakeCount}</div>
        <div>${concept.affectedStudentCount}</div>
        <div><span class="${getRiskClass(concept.riskLevel)}">${concept.riskLevel}</span></div>
      </div>
    `;
  }).join("");
}

function renderConceptItems(chapter, maxCount) {
  if (chapter.concepts.length === 0) {
    return `<div class="con-item"><div class="con-nm" style="color:#aaa">此章節目前沒有知識點</div></div>`;
  }

  return chapter.concepts
    .map((concept) => {
      const width = Math.max(8, Math.round((concept.mistakeCount / maxCount) * 100));

      return `
        <div class="con-item">
          <div class="con-nm">${concept.conceptName}</div>
          <div class="mbwrap">
            <div class="mbbg"><div class="mbf" style="width:${width}%"></div></div>
          </div>
          <div class="con-ct">${concept.mistakeCount}</div>
        </div>
      `;
    })
    .join("");
}

function renderKnowledgeList(chapters = []) {
  const existing = document.getElementById("knowledgeChapterList");
  if (existing) {
    existing.remove();
  }

  if (!chapters.length) {
    getMain().insertAdjacentHTML(
      "beforeend",
      `
        <div id="knowledgeChapterList" class="card" style="margin-top:16px">
          <div class="card-t">單元知識點分布</div>
          <div style="font-size:11px;color:#999">目前沒有可顯示的知識點資料</div>
        </div>
      `
    );
    return;
  }

  const maxCount = Math.max(
    ...chapters.flatMap((chapter) => chapter.concepts.map((concept) => concept.mistakeCount)),
    1
  );

  getMain().insertAdjacentHTML(
    "beforeend",
    `
      <div id="knowledgeChapterList" class="card" style="margin-top:16px">
        <div class="card-t">單元知識點分布</div>
        ${chapters
          .map(
            (chapter) => `
              <div style="margin-bottom:16px">
                <div style="font-size:12px;font-weight:600;color:#111;margin-bottom:8px">${chapter.name}</div>
                ${renderConceptItems(chapter, maxCount)}
              </div>
            `
          )
          .join("")}
      </div>
    `
  );
}
