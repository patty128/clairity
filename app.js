
(() => {
"use strict";

const DB_NAME="clairity", DB_VERSION=4;
const STORES={evidence:"evidence",settings:"settings",routine:"routine",supplements:"supplements"};
const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const state={db:null,route:"today",routine:[],supplements:[],settings:{},now:new Date()};
const el={
  main:document.getElementById("main-content"),title:document.getElementById("page-title"),
  subtitle:document.getElementById("page-subtitle"),status:document.getElementById("save-status"),
  nav:[...document.querySelectorAll(".nav-item")],add:document.getElementById("add-button"),
  overlay:document.getElementById("overlay-root"),toast:document.getElementById("toast")
};

document.addEventListener("DOMContentLoaded",init);

async function init(){
  bindGlobal();
  state.db=await openDb();
  state.settings=await getSetting("appSettings")||{periodLeadDays:3};
  state.routine=await getAll(STORES.routine);
  state.supplements=await getAll(STORES.supplements);
  await render();
}

function bindGlobal(){
  el.nav.forEach(b=>b.addEventListener("click",async()=>{state.route=b.dataset.route;await render()}));
  el.add.addEventListener("click",openAddSheet);
}

async function render(){
  state.now=new Date();
  const meta={today:["Today",longDate(state.now)],history:["History","Recorded evidence"],insights:["Insights","Patterns build over time"],settings:["Settings","Configure Clairity"]}[state.route];
  el.title.textContent=meta[0];el.subtitle.textContent=meta[1];
  el.nav.forEach(b=>b.classList.toggle("active",b.dataset.route===state.route));
  el.add.classList.toggle("hidden",state.route==="settings");
  if(state.route==="today")await renderToday();
  if(state.route==="history")await renderHistory();
  if(state.route==="insights")await renderInsights();
  if(state.route==="settings")await renderSettings();
}

async function renderToday(){
  const records=await getAll(STORES.evidence), today=dateKey(state.now);
  const todayRecords=records.filter(r=>r.evidenceDate===today);
  const cycle=deriveCycle(records);
  const periodCheck=shouldShowPeriodCheck(cycle,todayRecords);
  const scheduledSupps=getScheduledSupplements(state.now);
  const suppGroup=scheduledSupps.length?{
    id:"supplements-today",time:scheduledSupps[0].time||"09:00",icon:"✦",label:"Supplements",
    summary:`${scheduledSupps.length} scheduled`,status:supplementStatus(todayRecords,scheduledSupps)
  }:null;
  const timeline=[
    {id:"mood",time:"",icon:"◌",label:"Mood",summary:recordSummary(todayRecords,"mood"),status:hasModule(todayRecords,"mood")?"completed":"available"},
    {id:"energy",time:"",icon:"⚡",label:"Energy",summary:recordSummary(todayRecords,"energy"),status:hasModule(todayRecords,"energy")?"completed":"available"},
    suppGroup,
    ...todayRecords.filter(r=>["symptoms","menstrual"].includes(r.moduleId)).map(r=>({
      id:r.id,time:timeFromIso(r.eventAt),icon:r.moduleId==="symptoms"?"+":"○",
      label:r.moduleId==="symptoms"?(r.payload.name||"Symptom"):"Menstrual",
      summary:summaryForRecord(r),status:"completed",record:true
    }))
  ].filter(Boolean);

  el.main.innerHTML=`
    ${periodCheck?renderPeriodCheck(cycle):""}
    ${renderCycleCard(cycle)}
    <section class="card">
      <div class="section-head"><div><p class="eyebrow">Today</p><h2>Your evidence</h2></div></div>
      <div class="timeline">
        ${timeline.map(renderTimeline).join("")}
      </div>
    </section>`;
  bindTodayActions();
}

function renderPeriodCheck(cycle){
  const label=cycle.predictedStart?`Period expected ${friendlyRelative(cycle.predictedStart)}`:"Period check";
  return `<section class="card period-check">
    <p class="eyebrow">Cycle</p><h2>${label}</h2>
    <p class="muted">Record today once. Nothing dismisses this check until tomorrow.</p>
    <div class="quick-grid">
      <button data-period-quick="bleeding" data-status="bleeding">● Bleeding</button>
      <button data-period-quick="spotting" data-status="spotting">◐ Spotting</button>
      <button data-period-quick="none" data-status="none">○ Nothing</button>
    </div>
  </section>`;
}

function renderCycleCard(cycle){
  const days=cycle.displayDays;
  const dots=days.map(d=>{
    const c=d.status?d.status:(d.estimated?"estimated":"");
    return `<span class="day-dot ${c} ${d.today?"today":""}" title="${d.date}">${d.day}</span>`;
  }).join("");
  return `<section class="card cycle-wrap">
    <div class="section-head"><div><p class="eyebrow">Cycle</p><h2>${cycle.currentCycleDay?`Day ${cycle.currentCycleDay}`:"Building your cycle"}</h2></div>
      <span class="badge">${cycle.confidence} confidence</span></div>
    <div class="cycle-ring">
      <svg class="cycle-svg" viewBox="0 0 200 200" role="img" aria-label="Current menstrual cycle">
        <circle cx="100" cy="100" r="78" fill="none" stroke="#dfe6df" stroke-width="18"/>
        <circle cx="100" cy="100" r="78" fill="none" stroke="#8d4354" stroke-width="18"
          stroke-linecap="round" stroke-dasharray="${cycle.ringBleed} 490" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="78" fill="none" stroke="#cfd9d1" stroke-width="6"
          stroke-dasharray="${cycle.ringEstimate} 490" stroke-dashoffset="${-cycle.ringEstimateOffset}" transform="rotate(-90 100 100)"/>
      </svg>
      <div class="cycle-centre"><div><strong>${cycle.daysUntilPeriod!=null?cycle.daysUntilPeriod:"—"}</strong><br><span class="muted">${cycle.daysUntilPeriod===1?"day":"days"} to expected period</span></div></div>
    </div>
    <div class="calendar-strip">${dots}</div>
    <div class="legend">
      <span style="--legend:var(--bleed)">Bleeding</span>
      <span style="--legend:var(--spot)">Spotting</span>
      <span style="--legend:var(--estimate)">Estimated</span>
    </div>
  </section>`;
}

function renderTimeline(item){
  const summary=item.summary?`<small class="muted">${escapeHtml(item.summary)}</small>`:"";
  const status=item.status==="completed"?"✓":item.status==="taken"?"✓":item.status==="partial"?"•":"›";
  const attr=item.record?`data-open-record="${item.id}"`:`data-open-action="${item.id}"`;
  return `<div class="timeline-item"><button type="button" ${attr}>
    <span class="timeline-time">${item.time||"Anytime"}</span>
    <span class="timeline-icon">${item.icon}</span>
    <span><strong>${escapeHtml(item.label)}</strong><br>${summary}</span>
    <span class="status ${item.status}">${status}</span>
  </button></div>`;
}

function bindTodayActions(){
  document.querySelectorAll("[data-period-quick]").forEach(b=>b.addEventListener("click",()=>saveMenstrualQuick(b.dataset.periodQuick)));
  document.querySelectorAll("[data-open-action]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.openAction;
    if(id==="mood")openMood();
    if(id==="energy")openEnergy();
    if(id==="supplements-today")openSupplementIntake();
  }));
  document.querySelectorAll("[data-open-record]").forEach(b=>b.addEventListener("click",()=>openRecord(b.dataset.openRecord)));
}

