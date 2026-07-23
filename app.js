(() => {
  "use strict";

  const DB_NAME = "clairity";
  const DB_VERSION = 2;
  const STORES = { evidence: "evidence", settings: "settings", routine: "routine" };
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const DEFAULT_ROUTINE = [
    { id: "sleep", label: "Sleep", icon: "☾", type: "sleep", time: "07:30", start: "05:00", end: "10:30", days: [0,1,2,3,4,5,6], enabled: true },
    { id: "breakfast", label: "Breakfast", icon: "◉", type: "food", time: "08:30", start: "07:00", end: "10:30", days: [0,1,2,3,4,5,6], enabled: true },
    { id: "supplements", label: "Supplements", icon: "✦", type: "supplements", time: "10:00", start: "08:00", end: "12:00", days: [0,1,2,3,4,5,6], enabled: true },
    { id: "lunch", label: "Lunch", icon: "◒", type: "food", time: "12:30", start: "11:30", end: "15:00", days: [0,1,2,3,4,5,6], enabled: true },
    { id: "workout", label: "Workout", icon: "↗", type: "activity", time: "17:30", start: "16:00", end: "20:00", days: [1,3,5], enabled: true },
    { id: "dinner", label: "Dinner", icon: "●", type: "food", time: "19:00", start: "17:00", end: "21:00", days: [0,1,2,3,4,5,6], enabled: true }
  ];

  const UNSCHEDULED = [
    { id: "mood", label: "Mood", icon: "◌", type: "mood" },
    { id: "symptom", label: "Symptom", icon: "+", type: "symptom" },
    { id: "menstrual", label: "Menstrual", icon: "○", type: "menstrual" },
    { id: "weight", label: "Weight", icon: "↕", type: "weight" },
    { id: "note", label: "Note", icon: "⋯", type: "note" }
  ];

  const state = {
    db: null,
    route: "today",
    settings: { enabledModules: ["sleep"] },
    routine: [],
    now: new Date()
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

    el.main.focus({ preventScroll: true });
  }

  async function renderToday() {
    state.now = new Date();
    const today = dateKey(state.now);
    const records = state.db ? await allEvidence() : [];
    const todayRecords = records.filter(r => r.evidenceDate === today);
    const timeline = buildTimeline(state.routine, todayRecords, state.now);
    const current = rankCurrentActions(timeline, todayRecords, state.now)[0];

    el.main.innerHTML = `
      <div class="stack">
        ${current ? `
          <section class="card current-card">
            <p class="label">Now</p>
            <h2>${escapeHtml(current.label)}</h2>
            <button type="button" data-current-action="${escapeHtml(current.type)}" data-routine-id="${escapeHtml(current.id)}">${escapeHtml(current.label)}</button>
          </section>` : ""}
        <section class="stack">
          <div class="section-head"><div><p class="label">Timeline</p><h2>${timeline.length ? "Your day" : "No routine today"}</h2></div></div>
          <div class="timeline">
            ${timeline.length ? timeline.map(renderTimelineItem).join("") : `<div class="card empty">Add routine items in Settings.</div>`}
          </div>
        </section>
      </div>`;

    el.main.querySelectorAll("[data-current-action],[data-timeline-action]").forEach(button => {
      button.addEventListener("click", () => openAction(button.dataset.currentAction || button.dataset.timelineAction, button.dataset.routineId || ""));
    });
  }

  function buildTimeline(routine, todayRecords, now) {
    const day = now.getDay();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const items = routine
      .filter(item => item.enabled && item.days.includes(day))
      .map(item => {
        const completedRecord = todayRecords.find(record => record.routineId === item.id || (item.type === "sleep" && record.moduleId === "sleep"));
        let status = "upcoming";
        const start = toMinutes(item.start || item.time);
        const end = toMinutes(item.end || item.time);
        if (completedRecord) status = "completed";
        else if (minutesNow >= start && minutesNow <= end) status = "current";
        else if (minutesNow > end) status = "missed";
        return { ...item, status, completedRecord };
      });

    const spontaneous = todayRecords
      .filter(record => !record.routineId && record.moduleId !== "sleep")
      .map(record => ({
        id: record.id,
        label: labelForType(record.moduleId),
        icon: iconForType(record.moduleId),
        type: record.moduleId,
        time: timeFromIso(record.eventAt || record.recordedAt),
        status: "completed",
        completedRecord: record,
        spontaneous: true
      }));

    return [...items, ...spontaneous].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  }

  function rankCurrentActions(timeline, records, now) {
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    return timeline
      .filter(item => item.status !== "completed")
      .map(item => {
        const start = toMinutes(item.start || item.time);
        const end = toMinutes(item.end || item.time);
        let score = 0;
        if (minutesNow >= start && minutesNow <= end) score += 100;
        if (minutesNow > end) score -= 40 + Math.min(40, Math.floor((minutesNow - end) / 30));
        if (minutesNow < start) score += Math.max(0, 30 - Math.floor((start - minutesNow) / 15));
        if (item.type === "sleep" && minutesNow < 11 * 60) score += 12;
        if (item.id === "lunch" && minutesNow >= 11 * 60) score += 15;
        if (item.id === "dinner" && minutesNow >= 17 * 60) score += 15;
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function renderTimelineItem(item) {
    const meta = item.completedRecord ? summaryForRecord(item.completedRecord) : "";
    return `
      <button class="timeline-item ${item.status}" type="button" data-timeline-action="${escapeHtml(item.type)}" data-routine-id="${escapeHtml(item.id)}">
        <span class="timeline-time">${escapeHtml(item.time)}</span>
        <span class="timeline-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
        <span><span class="timeline-title">${escapeHtml(item.label)}</span>${meta ? `<span class="timeline-meta">${escapeHtml(meta)}</span>` : ""}</span>
        <span class="state-mark" aria-hidden="true">${item.status === "completed" ? "✓" : item.status === "current" ? "›" : ""}</span>
      </button>`;
  }

  function openAddSheet() {
    const timeline = buildTimeline(state.routine, [], new Date());
    const ranked = rankCurrentActions(timeline, [], new Date());
    const scheduled = state.routine.filter(item => item.enabled);
    const ordered = uniqueById([...ranked, ...scheduled, ...UNSCHEDULED]);
    openSheet("Add", `
      <div class="action-grid">
        ${ordered.map((item, index) => `
          <button class="action-button ${index === 0 ? "primary" : ""}" type="button" data-add-type="${escapeHtml(item.type)}" data-routine-id="${escapeHtml(item.id || "")}">
            <span aria-hidden="true">${escapeHtml(item.icon || iconForType(item.type))}</span><span>${escapeHtml(item.label || labelForType(item.type))}</span>
          </button>`).join("")}
      </div>`);
    el.overlay.querySelectorAll("[data-add-type]").forEach(button => button.addEventListener("click", () => {
      closeSheet();
      openAction(button.dataset.addType, button.dataset.routineId);
    }));
  }

  function openAction(type, routineId = "") {
    if (type === "sleep") return openSleepEditor(routineId);
    openPlaceholder(type, routineId);
  }

  async function openSleepEditor(routineId = "") {
    const today = dateKey(new Date());
    const existing = await getEvidence("sleep", today);
    const p = existing?.payload || {};
    let quality = Number.isInteger(p.quality) ? p.quality : null;
    openSheet("Sleep", `
      <form class="form" id="sleep-form">
        <div class="field"><label for="wake-date">Date</label><input id="wake-date" name="wakeDate" type="date" value="${escapeHtml(p.wakeDate || p.evidenceDate || today)}"></div>
        <div class="time-row">
          <div class="field"><label for="bed-time">Bed</label><input id="bed-time" name="bedTime" type="time" value="${escapeHtml(p.bedTime || "")}"></div>
          <div class="field"><label for="wake-time">Wake</label><input id="wake-time" name="wakeTime" type="time" value="${escapeHtml(p.wakeTime || "")}"></div>
        </div>
        <fieldset class="field"><legend>Quality</legend><div class="scores">${[1,2,3,4,5].map(n => `<button type="button" data-score="${n}" aria-pressed="${quality === n}">${n}</button>`).join("")}</div></fieldset>
        <div class="field"><label for="sleep-notes">Notes</label><textarea id="sleep-notes" name="notes">${escapeHtml(p.notes || "")}</textarea></div>
        <button class="danger" type="button" data-clear-sleep>Clear</button>
      </form>`);

    const form = document.getElementById("sleep-form");
    let timer;
    const collect = () => {
      const wakeDate = form.wakeDate.value;
      const bedTime = form.bedTime.value;
      const wakeTime = form.wakeTime.value;
      const bedDate = inferBedDate(wakeDate, bedTime, wakeTime);
      return {
        wakeDate,
        bedDate,
        bedTime,
        wakeTime,
        bedAt: bedDate && bedTime ? `${bedDate}T${bedTime}:00` : "",
        wakeAt: wakeDate && wakeTime ? `${wakeDate}T${wakeTime}:00` : "",
        quality,
        notes: form.notes.value.trim()
      };
    };
    const persist = async () => saveEvidence("sleep", collect(), routineId || "sleep", collect().wakeDate);
    [form.wakeDate, form.bedTime, form.wakeTime].forEach(input => input.addEventListener("change", persist));
    form.notes.addEventListener("input", () => {
      clearTimeout(timer);
      setStatus("saving");
      timer = setTimeout(persist, 450);
    });
    form.querySelectorAll("[data-score]").forEach(button => button.addEventListener("click", async () => {
      const score = Number(button.dataset.score);
      quality = quality === score ? null : score;
      form.querySelectorAll("[data-score]").forEach(item => item.setAttribute("aria-pressed", String(Number(item.dataset.score) === quality)));
      await persist();
    }));
    form.querySelector("[data-clear-sleep]").addEventListener("click", async () => {
      if (!confirm("Clear this sleep record?")) return;
      await deleteEvidence(`sleep:${form.wakeDate.value}`);
      closeSheet();
      await renderToday();
    });
  }

  function openPlaceholder(type, routineId = "") {
    const label = labelForType(type);
    openSheet(label, `
      <form class="form" id="quick-form">
        <div class="field"><label for="quick-time">Time</label><input id="quick-time" name="time" type="time" value="${timeNow()}"></div>
        <div class="field"><label for="quick-notes">Notes</label><textarea id="quick-notes" name="notes"></textarea></div>
        <button class="primary-button" type="submit">Add</button>
      </form>`);
    const form = document.getElementById("quick-form");
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const today = dateKey(new Date());
      await saveEvidence(type, { time: form.time.value, notes: form.notes.value.trim() }, routineId, today, `${today}T${form.time.value}:00`);
      closeSheet();
      await renderToday();
    });
  }

  async function renderHistory() {
    const rows = (state.db ? await allEvidence() : []).sort((a, b) => (b.eventAt || b.updatedAt).localeCompare(a.eventAt || a.updatedAt));
    el.main.innerHTML = rows.length ? `<div class="history">${rows.map(record => `
      <article class="card history-item">
        <div class="history-top"><div><strong>${escapeHtml(formatDate(record.evidenceDate))}</strong><div class="meta">${escapeHtml(labelForType(record.moduleId))}</div></div><div class="meta">${escapeHtml(timeFromIso(record.eventAt || record.recordedAt))}</div></div>
        <div class="pills"><span class="pill">${escapeHtml(summaryForRecord(record))}</span></div>
      </article>`).join("")}</div>` : `<div class="card empty">No entries yet.</div>`;
  }

  function renderInsights() {
    el.main.innerHTML = `<div class="card empty">No insights yet.</div>`;
  }

  function renderSettings() {
    el.main.innerHTML = `
      <div class="stack">
        <section class="card settings-block">
          <div class="settings-head"><p class="label">Routine</p><h2>Weekly timeline</h2></div>
          <div id="routine-list">${state.routine.map(renderRoutineRow).join("")}</div>
          <div style="padding:14px"><button class="secondary-button" style="width:100%" type="button" data-add-routine>+ Add item</button></div>
        </section>
      </div>`;

    el.main.querySelectorAll("[data-edit-routine]").forEach(button => button.addEventListener("click", () => openRoutineEditor(button.dataset.editRoutine)));
    el.main.querySelectorAll("[data-delete-routine]").forEach(button => button.addEventListener("click", async () => {
      state.routine = state.routine.filter(item => item.id !== button.dataset.deleteRoutine);
      await saveRoutine(state.routine);
      renderSettings();
    }));
    el.main.querySelector("[data-add-routine]").addEventListener("click", () => openRoutineEditor());
  }

  function renderRoutineRow(item) {
    return `<div class="routine-row">
      <span class="meta">${escapeHtml(item.time)}</span><span aria-hidden="true">${escapeHtml(item.icon)}</span>
      <div><strong>${escapeHtml(item.label)}</strong><div class="meta">${escapeHtml(item.days.map(day => DAYS[day]).join(" "))}</div></div>
      <div class="routine-actions"><button class="mini" type="button" data-edit-routine="${escapeHtml(item.id)}" aria-label="Edit">✎</button><button class="mini" type="button" data-delete-routine="${escapeHtml(item.id)}" aria-label="Delete">×</button></div>
    </div>`;
  }

  function openRoutineEditor(id = "") {
    const existing = state.routine.find(item => item.id === id) || { id: uid(), label: "", icon: "•", type: "custom", time: "09:00", start: "08:00", end: "10:00", days: [1,2,3,4,5], enabled: true };
    openSheet(id ? "Edit routine" : "Add routine", `
      <form class="routine-editor" id="routine-form">
        <div class="field"><label for="routine-label">Name</label><input id="routine-label" name="label" type="text" required value="${escapeHtml(existing.label)}"></div>
        <div class="time-row"><div class="field"><label for="routine-time">Time</label><input id="routine-time" name="time" type="time" value="${existing.time}"></div><div class="field"><label for="routine-icon">Icon</label><input id="routine-icon" name="icon" type="text" maxlength="2" value="${escapeHtml(existing.icon)}"></div></div>
        <div class="time-row"><div class="field"><label for="routine-start">From</label><input id="routine-start" name="start" type="time" value="${existing.start}"></div><div class="field"><label for="routine-end">Until</label><input id="routine-end" name="end" type="time" value="${existing.end}"></div></div>
        <div class="field"><label>Days</label><div class="day-grid">${DAYS.map((day, index) => `<label class="day-chip"><input type="checkbox" name="days" value="${index}" ${existing.days.includes(index) ? "checked" : ""}><span>${day.slice(0,1)}</span></label>`).join("")}</div></div>
        <button class="primary-button" type="submit">Done</button>
      </form>`);
    const form = document.getElementById("routine-form");
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const days = [...form.querySelectorAll('input[name="days"]:checked')].map(input => Number(input.value));
      const next = { ...existing, label: form.label.value.trim(), icon: form.icon.value.trim() || "•", time: form.time.value, start: form.start.value, end: form.end.value, days, enabled: true };
      const index = state.routine.findIndex(item => item.id === next.id);
      index >= 0 ? state.routine.splice(index, 1, next) : state.routine.push(next);
      state.routine.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
      await saveRoutine(state.routine);
      closeSheet();
      renderSettings();
    });
  }

  async function saveEvidence(moduleId, payload, routineId, evidenceDate, eventAt = "") {
    if (!state.db) return setStatus("failed");
    const hasValue = Object.values(payload).some(value => value !== "" && value !== null && value !== undefined);
    if (!hasValue) return;
    setStatus("saving");
    const id = moduleId === "sleep" ? `sleep:${evidenceDate}` : `${moduleId}:${evidenceDate}:${uid()}`;
    const existing = moduleId === "sleep" ? await getEvidence("sleep", evidenceDate) : null;
    const now = new Date().toISOString();
    const record = {
      id,
      moduleId,
      moduleVersion: moduleId === "sleep" ? 2 : 1,
      routineId: routineId || "",
      evidenceDate,
      payload,
      source: "manual",
      eventAt: eventAt || payload.wakeAt || now,
      createdAt: existing?.createdAt || now,
      recordedAt: existing?.recordedAt || now,
      updatedAt: now
    };
    try {
      await put(STORES.evidence, record);
      setStatus("saved");
      if (state.route === "today" && !el.overlay.innerHTML) await renderToday();
    } catch (error) {
      console.error(error);
      setStatus("failed");
    }
  }

  function inferBedDate(wakeDate, bedTime, wakeTime) {
    if (!wakeDate || !bedTime) return "";
    if (!wakeTime || toMinutes(bedTime) < toMinutes(wakeTime)) return wakeDate;
    const date = parseDateKey(wakeDate);
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  }

  function summaryForRecord(record) {
    const p = record.payload || {};
    if (record.moduleId === "sleep") {
      const d = duration(p.bedTime, p.wakeTime);
      return [d, Number.isInteger(p.quality) ? `${p.quality}/5` : ""].filter(Boolean).join(" · ") || "Sleep";
    }
    return p.notes || p.time || labelForType(record.moduleId);
  }

  function openSheet(title, body) {
    el.overlay.innerHTML = `<div class="sheet-backdrop" data-backdrop><section class="sheet" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="sheet-handle"></div><div class="sheet-head"><h2>${escapeHtml(title)}</h2><button class="icon-button" type="button" data-close aria-label="Close">×</button></div>${body}</section></div>`;
    el.overlay.querySelector("[data-close]").addEventListener("click", closeSheet);
    el.overlay.querySelector("[data-backdrop]").addEventListener("click", event => { if (event.target === event.currentTarget) closeSheet(); });
  }
  function closeSheet() { el.overlay.innerHTML = ""; }
  function showToast(message) { el.toast.textContent = message; el.toast.classList.add("show"); setTimeout(() => el.toast.classList.remove("show"), 1400); }
  function setStatus(status) { el.status.dataset.state = status; el.status.setAttribute("aria-label", status === "saving" ? "Saving" : status === "saved" ? "Saved" : status === "failed" ? "Save failed" : "Ready"); if (status === "saved") setTimeout(() => { if (el.status.dataset.state === "saved") el.status.dataset.state = "idle"; }, 900); }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORES.evidence)) {
          const store = db.createObjectStore(STORES.evidence, { keyPath: "id" });
          store.createIndex("evidenceDate", "evidenceDate", { unique: false });
          store.createIndex("moduleId", "moduleId", { unique: false });
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
  function del(name, key) { return req(store(name, "readwrite").delete(key)); }
  function all(name) { return req(store(name).getAll()); }
  function getEvidence(moduleId, date) { return get(STORES.evidence, `${moduleId}:${date}`); }
  function allEvidence() { return all(STORES.evidence); }
  function deleteEvidence(id) { setStatus("saving"); return del(STORES.evidence, id).then(() => setStatus("saved")).catch(() => setStatus("failed")); }

  async function loadSettings() { const row = await get(STORES.settings, "app"); return row?.value || state.settings; }
  async function loadRoutine() { const row = await get(STORES.routine, "weekly"); if (row?.value?.length) return row.value; await saveRoutine(DEFAULT_ROUTINE); return structuredClone(DEFAULT_ROUTINE); }
  async function saveRoutine(value) { setStatus("saving"); await put(STORES.routine, { key: "weekly", value, updatedAt: new Date().toISOString() }); setStatus("saved"); }

  function uniqueById(items) { const seen = new Set(); return items.filter(item => { const key = `${item.type}:${item.id || item.label}`; if (seen.has(key)) return false; seen.add(key); return true; }); }
  function labelForType(type) { return ({ sleep: "Sleep", food: "Food", supplements: "Supplements", activity: "Activity", mood: "Mood", symptom: "Symptom", menstrual: "Menstrual", weight: "Weight", note: "Note", custom: "Entry" })[type] || type; }
  function iconForType(type) { return ({ sleep: "☾", food: "●", supplements: "✦", activity: "↗", mood: "◌", symptom: "+", menstrual: "○", weight: "↕", note: "⋯" })[type] || "•"; }
  function duration(bed, wake) { if (!bed || !wake) return ""; let mins = toMinutes(wake) - toMinutes(bed); if (mins <= 0) mins += 1440; return `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`; }
  function toMinutes(time) { if (!time || !time.includes(":")) return 0; const [h, m] = time.split(":").map(Number); return h * 60 + m; }
  function timeNow() { return new Date().toTimeString().slice(0, 5); }
  function timeFromIso(iso) { if (!iso) return ""; const date = new Date(iso); return Number.isNaN(date.getTime()) ? String(iso).slice(11,16) : new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(date); }
  function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
  function parseDateKey(key) { const [y,m,d] = key.split("-").map(Number); return new Date(y,m-1,d); }
  function formatDate(key) { return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(parseDateKey(key)); }
  function longDate(date) { return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(date); }
  function uid() { return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`; }
  function escapeHtml(value) { return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
})();
