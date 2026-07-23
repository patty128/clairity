(() => {
  "use strict";

  const DB_NAME = "clairity";
  const DB_VERSION = 3;
  const STORES = { evidence: "evidence", settings: "settings", routine: "routine" };
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const ALL_DAYS = [0,1,2,3,4,5,6];
  const WEEKDAYS = [1,2,3,4,5];
  const WEEKENDS = [0,6];

  const MODULES = {
    sleep: {
      label: "Sleep", icon: "☾",
      subtypes: [{ id: "sleep", label: "Sleep", defaultTime: "07:30", start: "05:00", end: "10:30" }]
    },
    nutrition: {
      label: "Food", icon: "●",
      subtypes: [
        { id: "breakfast", label: "Breakfast", defaultTime: "08:30", start: "07:00", end: "10:30" },
        { id: "lunch", label: "Lunch", defaultTime: "12:30", start: "11:30", end: "15:00" },
        { id: "dinner", label: "Dinner", defaultTime: "19:00", start: "17:00", end: "21:00" },
        { id: "snack", label: "Snack", defaultTime: "15:30", start: "14:00", end: "17:00" },
        { id: "meal", label: "Meal", defaultTime: "12:00", start: "10:00", end: "14:00" }
      ]
    },
    supplements: {
      label: "Supplements", icon: "✦",
      subtypes: [
        { id: "supplements", label: "Supplements", defaultTime: "10:00", start: "08:00", end: "12:00" },
        { id: "morning", label: "Morning supplements", defaultTime: "09:00", start: "07:00", end: "11:00" },
        { id: "evening", label: "Evening supplements", defaultTime: "20:00", start: "18:00", end: "22:00" }
      ]
    },
    medication: {
      label: "Medication", icon: "◇",
      subtypes: [
        { id: "medication", label: "Medication", defaultTime: "09:00", start: "07:00", end: "11:00" },
        { id: "morning", label: "Morning medication", defaultTime: "09:00", start: "07:00", end: "11:00" },
        { id: "evening", label: "Evening medication", defaultTime: "20:00", start: "18:00", end: "22:00" }
      ]
    },
    activity: {
      label: "Activity", icon: "↗",
      subtypes: [
        { id: "workout", label: "Workout", defaultTime: "17:30", start: "16:00", end: "20:00" },
        { id: "walk", label: "Walk", defaultTime: "13:00", start: "11:00", end: "18:00" },
        { id: "yoga", label: "Yoga / Pilates", defaultTime: "18:00", start: "16:00", end: "21:00" },
        { id: "movement", label: "Movement", defaultTime: "17:00", start: "12:00", end: "21:00" }
      ]
    },
    weight: {
      label: "Weight", icon: "↕",
      subtypes: [{ id: "weight", label: "Weight", defaultTime: "08:00", start: "06:00", end: "11:00" }]
    },
    mood: { label: "Mood", icon: "◌", subtypes: [{ id: "mood", label: "Mood" }] },
    symptoms: { label: "Symptoms", icon: "+", subtypes: [{ id: "symptom", label: "Symptom" }] },
    menstrual: { label: "Menstrual", icon: "○", subtypes: [{ id: "menstrual", label: "Menstrual" }] },
    note: { label: "Note", icon: "⋯", subtypes: [{ id: "note", label: "Note" }] }
  };

  const SCHEDULED_MODULE_IDS = ["sleep", "nutrition", "supplements", "medication", "activity", "weight"];
  const UNSCHEDULED_MODULE_IDS = ["mood", "symptoms", "menstrual", "note"];

  const DEFAULT_ROUTINE = [
    routineItem("sleep", "sleep", ALL_DAYS),
    routineItem("nutrition", "breakfast", ALL_DAYS),
    routineItem("supplements", "supplements", ALL_DAYS),
    routineItem("nutrition", "lunch", ALL_DAYS),
    routineItem("activity", "workout", [1,3,5]),
    routineItem("nutrition", "dinner", ALL_DAYS)
  ];

  const state = {
    db: null,
    route: "today",
    settings: {},
    routine: [],
    now: new Date(),
    wizard: null
  };

  const el = {
    main: document.getElementById("main-content"),
    title: document.getElementById("page-title"),
    subtitle: document.getElementById("page-subtitle"),
    status: document.getElementById("save-status"),
    nav: [...document.querySelectorAll(".nav-item")],
    add: document.getElementById("add-button"),
    overlay: document.getElementById("overlay-root"),
    toast: document.getElementById("toast")
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    bindGlobalEvents();
    try {
      state.db = await openDb();
      state.settings = await loadSettings();
      state.routine = await loadRoutine();
      setStatus("saved");
    } catch (error) {
      console.error(error);
      setStatus("failed");
    }
    await render();
  }

  function bindGlobalEvents() {
    el.nav.forEach(button => button.addEventListener("click", async () => {
      state.route = button.dataset.route;
      await render();
    }));
    el.add.addEventListener("click", openAddSheet);
    window.addEventListener("focus", async () => {
      state.now = new Date();
      if (state.route === "today") await renderToday();
    });
  }

  async function render() {
    const meta = {
      today: ["Today", longDate(new Date())],
      history: ["History", ""],
      insights: ["Insights", ""],
      settings: ["Settings", ""]
    }[state.route];

    el.title.textContent = meta[0];
    el.subtitle.textContent = meta[1];
    el.nav.forEach(button => {
      const active = button.dataset.route === state.route;
      button.classList.toggle("active", active);
      active ? button.setAttribute("aria-current", "page") : button.removeAttribute("aria-current");
    });
    el.add.classList.toggle("hidden", state.route === "settings");

    if (state.route === "today") await renderToday();
    else if (state.route === "history") await renderHistory();
    else if (state.route === "insights") renderInsights();
    else renderSettings();
  }

  async function renderToday() {
    state.now = new Date();
    const today = dateKey(state.now);
    const records = state.db ? await allEvidence() : [];
    const todayRecords = records.filter(record => record.evidenceDate === today);
    const timeline = buildTimeline(state.routine, todayRecords, state.now);
    const current = rankCurrentActions(timeline, state.now)[0];

    el.main.innerHTML = `
      <div class="stack">
        ${current ? `
          <section class="card current-card">
            <p class="label">Now</p>
            <h2>${escapeHtml(current.label)}</h2>
            <button type="button" data-open-routine="${escapeHtml(current.id)}">${escapeHtml(current.label)}</button>
          </section>` : ""}
        <section class="stack">
          <div class="section-head"><div><p class="label">Timeline</p><h2>${timeline.length ? "Your day" : "No routine today"}</h2></div></div>
          <div class="timeline">
            ${timeline.length ? timeline.map(renderTimelineItem).join("") : `<div class="card empty">Set your routine in Settings.</div>`}
          </div>
        </section>
      </div>`;

    el.main.querySelectorAll("[data-open-routine]").forEach(button => {
      button.addEventListener("click", () => {
        const routine = state.routine.find(item => item.id === button.dataset.openRoutine);
        if (routine) openEvidenceEditor(routine.moduleId, routine.evidenceType, routine.id);
      });
    });
    el.main.querySelectorAll("[data-open-record]").forEach(button => {
      button.addEventListener("click", () => openEvidenceRecord(button.dataset.openRecord));
    });
  }

  function buildTimeline(routine, todayRecords, now) {
    const day = now.getDay();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const routineItems = routine
      .filter(item => item.enabled !== false && item.days.includes(day))
      .map(item => {
        const completedRecord = findCompletionRecord(item, todayRecords);
        let status = "upcoming";
        const start = toMinutes(item.windowStart || item.targetTime);
        const end = toMinutes(item.windowEnd || item.targetTime);
        if (completedRecord) status = "completed";
        else if (minutesNow >= start && minutesNow <= end) status = "current";
        else if (minutesNow > end) status = "missed";
        return { ...item, status, completedRecord };
      });

    const spontaneous = todayRecords
      .filter(record => !record.routineId)
      .map(record => ({
        id: record.id,
        label: record.payload?.label || evidenceLabel(record.moduleId, record.evidenceType),
        icon: moduleIcon(record.moduleId),
        moduleId: record.moduleId,
        evidenceType: record.evidenceType,
        targetTime: timeFromIso(record.eventAt || record.recordedAt),
        status: "completed",
        completedRecord: record,
        spontaneous: true
      }));

    return [...routineItems, ...spontaneous].sort((a, b) => toMinutes(a.targetTime) - toMinutes(b.targetTime));
  }

  function findCompletionRecord(item, records) {
    return records.find(record => {
      if (record.routineId === item.id) return true;
      if (item.moduleId === "sleep" && record.moduleId === "sleep") return true;
      return false;
    });
  }

  function rankCurrentActions(timeline, now) {
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    return timeline
      .filter(item => !item.spontaneous && item.status !== "completed")
      .map(item => {
        const start = toMinutes(item.windowStart || item.targetTime);
        const end = toMinutes(item.windowEnd || item.targetTime);
        let score = 0;
        if (minutesNow >= start && minutesNow <= end) score += 100;
        if (minutesNow < start) score += Math.max(0, 28 - Math.floor((start - minutesNow) / 15));
        if (minutesNow > end) score -= 60 + Math.floor((minutesNow - end) / 30);
        if (item.evidenceType === "lunch" && minutesNow >= 11 * 60) score += 18;
        if (item.evidenceType === "dinner" && minutesNow >= 17 * 60) score += 18;
        if (item.moduleId === "sleep" && minutesNow < 11 * 60) score += 12;
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function renderTimelineItem(item) {
    const recordId = item.completedRecord?.id || "";
    const actionAttr = recordId ? `data-open-record="${escapeHtml(recordId)}"` : `data-open-routine="${escapeHtml(item.id)}"`;
    return `
      <button class="timeline-item ${item.status}" type="button" ${actionAttr}>
        <span class="timeline-time">${escapeHtml(item.targetTime)}</span>
        <span class="timeline-icon" aria-hidden="true">${escapeHtml(item.icon || moduleIcon(item.moduleId))}</span>
        <span>
          <span class="timeline-title">${escapeHtml(item.label)}</span>
          ${item.completedRecord ? `<span class="timeline-meta">${escapeHtml(summaryForRecord(item.completedRecord))}</span>` : ""}
        </span>
        <span class="state-mark" aria-hidden="true">${item.status === "completed" ? "✓" : item.status === "current" ? "›" : ""}</span>
      </button>`;
  }

  function openAddSheet() {
    const now = new Date();
    const today = dateKey(now);
    Promise.resolve(allEvidence()).then(records => {
      const timeline = buildTimeline(state.routine, records.filter(r => r.evidenceDate === today), now);
      const ranked = rankCurrentActions(timeline, now);
      const routineActions = uniqueByKey([...ranked, ...state.routine.filter(item => item.enabled !== false)], item => item.id);
      const unscheduled = UNSCHEDULED_MODULE_IDS.map(moduleId => ({
        id: `add-${moduleId}`,
        label: MODULES[moduleId].label,
        icon: MODULES[moduleId].icon,
        moduleId,
        evidenceType: MODULES[moduleId].subtypes[0].id
      }));
      const ordered = [...routineActions, ...unscheduled];
      openSheet("Add", `
        <div class="action-grid">
          ${ordered.map((item, index) => `
            <button class="action-button ${index === 0 ? "primary" : ""}" type="button" data-add-module="${escapeHtml(item.moduleId)}" data-add-type="${escapeHtml(item.evidenceType)}" data-routine-id="${escapeHtml(item.id || "")}">
              <span aria-hidden="true">${escapeHtml(item.icon || moduleIcon(item.moduleId))}</span>
              <span>${escapeHtml(item.label)}</span>
            </button>`).join("")}
        </div>`);
      el.overlay.querySelectorAll("[data-add-module]").forEach(button => button.addEventListener("click", () => {
        const routineId = state.routine.some(item => item.id === button.dataset.routineId) ? button.dataset.routineId : "";
        closeSheet();
        openEvidenceEditor(button.dataset.addModule, button.dataset.addType, routineId);
      }));
    });
  }

  function openEvidenceEditor(moduleId, evidenceType, routineId = "", existingRecord = null) {
    if (moduleId === "sleep") return openSleepEditor(routineId, existingRecord);
    if (moduleId === "nutrition") return openNutritionEditor(evidenceType, routineId, existingRecord);
    if (moduleId === "supplements" || moduleId === "medication") return openIntakeEditor(moduleId, evidenceType, routineId, existingRecord);
    if (moduleId === "activity") return openActivityEditor(evidenceType, routineId, existingRecord);
    if (moduleId === "weight") return openWeightEditor(routineId, existingRecord);
    if (moduleId === "mood") return openMoodEditor(existingRecord);
    if (moduleId === "symptoms") return openSymptomEditor(existingRecord);
    if (moduleId === "menstrual") return openMenstrualEditor(existingRecord);
    openNoteEditor(existingRecord);
  }

  async function openEvidenceRecord(recordId) {
    const record = await get(STORES.evidence, recordId);
    if (record) openEvidenceEditor(record.moduleId, record.evidenceType, record.routineId, record);
  }

  async function openSleepEditor(routineId = "", existingRecord = null) {
    const today = dateKey(new Date());
    const existing = existingRecord || await getEvidence("sleep", today);
    const p = existing?.payload || {};
    let quality = Number.isInteger(p.quality) ? p.quality : null;
    openFormSheet("Sleep", `
      <form class="form" id="evidence-form">
        <div class="field"><label for="wake-date">Date</label><input id="wake-date" name="wakeDate" type="date" value="${escapeHtml(p.wakeDate || existing?.evidenceDate || today)}"></div>
        <div class="time-row">
          <div class="field"><label for="bed-time">Bed</label><input id="bed-time" name="bedTime" type="time" value="${escapeHtml(p.bedTime || "23:00")}"></div>
          <div class="field"><label for="wake-time">Wake</label><input id="wake-time" name="wakeTime" type="time" value="${escapeHtml(p.wakeTime || timeNow())}"></div>
        </div>
        <div class="field"><label>Quality</label><div class="scores">${[1,2,3,4,5].map(score => `<button type="button" data-score="${score}" aria-pressed="${quality === score}">${score}</button>`).join("")}</div></div>
        <div class="field"><label for="notes">Notes</label><textarea id="notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const wakeDate = form.wakeDate.value || today;
        const bedDate = inferBedDate(wakeDate, form.bedTime.value, form.wakeTime.value);
        const wakeAt = `${wakeDate}T${form.wakeTime.value || "00:00"}:00`;
        await saveEvidence({
          existing,
          moduleId: "sleep",
          evidenceType: "sleep",
          routineId,
          evidenceDate: wakeDate,
          eventAt: wakeAt,
          payload: { wakeDate, bedDate, bedTime: form.bedTime.value, wakeTime: form.wakeTime.value, quality, notes: form.notes.value.trim(), label: "Sleep" }
        });
      });
    el.overlay.querySelectorAll("[data-score]").forEach(button => button.addEventListener("click", () => {
      quality = Number(button.dataset.score);
      el.overlay.querySelectorAll("[data-score]").forEach(item => item.setAttribute("aria-pressed", String(Number(item.dataset.score) === quality)));
    }));
  }

  function openNutritionEditor(evidenceType, routineId = "", existing = null) {
    const label = subtypeLabel("nutrition", evidenceType);
    const p = existing?.payload || {};
    openFormSheet(label, `
      <form class="form" id="evidence-form">
        <div class="field"><label for="time">Time</label><input id="time" name="time" type="time" value="${escapeHtml(p.time || timeNow())}"></div>
        <div class="field"><label for="food">Food</label><textarea id="food" name="food" placeholder="">${escapeHtml(p.food || "")}</textarea></div>
        <div class="time-row">
          <div class="field"><label for="calories">Calories</label><input id="calories" name="calories" type="number" min="0" inputmode="decimal" value="${escapeHtml(p.calories || "")}"></div>
          <div class="field"><label for="protein">Protein (g)</label><input id="protein" name="protein" type="number" min="0" inputmode="decimal" value="${escapeHtml(p.protein || "")}"></div>
        </div>
        <div class="time-row">
          <div class="field"><label for="carbs">Carbs (g)</label><input id="carbs" name="carbs" type="number" min="0" inputmode="decimal" value="${escapeHtml(p.carbs || "")}"></div>
          <div class="field"><label for="fat">Fat (g)</label><input id="fat" name="fat" type="number" min="0" inputmode="decimal" value="${escapeHtml(p.fat || "")}"></div>
        </div>
        <div class="field"><label for="notes">Notes</label><textarea id="notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const evidenceDate = existing?.evidenceDate || dateKey(new Date());
        await saveEvidence({ existing, moduleId: "nutrition", evidenceType, routineId, evidenceDate, eventAt: `${evidenceDate}T${form.time.value}:00`, payload: {
          label, time: form.time.value, food: form.food.value.trim(), calories: numberOrBlank(form.calories.value), protein: numberOrBlank(form.protein.value), carbs: numberOrBlank(form.carbs.value), fat: numberOrBlank(form.fat.value), notes: form.notes.value.trim()
        }});
      });
  }

  function openIntakeEditor(moduleId, evidenceType, routineId = "", existing = null) {
    const label = subtypeLabel(moduleId, evidenceType);
    const p = existing?.payload || {};
    openFormSheet(label, `
      <form class="form" id="evidence-form">
        <div class="field"><label for="time">Time</label><input id="time" name="time" type="time" value="${escapeHtml(p.time || timeNow())}"></div>
        <div class="field"><label for="items">${moduleId === "medication" ? "Medication" : "Supplements"}</label><textarea id="items" name="items">${escapeHtml(p.items || "")}</textarea></div>
        <div class="field"><label for="notes">Notes</label><textarea id="notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const evidenceDate = existing?.evidenceDate || dateKey(new Date());
        await saveEvidence({ existing, moduleId, evidenceType, routineId, evidenceDate, eventAt: `${evidenceDate}T${form.time.value}:00`, payload: { label, time: form.time.value, items: form.items.value.trim(), notes: form.notes.value.trim() }});
      });
  }

  function openActivityEditor(evidenceType, routineId = "", existing = null) {
    const label = subtypeLabel("activity", evidenceType);
    const p = existing?.payload || {};
    openFormSheet(label, `
      <form class="form" id="evidence-form">
        <div class="field"><label for="time">Time</label><input id="time" name="time" type="time" value="${escapeHtml(p.time || timeNow())}"></div>
        <div class="time-row">
          <div class="field"><label for="duration">Minutes</label><input id="duration" name="duration" type="number" min="0" inputmode="numeric" value="${escapeHtml(p.duration || "")}"></div>
          <div class="field"><label for="intensity">Intensity</label><select id="intensity" name="intensity"><option value=""></option>${["Low","Moderate","High"].map(v => `<option ${p.intensity === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        </div>
        <div class="field"><label for="notes">Notes</label><textarea id="notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const evidenceDate = existing?.evidenceDate || dateKey(new Date());
        await saveEvidence({ existing, moduleId: "activity", evidenceType, routineId, evidenceDate, eventAt: `${evidenceDate}T${form.time.value}:00`, payload: { label, time: form.time.value, duration: numberOrBlank(form.duration.value), intensity: form.intensity.value, notes: form.notes.value.trim() }});
      });
  }

  function openWeightEditor(routineId = "", existing = null) {
    const p = existing?.payload || {};
    openFormSheet("Weight", `
      <form class="form" id="evidence-form">
        <div class="field"><label for="weight">Weight</label><input id="weight" name="weight" type="number" min="0" step="0.1" inputmode="decimal" value="${escapeHtml(p.weight || "")}"></div>
        <div class="field"><label for="unit">Unit</label><select id="unit" name="unit"><option value="lb" ${p.unit !== "kg" ? "selected" : ""}>lb</option><option value="kg" ${p.unit === "kg" ? "selected" : ""}>kg</option></select></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const evidenceDate = existing?.evidenceDate || dateKey(new Date());
        await saveEvidence({ existing, moduleId: "weight", evidenceType: "weight", routineId, evidenceDate, payload: { label: "Weight", weight: numberOrBlank(form.weight.value), unit: form.unit.value }});
      });
  }

  function openMoodEditor(existing = null) {
    const p = existing?.payload || {};
    openFormSheet("Mood", `
      <form class="form" id="evidence-form">
        <div class="field"><label for="mood">Mood</label><input id="mood" name="mood" type="text" value="${escapeHtml(p.mood || "")}"></div>
        <div class="field"><label>Intensity</label><div class="scores">${[1,2,3,4,5].map(v => `<button type="button" data-value="${v}" aria-pressed="${p.intensity === v}">${v}</button>`).join("")}</div></div>
        <div class="field"><label for="notes">Context</label><textarea id="notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const intensity = Number(el.overlay.querySelector('[data-value][aria-pressed="true"]')?.dataset.value || 0) || "";
        const evidenceDate = existing?.evidenceDate || dateKey(new Date());
        await saveEvidence({ existing, moduleId: "mood", evidenceType: "mood", evidenceDate, payload: { label: "Mood", mood: form.mood.value.trim(), intensity, notes: form.notes.value.trim() }});
      });
    bindSingleSelect("[data-value]");
  }

  function openSymptomEditor(existing = null) {
    const p = existing?.payload || {};
    openFormSheet("Symptom", `
      <form class="form" id="evidence-form">
        <div class="field"><label for="symptom">Symptom</label><input id="symptom" name="symptom" type="text" value="${escapeHtml(p.symptom || "")}"></div>
        <div class="field"><label>Severity</label><div class="scores">${[1,2,3,4,5].map(v => `<button type="button" data-value="${v}" aria-pressed="${p.severity === v}">${v}</button>`).join("")}</div></div>
        <div class="field"><label for="notes">Notes</label><textarea id="notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const severity = Number(el.overlay.querySelector('[data-value][aria-pressed="true"]')?.dataset.value || 0) || "";
        const evidenceDate = existing?.evidenceDate || dateKey(new Date());
        await saveEvidence({ existing, moduleId: "symptoms", evidenceType: "symptom", evidenceDate, payload: { label: form.symptom.value.trim() || "Symptom", symptom: form.symptom.value.trim(), severity, notes: form.notes.value.trim() }});
      });
    bindSingleSelect("[data-value]");
  }

  function openMenstrualEditor(existing = null) {
    const p = existing?.payload || {};
    openFormSheet("Menstrual", `
      <form class="form" id="evidence-form">
        <div class="field"><label for="event">Event</label><select id="event" name="event">${["Period started","Bleeding","Spotting","Ovulation signs","Cramps","Other"].map(v => `<option ${p.event === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        <div class="field"><label for="notes">Notes</label><textarea id="notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const evidenceDate = existing?.evidenceDate || dateKey(new Date());
        await saveEvidence({ existing, moduleId: "menstrual", evidenceType: "menstrual", evidenceDate, payload: { label: form.event.value, event: form.event.value, notes: form.notes.value.trim() }});
      });
  }

  function openNoteEditor(existing = null) {
    const p = existing?.payload || {};
    openFormSheet("Note", `
      <form class="form" id="evidence-form">
        <div class="field"><label for="notes">Note</label><textarea id="notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      </form>`, async () => {
        const form = document.getElementById("evidence-form");
        const evidenceDate = existing?.evidenceDate || dateKey(new Date());
        await saveEvidence({ existing, moduleId: "note", evidenceType: "note", evidenceDate, payload: { label: "Note", notes: form.notes.value.trim() }});
      });
  }

  function bindSingleSelect(selector) {
    el.overlay.querySelectorAll(selector).forEach(button => button.addEventListener("click", () => {
      el.overlay.querySelectorAll(selector).forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    }));
  }

  async function renderHistory() {
    const records = state.db ? (await allEvidence()).sort((a,b) => new Date(b.eventAt || b.updatedAt) - new Date(a.eventAt || a.updatedAt)) : [];
    el.main.innerHTML = records.length ? `<div class="history">${records.map(record => `
      <button class="card history-item" type="button" data-history-id="${escapeHtml(record.id)}">
        <div class="history-top"><strong>${escapeHtml(record.payload?.label || evidenceLabel(record.moduleId, record.evidenceType))}</strong><span class="meta">${escapeHtml(formatDate(record.evidenceDate))}</span></div>
        <div class="pills"><span class="pill">${escapeHtml(summaryForRecord(record))}</span></div>
      </button>`).join("")}</div>` : `<div class="card empty">No evidence yet.</div>`;
    el.main.querySelectorAll("[data-history-id]").forEach(button => button.addEventListener("click", () => openEvidenceRecord(button.dataset.historyId)));
  }

  function renderInsights() {
    el.main.innerHTML = `<div class="card empty">Insights will appear as your evidence grows.</div>`;
  }

  function renderSettings() {
    const groups = groupRoutine(state.routine);
    el.main.innerHTML = `
      <div class="stack">
        <section class="card settings-block">
          <div class="settings-head"><p class="label">Routine</p><h2>Weekly timeline</h2></div>
          ${groups.length ? groups.map(group => `
            <div class="routine-group">
              <div class="routine-group-title">${escapeHtml(group.label)}</div>
              ${group.items.map(renderRoutineRow).join("")}
            </div>`).join("") : `<div class="empty">No routine items.</div>`}
          <button class="primary-button settings-add" type="button" id="add-routine">Add to routine</button>
        </section>
      </div>`;

    document.getElementById("add-routine").addEventListener("click", () => openRoutineWizard());
    el.main.querySelectorAll("[data-edit-routine]").forEach(button => button.addEventListener("click", () => openRoutineWizard(button.dataset.editRoutine)));
  }

  function groupRoutine(routine) {
    const map = new Map();
    [...routine].sort((a,b) => toMinutes(a.targetTime) - toMinutes(b.targetTime)).forEach(item => {
      const key = daysKey(item.days);
      if (!map.has(key)) map.set(key, { label: daysLabel(item.days), items: [] });
      map.get(key).items.push(item);
    });
    return [...map.values()].sort((a,b) => groupPriority(a.label) - groupPriority(b.label));
  }

  function renderRoutineRow(item) {
    return `
      <div class="routine-row">
        <div class="routine-time">${escapeHtml(item.targetTime)}</div>
        <div class="routine-icon" aria-hidden="true">${escapeHtml(item.icon || moduleIcon(item.moduleId))}</div>
        <div class="routine-copy"><strong>${escapeHtml(item.label)}</strong><div class="meta">${escapeHtml(MODULES[item.moduleId]?.label || item.moduleId)}</div></div>
        <button class="mini" type="button" data-edit-routine="${escapeHtml(item.id)}" aria-label="Edit ${escapeHtml(item.label)}">✎</button>
      </div>`;
  }

  function openRoutineWizard(id = "") {
    const existing = state.routine.find(item => item.id === id);
    state.wizard = existing ? structuredClone(existing) : {
      id: uid(), moduleId: "", evidenceType: "", subtype: "", label: "", icon: "", targetTime: "09:00", windowStart: "08:00", windowEnd: "10:00", days: WEEKDAYS.slice(), enabled: true
    };
    renderRoutineWizardStep(existing ? 2 : 1, Boolean(existing));
  }

  function renderRoutineWizardStep(step, editing = false) {
    if (step === 1) {
      openSheet(editing ? "Edit routine" : "Add routine", `
        <div class="progress-dots"><span class="progress-dot active"></span><span class="progress-dot"></span><span class="progress-dot"></span></div>
        <div class="choice-list">
          ${SCHEDULED_MODULE_IDS.map(moduleId => `<button class="choice-button" type="button" data-module-choice="${moduleId}"><span class="choice-main"><span class="choice-icon">${MODULES[moduleId].icon}</span><span>${MODULES[moduleId].label}</span></span><span>›</span></button>`).join("")}
        </div>`);
      el.overlay.querySelectorAll("[data-module-choice]").forEach(button => button.addEventListener("click", () => {
        state.wizard.moduleId = button.dataset.moduleChoice;
        const options = MODULES[state.wizard.moduleId].subtypes;
        if (options.length === 1) {
          applySubtype(options[0]);
          renderRoutineWizardStep(3, editing);
        } else {
          renderRoutineWizardStep(2, editing);
        }
      }));
      return;
    }

    if (step === 2) {
      const module = MODULES[state.wizard.moduleId];
      openSheet(editing ? "Edit routine" : module.label, `
        <div class="progress-dots"><span class="progress-dot"></span><span class="progress-dot active"></span><span class="progress-dot"></span></div>
        <div class="choice-list">
          ${module.subtypes.map(option => `<button class="choice-button" type="button" data-subtype-choice="${option.id}"><span class="choice-main"><span class="choice-icon">${module.icon}</span><span>${escapeHtml(option.label)}</span></span><span>›</span></button>`).join("")}
        </div>`);
      el.overlay.querySelectorAll("[data-subtype-choice]").forEach(button => button.addEventListener("click", () => {
        applySubtype(module.subtypes.find(option => option.id === button.dataset.subtypeChoice));
        renderRoutineWizardStep(3, editing);
      }));
      return;
    }

    openFormSheet(editing ? "Edit routine" : "When", `
      <div class="progress-dots"><span class="progress-dot"></span><span class="progress-dot"></span><span class="progress-dot active"></span></div>
      <form class="form" id="routine-form">
        <span class="summary-chip">${escapeHtml(moduleIcon(state.wizard.moduleId))} ${escapeHtml(state.wizard.label)}</span>
        <div class="field"><label for="routine-label">Name</label><input id="routine-label" name="label" type="text" value="${escapeHtml(state.wizard.label)}" required></div>
        <div class="field"><label for="target-time">Around</label><input id="target-time" name="targetTime" type="time" value="${escapeHtml(state.wizard.targetTime)}"></div>
        <div class="time-row">
          <div class="field"><label for="window-start">From</label><input id="window-start" name="windowStart" type="time" value="${escapeHtml(state.wizard.windowStart)}"></div>
          <div class="field"><label for="window-end">Until</label><input id="window-end" name="windowEnd" type="time" value="${escapeHtml(state.wizard.windowEnd)}"></div>
        </div>
        <div class="field">
          <label>Days</label>
          <div class="day-presets">
            <button type="button" class="preset-chip" data-day-preset="all">Every day</button>
            <button type="button" class="preset-chip" data-day-preset="weekdays">Weekdays</button>
            <button type="button" class="preset-chip" data-day-preset="weekends">Weekends</button>
          </div>
          <div class="day-grid">${DAYS.map((day,index) => `<label class="day-chip"><input type="checkbox" name="days" value="${index}" ${state.wizard.days.includes(index) ? "checked" : ""}><span>${day.slice(0,1)}</span></label>`).join("")}</div>
        </div>
      </form>`, async () => {
        const form = document.getElementById("routine-form");
        const days = [...form.querySelectorAll('input[name="days"]:checked')].map(input => Number(input.value));
        if (!days.length) return showToast("Choose a day");
        const next = {
          ...state.wizard,
          label: form.label.value.trim(),
          targetTime: form.targetTime.value,
          windowStart: form.windowStart.value,
          windowEnd: form.windowEnd.value,
          days,
          icon: moduleIcon(state.wizard.moduleId),
          enabled: true
        };
        const index = state.routine.findIndex(item => item.id === next.id);
        index >= 0 ? state.routine.splice(index, 1, next) : state.routine.push(next);
        await saveRoutine(state.routine);
        closeSheet();
        renderSettings();
      }, editing ? `<button class="danger" type="button" id="delete-routine">Delete</button>` : "");

    el.overlay.querySelectorAll("[data-day-preset]").forEach(button => button.addEventListener("click", () => {
      const values = button.dataset.dayPreset === "all" ? ALL_DAYS : button.dataset.dayPreset === "weekdays" ? WEEKDAYS : WEEKENDS;
      el.overlay.querySelectorAll('input[name="days"]').forEach(input => input.checked = values.includes(Number(input.value)));
    }));
    const deleteButton = document.getElementById("delete-routine");
    if (deleteButton) deleteButton.addEventListener("click", async () => {
      state.routine = state.routine.filter(item => item.id !== state.wizard.id);
      await saveRoutine(state.routine);
      closeSheet();
      renderSettings();
    });
  }

  function applySubtype(option) {
    state.wizard.evidenceType = option.id;
    state.wizard.subtype = option.id;
    state.wizard.label = option.label;
    state.wizard.icon = moduleIcon(state.wizard.moduleId);
    state.wizard.targetTime = option.defaultTime || state.wizard.targetTime;
    state.wizard.windowStart = option.start || state.wizard.windowStart;
    state.wizard.windowEnd = option.end || state.wizard.windowEnd;
  }

  async function saveEvidence({ existing = null, moduleId, evidenceType, routineId = "", evidenceDate, payload, eventAt = "" }) {
    const hasValue = Object.values(payload || {}).some(value => value !== "" && value !== null && value !== undefined);
    if (!state.db || !hasValue) return setStatus("failed");
    setStatus("saving");
    const now = new Date().toISOString();
    const id = existing?.id || (moduleId === "sleep" ? `sleep:${evidenceDate}` : `${moduleId}:${evidenceDate}:${uid()}`);
    const record = {
      id,
      moduleId,
      moduleVersion: 1,
      evidenceType,
      routineId,
      evidenceDate,
      payload,
      source: "manual",
      eventAt: eventAt || existing?.eventAt || now,
      createdAt: existing?.createdAt || now,
      recordedAt: existing?.recordedAt || now,
      updatedAt: now
    };
    try {
      await put(STORES.evidence, record);
      setStatus("saved");
      closeSheet();
      if (state.route === "today") await renderToday();
      if (state.route === "history") await renderHistory();
    } catch (error) {
      console.error(error);
      setStatus("failed");
    }
  }

  function openSheet(title, body) {
    el.overlay.innerHTML = `
      <div class="sheet-backdrop" data-backdrop>
        <section class="sheet" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <div class="sheet-top"><div class="sheet-handle"></div><div class="sheet-head"><h2>${escapeHtml(title)}</h2><button class="icon-button" type="button" data-close aria-label="Close">×</button></div></div>
          <div class="sheet-body">${body}</div>
          <div class="sheet-footer hidden" id="sheet-footer"></div>
        </section>
      </div>`;
    bindSheetClose();
  }

  function openFormSheet(title, body, onSubmit, extraFooter = "") {
    openSheet(title, body);
    const footer = document.getElementById("sheet-footer");
    footer.classList.remove("hidden");
    footer.innerHTML = `${extraFooter}<button class="primary-button" type="button" id="sheet-done">Done</button>`;
    document.getElementById("sheet-done").addEventListener("click", onSubmit);
  }

  function bindSheetClose() {
    el.overlay.querySelector("[data-close]").addEventListener("click", closeSheet);
    el.overlay.querySelector("[data-backdrop]").addEventListener("click", event => { if (event.target === event.currentTarget) closeSheet(); });
  }

  function closeSheet() { el.overlay.innerHTML = ""; state.wizard = null; }
  function showToast(message) { el.toast.textContent = message; el.toast.classList.add("show"); setTimeout(() => el.toast.classList.remove("show"), 1400); }
  function setStatus(status) {
    el.status.dataset.state = status;
    el.status.setAttribute("aria-label", status === "saving" ? "Saving" : status === "saved" ? "Saved" : status === "failed" ? "Save failed" : "Ready");
    if (status === "saved") setTimeout(() => { if (el.status.dataset.state === "saved") el.status.dataset.state = "idle"; }, 900);
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORES.evidence)) {
          const evidence = db.createObjectStore(STORES.evidence, { keyPath: "id" });
          evidence.createIndex("evidenceDate", "evidenceDate", { unique: false });
          evidence.createIndex("moduleId", "moduleId", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.settings)) db.createObjectStore(STORES.settings, { keyPath: "key" });
        if (!db.objectStoreNames.contains(STORES.routine)) db.createObjectStore(STORES.routine, { keyPath: "key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function store(name, mode = "readonly") { return state.db.transaction(name, mode).objectStore(name); }
  function req(request) { return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
  function get(name, key) { return req(store(name).get(key)); }
  function put(name, value) { return req(store(name, "readwrite").put(value)); }
  function all(name) { return req(store(name).getAll()); }
  function getEvidence(moduleId, date) { return get(STORES.evidence, `${moduleId}:${date}`); }
  function allEvidence() { return all(STORES.evidence); }

  async function loadSettings() {
    const row = await get(STORES.settings, "app");
    return row?.value || {};
  }

  async function loadRoutine() {
    const row = await get(STORES.routine, "weekly");
    if (!row?.value?.length) {
      await saveRoutine(DEFAULT_ROUTINE);
      return structuredClone(DEFAULT_ROUTINE);
    }
    const migrated = row.value.map(migrateRoutineItem);
    if (JSON.stringify(migrated) !== JSON.stringify(row.value)) await saveRoutine(migrated);
    return migrated;
  }

  async function saveRoutine(value) {
    setStatus("saving");
    await put(STORES.routine, { key: "weekly", value, updatedAt: new Date().toISOString() });
    setStatus("saved");
  }

  function migrateRoutineItem(item) {
    if (item.moduleId && item.evidenceType) return item;
    const legacyType = item.type || "note";
    const legacyMap = {
      sleep: ["sleep", "sleep"],
      food: ["nutrition", inferFoodSubtype(item.label)],
      supplements: ["supplements", "supplements"],
      activity: ["activity", item.label?.toLowerCase().includes("walk") ? "walk" : "workout"],
      weight: ["weight", "weight"],
      mood: ["mood", "mood"],
      symptom: ["symptoms", "symptom"],
      menstrual: ["menstrual", "menstrual"],
      note: ["note", "note"],
      custom: ["note", "note"]
    };
    const [moduleId, evidenceType] = legacyMap[legacyType] || ["note", "note"];
    return {
      id: item.id || uid(),
      moduleId,
      evidenceType,
      subtype: evidenceType,
      label: item.label || subtypeLabel(moduleId, evidenceType),
      icon: moduleIcon(moduleId),
      targetTime: item.targetTime || item.time || "09:00",
      windowStart: item.windowStart || item.start || item.time || "08:00",
      windowEnd: item.windowEnd || item.end || item.time || "10:00",
      days: Array.isArray(item.days) ? item.days : WEEKDAYS.slice(),
      enabled: item.enabled !== false
    };
  }

  function routineItem(moduleId, evidenceType, days) {
    const option = MODULES[moduleId].subtypes.find(item => item.id === evidenceType) || MODULES[moduleId].subtypes[0];
    return {
      id: `${moduleId}-${evidenceType}`,
      moduleId,
      evidenceType,
      subtype: evidenceType,
      label: option.label,
      icon: MODULES[moduleId].icon,
      targetTime: option.defaultTime,
      windowStart: option.start,
      windowEnd: option.end,
      days: days.slice(),
      enabled: true
    };
  }

  function inferFoodSubtype(label = "") {
    const text = label.toLowerCase();
    if (text.includes("breakfast")) return "breakfast";
    if (text.includes("lunch")) return "lunch";
    if (text.includes("dinner")) return "dinner";
    if (text.includes("snack")) return "snack";
    return "meal";
  }

  function evidenceLabel(moduleId, evidenceType) { return subtypeLabel(moduleId, evidenceType) || MODULES[moduleId]?.label || moduleId; }
  function subtypeLabel(moduleId, evidenceType) { return MODULES[moduleId]?.subtypes.find(item => item.id === evidenceType)?.label || MODULES[moduleId]?.label || evidenceType; }
  function moduleIcon(moduleId) { return MODULES[moduleId]?.icon || "•"; }

  function summaryForRecord(record) {
    const p = record.payload || {};
    if (record.moduleId === "sleep") return [duration(p.bedTime, p.wakeTime), p.quality ? `${p.quality}/5` : ""].filter(Boolean).join(" · ") || "Sleep";
    if (record.moduleId === "nutrition") return [p.food, p.calories ? `${p.calories} kcal` : ""].filter(Boolean).join(" · ") || record.payload?.label || "Food";
    if (record.moduleId === "weight") return p.weight ? `${p.weight} ${p.unit || "lb"}` : "Weight";
    if (record.moduleId === "activity") return [p.duration ? `${p.duration} min` : "", p.intensity].filter(Boolean).join(" · ") || record.payload?.label || "Activity";
    if (record.moduleId === "supplements" || record.moduleId === "medication") return p.items || record.payload?.label || MODULES[record.moduleId].label;
    if (record.moduleId === "mood") return [p.mood, p.intensity ? `${p.intensity}/5` : ""].filter(Boolean).join(" · ") || "Mood";
    if (record.moduleId === "symptoms") return [p.symptom, p.severity ? `${p.severity}/5` : ""].filter(Boolean).join(" · ") || "Symptom";
    if (record.moduleId === "menstrual") return p.event || "Menstrual";
    return p.notes || record.payload?.label || MODULES[record.moduleId]?.label || "Entry";
  }

  function inferBedDate(wakeDate, bedTime, wakeTime) {
    if (!wakeDate || !bedTime) return "";
    if (!wakeTime || toMinutes(bedTime) < toMinutes(wakeTime)) return wakeDate;
    const date = parseDateKey(wakeDate);
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  }

  function duration(bed, wake) {
    if (!bed || !wake) return "";
    let minutes = toMinutes(wake) - toMinutes(bed);
    if (minutes <= 0) minutes += 1440;
    return `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
  }

  function groupPriority(label) {
    if (label === "Every day") return 0;
    if (label === "Weekdays") return 1;
    if (label === "Weekends") return 2;
    return 3;
  }

  function daysKey(days) { return [...days].sort((a,b) => a-b).join(","); }
  function daysLabel(days) {
    const key = daysKey(days);
    if (key === daysKey(ALL_DAYS)) return "Every day";
    if (key === daysKey(WEEKDAYS)) return "Weekdays";
    if (key === daysKey(WEEKENDS)) return "Weekends";
    return [...days].sort((a,b) => a-b).map(day => DAYS[day]).join(" · ");
  }

  function uniqueByKey(items, keyFn) {
    const seen = new Set();
    return items.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function numberOrBlank(value) { return value === "" ? "" : Number(value); }
  function toMinutes(time) { if (!time || !time.includes(":")) return 0; const [h,m] = time.split(":").map(Number); return h * 60 + m; }
  function timeNow() { return new Date().toTimeString().slice(0,5); }
  function timeFromIso(iso) { const date = new Date(iso); return Number.isNaN(date.getTime()) ? String(iso || "").slice(11,16) : new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(date); }
  function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
  function parseDateKey(key) { const [y,m,d] = key.split("-").map(Number); return new Date(y,m-1,d); }
  function formatDate(key) { return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(parseDateKey(key)); }
  function longDate(date) { return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(date); }
  function uid() { return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`; }
  function escapeHtml(value) { return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
})();