async function saveMenstrualQuick(status){
  const payload={status,flow:null};
  if(status==="bleeding"){
    openSheet("Bleeding",`<div class="form-grid"><label>Flow<select id="flow"><option value="light">Light</option><option value="medium" selected>Medium</option><option value="heavy">Heavy</option></select></label></div>`,
      `<button class="primary" id="save-flow">Record bleeding</button>`);
    document.getElementById("save-flow").addEventListener("click",async()=>{payload.flow=document.getElementById("flow").value;await saveEvidence("menstrual","daily",payload);closeSheet();await renderToday()});
  }else{await saveEvidence("menstrual","daily",payload);toast("Recorded");await renderToday()}
}

function openMood(existing=null){
  openScaleSheet("Mood","How does today feel?",existing?.payload?.value,async value=>{
    await saveEvidence("mood","mood",{value,label:["Very low","Low","Neutral","Good","Very good"][value-1]},existing?.id);
  });
}

function openEnergy(existing=null){
  openSheet("Energy",`<div class="form-grid">
    <div><label>Physical energy</label>${scaleHtml("physical",existing?.payload?.physical)}</div>
    <div><label>Mental energy</label>${scaleHtml("mental",existing?.payload?.mental)}</div>
  </div>`,`<button id="save-energy" class="primary">Done</button>`);
  bindScaleButtons();
  document.getElementById("save-energy").addEventListener("click",async()=>{
    const physical=selectedScale("physical"),mental=selectedScale("mental");
    if(!physical||!mental)return toast("Choose both energy levels");
    await saveEvidence("energy","energy",{physical,mental},existing?.id);closeSheet();await render();
  });
}

