// app.js — основная логика приложения Harmony Map

const state = {
  lang: "ru",
  name: "",
  mode: null, // 'with' | 'without'
  quizList: [],
  quizIndex: 0,
  scaleAnswers: {},
  openAnswers: {},
  photoBase64: null,
  photoMediaType: null,
  traitScores: {},
  careerScores: {},
  personalityText: "",
  physioText: "",
};

function $(id) { return document.getElementById(id); }
function t() { return I18N[state.lang]; }

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("is-active"));
  $(id).classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showError(msg) {
  const el = $("errorBanner");
  el.textContent = msg;
  el.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function clearError() {
  $("errorBanner").style.display = "none";
}

/* ---------------- ШКАЛА ПРОГРЕССА ---------------- */
function setGauge(stepLabel, current, total) {
  $("gauge").classList.add("is-active");
  $("gaugeStepText").textContent = stepLabel;
  $("gaugePercentText").textContent = `${current} / ${total}`;
  $("gaugeFill").style.width = Math.round((current / total) * 100) + "%";
}
function hideGauge() { $("gauge").classList.remove("is-active"); }

/* ---------------- ПРИМЕНЕНИЕ ПЕРЕВОДОВ ---------------- */
function applyI18n() {
  const L = t();
  document.documentElement.lang = state.lang;

  $("landingKicker").textContent = L.landing.kicker;
  $("landingTitle").textContent = L.landing.title;
  $("landingSubtitle").textContent = L.landing.subtitle;
  $("landingNameLabel").textContent = L.landing.nameLabel;
  $("nameInput").placeholder = L.landing.namePlaceholder;
  $("landingLangLabel").textContent = L.landing.langLabel;
  $("startBtn").textContent = L.landing.startBtn;

  $("consentTitle").textContent = L.consent.title;
  $("consentP1").textContent = L.consent.p1;
  $("consentP2").textContent = L.consent.p2;
  $("consentP3").textContent = L.consent.p3;
  $("consentBullets").innerHTML = "";
  L.consent.bullets.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b;
    $("consentBullets").appendChild(li);
  });
  $("consentCheckboxLabel").textContent = L.consent.checkbox;
  $("consentBackBtn").textContent = L.common.back;
  $("consentContinueBtn").textContent = L.consent.continueBtn;

  $("modeTitle").textContent = L.modeSelect.title;
  $("modeSubtitle").textContent = L.modeSelect.subtitle;
  $("modeWithTitle").textContent = L.modeSelect.withTitle;
  $("modeWithDesc").textContent = L.modeSelect.withDesc;
  $("modeWithoutTitle").textContent = L.modeSelect.withoutTitle;
  $("modeWithoutDesc").textContent = L.modeSelect.withoutDesc;
  $("modeBackBtn").textContent = L.common.back;
  $("modeContinueBtn").textContent = L.modeSelect.continueBtn;

  $("quizBackBtn").textContent = L.common.back;
  $("quizOpenInput").placeholder = L.quiz.openPlaceholder;

  $("photoTitle").textContent = L.photo.title;
  $("photoDesc").textContent = L.photo.desc;
  $("photoUploadBtnLabel").textContent = L.photo.uploadBtn;
  $("photoPrivacyNote").textContent = L.photo.privacyNote;
  $("photoSkipBtn").textContent = L.photo.skipBtn;
  $("photoContinueBtn").textContent = L.photo.continueBtn;

  $("analyzingTitle").textContent = L.analyzing.title;

  $("resultsTitle").textContent = L.results.title;
  $("resultsSubtitle").textContent = state.name ? `${L.results.subtitle} — ${state.name}` : L.results.subtitle;
  $("radarTitle").textContent = L.results.radarTitle;
  $("careerRadarTitle").textContent = L.results.careerRadarTitle;
  $("personalityHeader").textContent = L.results.personalityHeader;
  $("physioHeader").textContent = L.results.physioHeader;
  $("compareNote").textContent = L.results.comparisonNote;
  $("downloadPdfBtn").textContent = L.results.downloadPdfBtn;
  $("chatCtaBtn").textContent = L.results.chatCta;
  $("restartBtn").textContent = L.results.restartBtn;

  $("chatTitle").textContent = L.chat.widgetTitle;
  $("chatInput").placeholder = L.chat.placeholder;
}