function openSymptom(existing=null){
  openSheet(existing?"Edit symptom":"Add symptom",`<div class="form-grid">
    <label>Symptom<input id="symptom-name" value="${escapeHtml(existing?.payload?.name||"")}" placeholder="e.g. pelvic pain"></label>
    <div><label>Severity</label>${scaleHtml("severity",existing?.payload?.severity,10)}</div>
    <label>Notes<textarea id="symptom-notes">${escapeHtml(existing?.payload?.notes||"")}</textarea></label>
  </div>`,`<button id="save-symptom" class="primary">Done</button>`);
  bindScaleButtons();
  document.getElementById("save-symptom").addEventListener("click",async()=>{
    const name=document.getElementById("symptom-name").value.trim(),severity=selectedScale("severity");
    if(!name||!severity)return toast("Add a symptom and severity");
    await saveEvidence("symptoms","symptom",{name,severity,notes:document.getElementById("symptom-notes").value.trim()},existing?.id);
    closeSheet();await render();
  });
}

function openSupplementIntake(){
  const scheduled=getScheduledSupplements(new Date());
  openSheet("Supplements",`<div class="list">${scheduled.map(s=>`
    <label class="list-row switch"><span><strong>${escapeHtml(s.name)}</strong><br><small class="muted">${escapeHtml(s.dose)} ${escapeHtml(s.unit)}</small></span>
      <input type="checkbox" data-supp-taken="${s.id}" checked>
    </label>`).join("")}</div>`,
    `<button id="save-supps" class="primary">Done</button>`);
  document.getElementById("save-supps").addEventListener("click",async()=>{
    const taken=[...document.querySelectorAll("[data-supp-taken]")];
    for(const input of taken){
      const s=scheduled.find(x=>x.id===input.dataset.suppTaken);
      await saveEvidence("supplements","intake",{supplementId:s.id,name:s.name,dose:s.dose,unit:s.unit,status:input.checked?"taken":"skipped"});
    }
    closeSheet();await render();
  });
}

function openAddSheet(){
  openSheet("Add",`<div class="list">
    ${actionRow("mood","◌","Mood")}
    ${actionRow("energy","⚡","Energy")}
    ${actionRow("symptom","+","Symptom")}
    ${actionRow("menstrual","○","Bleeding or spotting")}
    ${actionRow("supplements","✦","Supplements")}
  </div>`);
  document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{
    const a=b.dataset.add;closeSheet();
    if(a==="mood")openMood();
    if(a==="energy")openEnergy();
    if(a==="symptom")openSymptom();
    if(a==="menstrual")openMenstrualEditor();
    if(a==="supplements")openSupplementIntake();
  }));
}