/* ---------------- 1. LANDING ---------------- */
document.querySelectorAll(".lang-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".lang-chip").forEach((c) => c.classList.remove("is-selected"));
    chip.classList.add("is-selected");
    state.lang = chip.dataset.lang;
    applyI18n();
    checkLandingReady();
  });
});
$("nameInput").addEventListener("input", checkLandingReady);
function checkLandingReady() {
  const ok = $("nameInput").value.trim().length > 0 && document.querySelector(".lang-chip.is-selected");
  $("startBtn").disabled = !ok;
}
$("startBtn").addEventListener("click", () => {
  state.name = $("nameInput").value.trim();
  clearError();
  showScreen("screen-consent");
});

/* ---------------- 2. CONSENT ---------------- */
$("consentCheckbox").addEventListener("change", (e) => {
  $("consentContinueBtn").disabled = !e.target.checked;
});
$("consentBackBtn").addEventListener("click", () => showScreen("screen-landing"));
$("consentContinueBtn").addEventListener("click", () => showScreen("screen-mode"));

/* ---------------- 3. ВЫБОР РЕЖИМА ---------------- */
$("modeWithCard").addEventListener("click", () => selectMode("with"));
$("modeWithoutCard").addEventListener("click", () => selectMode("without"));
function selectMode(mode) {
  state.mode = mode;
  $("modeWithCard").classList.toggle("is-selected", mode === "with");
  $("modeWithoutCard").classList.toggle("is-selected", mode === "without");
  $("modeContinueBtn").disabled = false;
}
$("modeBackBtn").addEventListener("click", () => showScreen("screen-consent"));
$("modeContinueBtn").addEventListener("click", () => {
  buildQuizList();
  state.quizIndex = 0;
  showScreen("screen-quiz");
  renderQuestion();
});

/* ---------------- 4. ТЕСТ ---------------- */
function buildQuizList() {
  state.quizList = [
    ...PERSONALITY_QUESTIONS.map((q) => ({ ...q, type: "scale", section: "personality" })),
    ...CAREER_QUESTIONS.map((q) => ({ ...q, type: "scale", section: "career" })),
    ...OPEN_QUESTIONS.map((q) => ({ ...q, type: "open", section: "open" })),
  ];
}

function renderQuestion() {
  const L = t();
  const q = state.quizList[state.quizIndex];
  const total = state.quizList.length;
  setGauge(L.common.step, state.quizIndex + 1, total);

  const sectionLabelMap = {
    personality: L.quiz.sectionPersonality,
    career: L.quiz.sectionCareer,
    open: L.quiz.sectionOpen,
  };
  $("quizSectionLabel").textContent = sectionLabelMap[q.section];
  $("quizIndex").textContent = `${L.quiz.progress} ${state.quizIndex + 1} / ${total}`;
  $("quizQuestionText").textContent = q.text[state.lang];

  if (q.type === "scale") {
    $("quizScaleRow").style.display = "grid";
    $("quizOpenWrap").style.display = "none";
    $("quizScaleRow").innerHTML = "";
    const selected = state.scaleAnswers[q.id];
    for (let i = 1; i <= 5; i++) {
      const opt = document.createElement("button");
      opt.type = "button";
      opt.className = "scale-opt" + (selected === i ? " is-selected" : "");
      opt.innerHTML = `<span class="dot"></span>${L.quiz.scale[i - 1]}`;
      opt.addEventListener("click", () => {
        state.scaleAnswers[q.id] = i;
        renderQuestion();
      });
      $("quizScaleRow").appendChild(opt);
    }
    $("quizNextBtn").disabled = selected === undefined;
  } else {
    $("quizScaleRow").style.display = "none";
    $("quizOpenWrap").style.display = "block";
    $("quizOpenInput").value = state.openAnswers[q.id] || "";
    $("quizNextBtn").disabled = false;
  }
  $("quizNextBtn").textContent = state.quizIndex === total - 1 ? L.common.continueBtn : L.quiz.nextBtn;
  $("quizBackBtn").style.visibility = state.quizIndex === 0 ? "hidden" : "visible";
}

$("quizOpenInput").addEventListener("input", (e) => {
  const q = state.quizList[state.quizIndex];
  state.openAnswers[q.id] = e.target.value;
});