function actionRow(id,icon,label){return `<button type="button" class="list-row icon-button" data-add="${id}"><span>${icon} &nbsp; <strong>${label}</strong></span><span>›</span></button>`}

function openMenstrualEditor(existing=null){
  openSheet("Menstrual",`<div class="form-grid">
    <div class="chips">
      ${["none","spotting","bleeding"].map(x=>`<button class="chip ${existing?.payload?.status===x?"selected":""}" data-menstrual-status="${x}">${title(x)}</button>`).join("")}
    </div>
    <label>Flow<select id="menstrual-flow"><option value="">Not applicable</option><option value="light">Light</option><option value="medium">Medium</option><option value="heavy">Heavy</option></select></label>
  </div>`,`<button id="save-menstrual" class="primary">Done</button>`);
  document.querySelectorAll("[data-menstrual-status]").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("[data-menstrual-status]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
  }));
  document.getElementById("save-menstrual").addEventListener("click",async()=>{
    const selected=document.querySelector("[data-menstrual-status].selected");
    if(!selected)return toast("Choose bleeding, spotting or nothing");
    await saveEvidence("menstrual","daily",{status:selected.dataset.menstrualStatus,flow:document.getElementById("menstrual-flow").value||null},existing?.id);
    closeSheet();await render();
  });
}

async function renderHistory(){
  const records=(await getAll(STORES.evidence)).sort((a,b)=>b.eventAt.localeCompare(a.eventAt));
  el.main.innerHTML=`<section class="card"><div class="section-head"><div><p class="eyebrow">Evidence</p><h2>History</h2></div>
    <select id="history-filter"><option value="all">All</option><option value="mood">Mood</option><option value="energy">Energy</option><option value="symptoms">Symptoms</option><option value="menstrual">Menstrual</option><option value="supplements">Supplements</option></select></div>
    <div id="history-list" class="list"></div></section>`;
  const draw=()=>{
    const f=document.getElementById("history-filter").value;
    document.getElementById("history-list").innerHTML=records.filter(r=>f==="all"||r.moduleId===f).map(r=>`
      <button class="list-row icon-button" data-history-record="${r.id}"><span><strong>${escapeHtml(historyTitle(r))}</strong><br><small class="muted">${longDate(new Date(r.eventAt))} · ${escapeHtml(summaryForRecord(r))}</small></span><span>›</span></button>`).join("")||"<p class='muted'>No evidence yet.</p>";
    document.querySelectorAll("[data-history-record]").forEach(b=>b.addEventListener("click",()=>openRecord(b.dataset.historyRecord)));
  };
  document.getElementById("history-filter").addEventListener("change",draw);draw();
}

async function renderInsights(){
  const records=await getAll(STORES.evidence),cycle=deriveCycle(records);
  const symptoms=records.filter(r=>r.moduleId==="symptoms");
  const linked=symptoms.map(s=>{
    const next=cycle.periodStarts.find(d=>d>new Date(s.evidenceDate+"T12:00:00"));
    return next?{name:s.payload.name,days:Math.round((next-new Date(s.evidenceDate+"T12:00:00"))/86400000)}:null;
  }).filter(Boolean);
  const groups={};linked.forEach(x=>{(groups[x.name]??=[]).push(x.days)});
  const patterns=Object.entries(groups).filter(([,v])=>v.length>=2).map(([name,v])=>`${name} has appeared ${Math.min(...v)}–${Math.max(...v)} days before bleeding.`);
  el.main.innerHTML=`<section class="card"><p class="eyebrow">Cycle patterns</p><h2>What Clairity can see</h2>
    ${patterns.length?`<div class="list">${patterns.map(p=>`<div class="list-row"><span>${escapeHtml(p)}</span></div>`).join("")}</div>`:
    `<p class="muted">Patterns will appear after symptoms and later bleed starts can be compared across cycles.</p>`}
    <p class="muted">Cycle phase and ovulation are estimates, not confirmed events.</p></section>`;
}