$("quizBackBtn").addEventListener("click", () => {
  if (state.quizIndex === 0) { showScreen("screen-mode"); return; }
  state.quizIndex--;
  renderQuestion();
});
$("quizNextBtn").addEventListener("click", () => {
  const q = state.quizList[state.quizIndex];
  if (q.type === "open") state.openAnswers[q.id] = $("quizOpenInput").value;
  if (state.quizIndex < state.quizList.length - 1) {
    state.quizIndex++;
    renderQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  computeScores();
  hideGauge();
  if (state.mode === "with") {
    showScreen("screen-photo");
  } else {
    runAnalysis();
  }
}

/* ---------------- ПОДСЧЁТ БАЛЛОВ ---------------- */
function computeScores() {
  const traitSums = {}, traitCounts = {};
  PERSONALITY_QUESTIONS.forEach((q) => {
    const val = state.scaleAnswers[q.id] || 3;
    traitSums[q.trait] = (traitSums[q.trait] || 0) + val;
    traitCounts[q.trait] = (traitCounts[q.trait] || 0) + 1;
  });
  state.traitScores = {};
  Object.keys(traitSums).forEach((k) => {
    state.traitScores[k] = Math.round(((traitSums[k] / traitCounts[k] - 1) / 4) * 100);
  });

  const careerSums = {}, careerCounts = {};
  CAREER_QUESTIONS.forEach((q) => {
    const val = state.scaleAnswers[q.id] || 3;
    careerSums[q.track] = (careerSums[q.track] || 0) + val;
    careerCounts[q.track] = (careerCounts[q.track] || 0) + 1;
  });
  state.careerScores = {};
  Object.keys(careerSums).forEach((k) => {
    state.careerScores[k] = Math.round(((careerSums[k] / careerCounts[k] - 1) / 4) * 100);
  });
}

/* ---------------- 5. ФОТО (ФИЗИОГНОМИКА) ---------------- */
$("photoDrop").addEventListener("click", () => $("photoInput").click());
$("photoInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.photoMediaType = file.type || "image/jpeg";
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    state.photoBase64 = dataUrl.split(",")[1];
    $("photoPreview").src = dataUrl;
    $("photoPreview").style.display = "block";
    $("photoDropInner").style.display = "none";
    $("photoContinueBtn").disabled = false;
  };
  reader.readAsDataURL(file);
});
$("photoSkipBtn").addEventListener("click", () => {
  state.photoBase64 = null;
  state.mode = "without";
  runAnalysis();
});
$("photoContinueBtn").addEventListener("click", () => runAnalysis());

/* ---------------- 6. АНАЛИЗ (ЗАПРОСЫ К API) ---------------- */
let loadingInterval = null;
function startLoadingMessages() {
  const L = t();
  let i = 0;
  $("analyzingMsg").textContent = L.analyzing.messages[0];
  loadingInterval = setInterval(() => {
    i = (i + 1) % L.analyzing.messages.length;
    $("analyzingMsg").textContent = L.analyzing.messages[i];
  }, 1800);
}
function stopLoadingMessages() {
  if (loadingInterval) clearInterval(loadingInterval);
}

async function runAnalysis() {
  clearError();
  showScreen("screen-analyzing");
  startLoadingMessages();

  const openAnswersList = OPEN_QUESTIONS.map((q) => ({
    question: q.text[state.lang],
    answer: state.openAnswers[q.id] || "",
  }));

  const jobs = [
    fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        lang: state.lang,
        name: state.name,
        traitScores: state.traitScores,
        careerScores: state.careerScores,
        openAnswers: openAnswersList,
      }),
    }).then((r) => r.json()),
  ];

  if (state.mode === "with" && state.photoBase64) {
    jobs.push(
      fetch("/api/physiognomy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lang: state.lang,
          name: state.name,
          imageBase64: state.photoBase64,
          mediaType: state.photoMediaType,
        }),
      }).then((r) => r.json())
    );
  }

  try {
    const results = await Promise.all(jobs);
    stopLoadingMessages();

    if (results[0].error) throw new Error(results[0].error);
    state.personalityText = results[0].text;

    if (results[1]) {
      if (results[1].error) throw new Error(results[1].error);
      state.physioText = results[1].text;
    } else {
      state.physioText = "";
    }
    renderResults();
    showScreen("screen-results");
  } catch (err) {
    stopLoadingMessages();
    showScreen("screen-mode");
    showError(t().errors.generic + " (" + err.message + ")");
  }
}