async function renderSettings(){
  state.supplements=await getAll(STORES.supplements);
  el.main.innerHTML=`<section class="card"><div class="section-head"><div><p class="eyebrow">Supplements</p><h2>Your supplement list</h2></div><button class="secondary" id="add-supplement">Add</button></div>
    <div class="list">${state.supplements.map(s=>`<button class="list-row icon-button" data-edit-supp="${s.id}"><span><strong>${escapeHtml(s.name)}</strong><br><small class="muted">${escapeHtml(s.dose)} ${escapeHtml(s.unit)} · ${escapeHtml(scheduleSummary(s))}</small></span><span class="badge">${s.active?"Active":"Inactive"}</span></button>`).join("")||"<p class='muted'>No supplements configured.</p>"}</div></section>
    <section class="card"><p class="eyebrow">Cycle</p><h2>Period check</h2>
      <label>Show from
        <select id="period-lead"><option value="2">2 days before</option><option value="3">3 days before</option><option value="4">4 days before</option><option value="5">5 days before</option></select>
      </label>
    </section>`;
  document.getElementById("period-lead").value=String(state.settings.periodLeadDays||3);
  document.getElementById("period-lead").addEventListener("change",async e=>{state.settings.periodLeadDays=Number(e.target.value);await put(STORES.settings,{key:"appSettings",value:state.settings});toast("Updated")});
  document.getElementById("add-supplement").addEventListener("click",()=>openSupplementDefinition());
  document.querySelectorAll("[data-edit-supp]").forEach(b=>b.addEventListener("click",()=>openSupplementDefinition(state.supplements.find(s=>s.id===b.dataset.editSupp))));
}

function openSupplementDefinition(existing=null){
  openSheet(existing?"Edit supplement":"Add supplement",`<div class="form-grid">
    <label>Name<input id="supp-name" value="${escapeHtml(existing?.name||"")}"></label>
    <div class="metric-grid"><label>Dose<input id="supp-dose" value="${escapeHtml(existing?.dose||"")}"></label><label>Unit<input id="supp-unit" value="${escapeHtml(existing?.unit||"capsule")}"></label></div>
    <label>Time<input id="supp-time" type="time" value="${existing?.time||"09:00"}"></label>
    <div><label>Days</label><div class="chips">${DAYS.map((d,i)=>`<button class="chip ${(existing?.days||[0,1,2,3,4,5,6]).includes(i)?"selected":""}" data-day="${i}">${d}</button>`).join("")}</div></div>
    <label class="switch"><input id="supp-active" type="checkbox" ${existing?.active!==false?"checked":""}> Active</label>
  </div>`,`<button id="save-supp-def" class="primary">Done</button>`);
  document.querySelectorAll("[data-day]").forEach(b=>b.addEventListener("click",()=>b.classList.toggle("selected")));
  document.getElementById("save-supp-def").addEventListener("click",async()=>{
    const name=document.getElementById("supp-name").value.trim(),dose=document.getElementById("supp-dose").value.trim(),unit=document.getElementById("supp-unit").value.trim();
    if(!name||!dose||!unit)return toast("Complete name, dose and unit");
    const active=document.getElementById("supp-active").checked, now=new Date().toISOString();
    const record={id:existing?.id||crypto.randomUUID(),name,dose,unit,time:document.getElementById("supp-time").value,
      days:[...document.querySelectorAll("[data-day].selected")].map(b=>Number(b.dataset.day)),active,
      activeFrom:existing?.activeFrom||now,inactiveFrom:active?null:(existing?.inactiveFrom||now),updatedAt:now};
    await put(STORES.supplements,record);closeSheet();await renderSettings();
  });
}

async function openRecord(id){
  const r=await get(STORES.evidence,id);if(!r)return;
  if(r.moduleId==="mood")return openMood(r);
  if(r.moduleId==="energy")return openEnergy(r);
  if(r.moduleId==="symptoms")return openSymptom(r);
  if(r.moduleId==="menstrual")return openMenstrualEditor(r);
  openSheet(historyTitle(r),`<p>${escapeHtml(summaryForRecord(r))}</p>`,`<button class="danger" id="delete-record">Delete</button>`);
  document.getElementById("delete-record").addEventListener("click",async()=>{await remove(STORES.evidence,id);closeSheet();await render()});
}

function openScaleSheet(titleText,prompt,value,onSave){
  openSheet(titleText,`<div class="form-grid"><label>${prompt}</label>${scaleHtml("value",value)}</div>`,`<button id="save-scale" class="primary">Done</button>`);
  bindScaleButtons();
  document.getElementById("save-scale").addEventListener("click",async()=>{const v=selectedScale("value");if(!v)return toast("Choose a value");await onSave(v);closeSheet();await render()});
}
function scaleHtml(name,value,max=5){return `<div class="scale" data-scale="${name}">${Array.from({length:max},(_,i)=>`<button type="button" data-scale-name="${name}" data-scale-value="${i+1}" class="${Number(value)===i+1?"selected":""}">${i+1}</button>`).join("")}</div>`}
function bindScaleButtons(){document.querySelectorAll("[data-scale-name]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(`[data-scale-name="${b.dataset.scaleName}"]`).forEach(x=>x.classList.remove("selected"));b.classList.add("selected")}))}
function selectedScale(name){return Number(document.querySelector(`[data-scale-name="${name}"].selected`)?.dataset.scaleValue||0)}

function openSheet(titleText,body,foot=""){
  el.overlay.innerHTML=`<div class="sheet-backdrop"><section class="sheet" role="dialog" aria-modal="true"><header class="sheet-head"><h2>${escapeHtml(titleText)}</h2><button class="icon-button" id="close-sheet">✕</button></header><div class="sheet-body">${body}</div>${foot?`<footer class="sheet-foot">${foot}</footer>`:""}</section></div>`;
  document.getElementById("close-sheet").addEventListener("click",closeSheet);
  document.querySelector(".sheet-backdrop").addEventListener("click",e=>{if(e.target.classList.contains("sheet-backdrop"))closeSheet()});
}
function closeSheet(){el.overlay.innerHTML=""}

async function saveEvidence(moduleId,evidenceType,payload,id=null){
  setStatus("Saving…");
  const existing=id?await get(STORES.evidence,id):null;
  const now=new Date(),record={id:id||crypto.randomUUID(),moduleId,evidenceType,payload,
    evidenceDate:existing?.evidenceDate||dateKey(now),eventAt:existing?.eventAt||now.toISOString(),
    recordedAt:existing?.recordedAt||now.toISOString(),updatedAt:now.toISOString()};
  await put(STORES.evidence,record);setStatus("Saved");return record;
}

function deriveCycle(records){
  const menstrual=records.filter(r=>r.moduleId==="menstrual").sort((a,b)=>a.evidenceDate.localeCompare(b.evidenceDate));
  const byDate=new Map(menstrual.map(r=>[r.evidenceDate,r.payload.status]));
  const bleedingDates=menstrual.filter(r=>r.payload.status==="bleeding").map(r=>r.evidenceDate);
  const starts=bleedingDates.filter((d,i,a)=>i===0||daysBetween(a[i-1],d)>1).map(d=>new Date(d+"T12:00:00"));
  const lengths=starts.slice(1).map((d,i)=>Math.round((d-starts[i])/86400000)).filter(n=>n>=18&&n<=45);
  const avg=lengths.length?Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length):28;
  const last=starts.at(-1)||null;
  const predictedStart=last?addDays(last,avg):null;
  const today=new Date(dateKey(new Date())+"T12:00:00");
  const currentCycleDay=last?Math.floor((today-last)/86400000)+1:null;
  const daysUntilPeriod=predictedStart?Math.round((predictedStart-today)/86400000):null;
  const displayDays=Array.from({length:28},(_,i)=>{
    const d=addDays(today,i-13),key=dateKey(d);
    const est=predictedStart&&Math.abs(daysBetween(key,dateKey(predictedStart)))<=2;
    return {date:key,day:d.getDate(),status:byDate.get(key),estimated:est,today:key===dateKey(today)};
  });
  const bleedSpan=Math.max(1,Math.min(7,bleedingDates.filter(d=>last&&daysBetween(dateKey(last),d)>=0&&daysBetween(dateKey(last),d)<=7).length));
  return {periodStarts:starts,predictedStart,currentCycleDay,daysUntilPeriod,averageLength:avg,confidence:lengths.length>=3?"high":lengths.length>=1?"medium":"low",
    displayDays,ringBleed:(bleedSpan/avg)*490,ringEstimate:(5/avg)*490,ringEstimateOffset:((avg-3)/avg)*490};
}
function shouldShowPeriodCheck(cycle,todayRecords){
  if(todayRecords.some(r=>r.moduleId==="menstrual"))return false;
  if(!cycle.predictedStart)return true;
  const lead=state.settings.periodLeadDays||3;
  return cycle.daysUntilPeriod<=lead;
}

function getScheduledSupplements(date){return state.supplements.filter(s=>s.active!==false&&(s.days||[]).includes(date.getDay())).sort((a,b)=>(a.time||"").localeCompare(b.time||""))}
function supplementStatus(todayRecords,scheduled){
  const ids=new Set(todayRecords.filter(r=>r.moduleId==="supplements"&&r.payload.status==="taken").map(r=>r.payload.supplementId));
  if(!ids.size)return"available";if(scheduled.every(s=>ids.has(s.id)))return"taken";return"partial";
}
function hasModule(records,moduleId){return records.some(r=>r.moduleId===moduleId)}
function recordSummary(records,moduleId){const r=[...records].reverse().find(x=>x.moduleId===moduleId);return r?summaryForRecord(r):""}
function summaryForRecord(r){
  const p=r.payload||{};
  if(r.moduleId==="mood")return p.label||`Mood ${p.value}/5`;
  if(r.moduleId==="energy")return `Physical ${p.physical}/5 · Mental ${p.mental}/5`;
  if(r.moduleId==="symptoms")return `Severity ${p.severity}/10${p.notes?` · ${p.notes}`:""}`;
  if(r.moduleId==="menstrual")return p.status==="bleeding"?`${title(p.flow||"")} bleeding`:title(p.status);
  if(r.moduleId==="supplements")return `${p.name} · ${title(p.status)}`;
  return"Recorded";
}
function historyTitle(r){return r.moduleId==="symptoms"?(r.payload.name||"Symptom"):title(r.moduleId)}
function scheduleSummary(s){return `${(s.days||[]).map(i=>DAYS[i]).join(", ")} at ${s.time}`}
function friendlyRelative(date){const n=Math.round((date-new Date(dateKey(new Date())+"T12:00:00"))/86400000);if(n===0)return"today";if(n===1)return"tomorrow";if(n>1)return`in ${n} days`;return`${Math.abs(n)} days late`}
function title(s){return String(s||"").replace(/[-_]/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
function longDate(d){return d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}
function dateKey(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function daysBetween(a,b){return Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/86400000)}
function timeFromIso(v){return v?new Date(v).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}):""}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function toast(message){el.toast.textContent=message;el.toast.classList.add("show");setTimeout(()=>el.toast.classList.remove("show"),1600)}
function setStatus(v){el.status.textContent=v}

function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=e=>{const db=e.target.result;for(const name of Object.values(STORES)){if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:name==="settings"?"key":"id"})}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function store(name,mode="readonly"){return state.db.transaction(name,mode).objectStore(name)}
function reqPromise(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function getAll(name){return reqPromise(store(name).getAll())}
function get(name,key){return reqPromise(store(name).get(key))}
function put(name,value){return reqPromise(store(name,"readwrite").put(value))}
function remove(name,key){return reqPromise(store(name,"readwrite").delete(key))}
async function getSetting(key){const r=await get(STORES.settings,key);return r?.value}
})();