/* ---------------- 7. РЕЗУЛЬТАТЫ ---------------- */
function renderResults() {
  const L = t();
  applyI18n(); // обновит подзаголовок с именем

  $("radarTraits").innerHTML = buildRadarSVG(state.traitScores, TRAIT_LABELS, state.lang, "var(--steel)");
  $("radarCareer").innerHTML = buildRadarSVG(state.careerScores, CAREER_LABELS, state.lang, "var(--brass)");

  $("personalityBody").textContent = state.personalityText;

  if (state.physioText) {
    $("physioPanel").style.display = "block";
    $("physioBody").textContent = state.physioText;
    $("compareNote").style.display = "block";
    $("compareGrid").classList.remove("single");
  } else {
    $("physioPanel").style.display = "none";
    $("compareNote").style.display = "none";
    $("compareGrid").classList.add("single");
  }

  let ctx = `${L.results.personalityHeader}:\n${state.personalityText}`;
  if (state.physioText) ctx += `\n\n${L.results.physioHeader}:\n${state.physioText}`;
  window.HM_chatContext = { resultsContext: ctx, hasPhysiognomy: !!state.physioText };
  $("chatToggle").classList.remove("is-hidden");
}

$("chatCtaBtn").addEventListener("click", () => window.HM_openChat && window.HM_openChat());

/* ---------------- РАДАР-ДИАГРАММА (SVG) ---------------- */
function buildRadarSVG(scores, labels, lang, colorVar) {
  const keys = Object.keys(scores);
  if (keys.length === 0) return "";
  const n = keys.length;
  const cx = 160, cy = 150, R = 82;
  const angleFor = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const rings = [0.33, 0.66, 1]
    .map((level) => {
      const pts = keys
        .map((_, i) => {
          const a = angleFor(i);
          return `${(cx + Math.cos(a) * R * level).toFixed(1)},${(cy + Math.sin(a) * R * level).toFixed(1)}`;
        })
        .join(" ");
      return `<polygon points="${pts}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
    })
    .join("");

  const axes = keys
    .map((_, i) => {
      const a = angleFor(i);
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1"/>`;
    })
    .join("");

  const dataPts = keys.map((k, i) => {
    const a = angleFor(i);
    const val = Math.max(4, scores[k]) / 100;
    return { x: cx + Math.cos(a) * R * val, y: cy + Math.sin(a) * R * val };
  });
  const dataPoly = dataPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const dots = dataPts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${colorVar}"/>`).join("");

  const labelsSvg = keys
    .map((k, i) => {
      const a = angleFor(i);
      const lx = cx + Math.cos(a) * (R + 22), ly = cy + Math.sin(a) * (R + 22);
      let anchor = "middle";
      if (Math.cos(a) > 0.25) anchor = "start";
      else if (Math.cos(a) < -0.25) anchor = "end";
      const label = (labels[k] && labels[k][lang]) || k;
      return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-family="JetBrains Mono, monospace" font-size="8.5" fill="var(--muted)">${label}</text>`;
    })
    .join("");

  return `<svg viewBox="0 0 320 300" style="width:100%;height:auto;overflow:visible">
    ${rings}${axes}
    <polygon points="${dataPoly}" fill="${colorVar}" fill-opacity="0.22" stroke="${colorVar}" stroke-width="2"/>
    ${dots}${labelsSvg}
  </svg>`;
}

/* ---------------- ЭКСПОРТ В PDF ---------------- */
$("downloadPdfBtn").addEventListener("click", exportPdf);
async function exportPdf() {
  const btn = $("downloadPdfBtn");
  const original = btn.textContent;
  btn.textContent = "…";
  btn.disabled = true;
  try {
    const canvas = await html2canvas($("pdfArea"), { backgroundColor: "#0e1922", scale: 2, useCORS: true });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    let heightLeft = imgH, position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    pdf.save(`harmony-map-${(state.name || "result").replace(/\s+/g, "_")}.pdf`);
  } catch (err) {
    showError(t().errors.generic + " (PDF: " + err.message + ")");
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}

$("restartBtn").addEventListener("click", () => window.location.reload());

/* ---------------- ИНИЦИАЛИЗАЦИЯ ---------------- */
applyI18n();
