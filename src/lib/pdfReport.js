import { jsPDF } from "jspdf";

// ── Colors ─────────────────────────────────────────────────────────────────
const BLUE  = [37, 99, 235];
const DARK  = [15, 23, 42];
const GRAY  = [100, 116, 139];
const LGRAY = [226, 232, 240];
const WHITE = [255, 255, 255];
const GREEN = [22, 163, 74];
const AMBER = [245, 158, 11];

const STATUS_MAP = {
  "Completado":"#16a34a","Cerrado":"#16a34a","Resuelto":"#16a34a",
  "En progreso":"#2563eb","En Progreso":"#2563eb",
  "Abierto":"#f59e0b","Pendiente":"#f59e0b",
  "Bloqueado":"#ef4444","Alta":"#ef4444","Media":"#f59e0b","Baja":"#22a861",
};
const statusColor = (s) => STATUS_MAP[s] || "#64748b";

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

// ── Single client PDF (self-contained) ─────────────────────────────────────
export async function generateClientPDF({ client, consultants, checklist, tasks, resources, serviceRequests, lang = "es" }) {
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W = 210, M = 14, CW = W - M * 2;
  let y = 0;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkPage = (needed = 20) => { if (y + needed > 272) addPage(); };

  // ── Header band ──────────────────────────────────────────────────────────
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 38, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(18); doc.setFont("helvetica","bold");
  doc.text("Joule × Ariba", M, 14);
  doc.setFontSize(9); doc.setFont("helvetica","normal");
  doc.text(lang==="en" ? "Activation / Configuration Dashboard" : "Dashboard de Activación / Configuración", M, 20);
  doc.setFontSize(14); doc.setFont("helvetica","bold");
  doc.text(client.name, M, 30);
  doc.setFontSize(8); doc.setFont("helvetica","normal");
  doc.text(new Date().toLocaleDateString(lang==="es"?"es-MX":"en-US",{year:"numeric",month:"long",day:"numeric"}), W-M, 30, {align:"right"});
  y = 46;

  // ── Consultants ──────────────────────────────────────────────────────────
  if (consultants?.length) {
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
    doc.text(lang==="en" ? "Assigned Consultants:" : "Consultores Asignados:", M, y);
    y += 5;
    consultants.forEach(c => {
      const name = c.profiles?.name || c.name || "—";
      const role = c.role==="primary" ? (lang==="en"?"Primary":"Primario") : c.role==="specialist" ? "Specialist" : "Backup";
      const area = c.area ? ` — ${c.area}` : "";
      doc.setTextColor(...DARK); doc.setFont("helvetica","bold");
      doc.text(name, M+4, y);
      doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
      doc.text(`${role}${area}`, M+4+doc.getTextWidth(name)+2, y);
      y += 5;
    });
    y += 2;
  }

  // ── Summary boxes ────────────────────────────────────────────────────────
  const doneCL = checklist.filter(i=>i.done).length;
  const pctCL  = checklist.length ? Math.round(doneCL/checklist.length*100) : 0;
  const doneT  = tasks.filter(t=>t.status==="Completado").length;
  const openSR = serviceRequests.filter(s=>s.status==="Abierto"||s.status==="En progreso").length;

  const boxes = [
    { label:"Checklist",                        val:`${doneCL}/${checklist.length}`, sub:`${pctCL}%`,                                  color:BLUE },
    { label:lang==="en"?"Tasks":"Tareas",       val:`${doneT}/${tasks.length}`,      sub:lang==="en"?"done":"completadas",             color:GREEN },
    { label:lang==="en"?"Resources":"Recursos", val:String(resources.length),        sub:"links",                                      color:[124,58,237] },
    { label:"SRs ServiceNow",                   val:String(serviceRequests.length),  sub:`${openSR} ${lang==="en"?"open":"abiertos"}`, color:openSR>0?AMBER:GREEN },
  ];
  const bw = (CW-9)/4;
  boxes.forEach((b,i) => {
    const bx = M + i*(bw+3);
    doc.setFillColor(245,248,255); doc.roundedRect(bx, y, bw, 18, 2, 2, "F");
    doc.setDrawColor(...LGRAY);    doc.roundedRect(bx, y, bw, 18, 2, 2, "S");
    doc.setFontSize(7);  doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);    doc.text(b.label, bx+bw/2, y+5,  {align:"center"});
    doc.setFontSize(13); doc.setFont("helvetica","bold");   doc.setTextColor(...b.color); doc.text(b.val,   bx+bw/2, y+12, {align:"center"});
    doc.setFontSize(7);  doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);    doc.text(b.sub,   bx+bw/2, y+17, {align:"center"});
  });
  y += 24;

  // ── Section header ───────────────────────────────────────────────────────
  const sectionHeader = (title) => {
    checkPage(14);
    doc.setFillColor(...BLUE); doc.rect(M, y, CW, 7, "F");
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE);
    doc.text(title, M+3, y+5);
    y += 10;
  };

  // ── CHECKLIST ────────────────────────────────────────────────────────────
  sectionHeader(lang==="en" ? "CHECKLIST BY PHASE" : "CHECKLIST POR FASE");
  const phases = [...new Set(checklist.map(i=>i.phase))];
  phases.forEach(phase => {
    const items = checklist.filter(i=>i.phase===phase);
    const done  = items.filter(i=>i.done).length;
    const pct   = items.length ? Math.round(done/items.length*100) : 0;
    checkPage(14);

    doc.setFillColor(240,244,248); doc.rect(M, y, CW, 7, "F");
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
    doc.text(phase, M+3, y+5);
    const barW = 35, barX = W-M-3-barW-20;
    doc.setFillColor(...LGRAY); doc.rect(barX, y+2, barW, 3, "F");
    doc.setFillColor(...BLUE);  doc.rect(barX, y+2, barW*(pct/100), 3, "F");
    doc.setTextColor(...BLUE); doc.setFontSize(7);
    doc.text(`${done}/${items.length} — ${pct}%`, W-M-3, y+5, {align:"right"});
    y += 9;

    items.forEach(item => {
      const label = lang==="en" ? (item.item_en||item.item_es) : item.item_es;
      const lines = doc.splitTextToSize(label, CW-14);
      const rowH  = lines.length*5+2;
      checkPage(rowH+2);

      doc.setFillColor(...(item.done ? GREEN : WHITE)); doc.setDrawColor(...(item.done ? GREEN : LGRAY));
      doc.rect(M+3, y, 4, 4, item.done ? "FD" : "S");
      if (item.done) {
        doc.setDrawColor(...WHITE); doc.setLineWidth(0.6);
        doc.line(M+3.7, y+2.2, M+5.0, y+3.4);
        doc.line(M+5.0, y+3.4, M+6.5, y+1.2);
        doc.setLineWidth(0.2);
      }
      doc.setFontSize(7.5); doc.setFont("helvetica","normal");
      doc.setTextColor(...(item.done ? GRAY : DARK));
      doc.text(lines, M+10, y+3.5);
      y += rowH;
    });
    y += 4;
  });

  // ── TASKS ────────────────────────────────────────────────────────────────
  checkPage(20);
  sectionHeader(lang==="en" ? "TASKS" : "TAREAS");
  const COL = { task:M+3, priority:M+90, status:M+114, due:M+142, owner:M+162 };

  if (tasks.length===0) {
    doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text(lang==="en"?"No tasks registered.":"Sin tareas registradas.", M+3, y+5); y+=10;
  } else {
    doc.setFillColor(248,250,252); doc.rect(M, y, CW, 6, "F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GRAY);
    doc.text(lang==="en"?"Task":"Tarea",          COL.task,     y+4);
    doc.text(lang==="en"?"Priority":"Prioridad",  COL.priority, y+4);
    doc.text(lang==="en"?"Status":"Estado",       COL.status,   y+4);
    doc.text(lang==="en"?"Due":"Fecha",           COL.due,      y+4);
    doc.text(lang==="en"?"Owner":"Responsable",   COL.owner,    y+4);
    y += 7;

    tasks.forEach((task, idx) => {
      checkPage(7);
      const title = lang==="en" ? (task.title_en||task.title_es||task.title||"") : (task.title_es||task.title||"");
      if (idx%2===0) { doc.setFillColor(248,250,252); doc.rect(M, y, CW, 6.5, "F"); }
      doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
      doc.text(doc.splitTextToSize(title,84)[0], COL.task, y+4.5);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...hexToRgb(statusColor(task.priority)));
      doc.text(task.priority||"", COL.priority, y+4.5);
      doc.setTextColor(...hexToRgb(statusColor(task.status)));
      doc.text(task.status||"", COL.status, y+4.5);
      doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
      doc.text(task.due||"—", COL.due, y+4.5);
      doc.text(doc.splitTextToSize(task.owner||"—",28)[0], COL.owner, y+4.5);
      y += 6.5;
    });
    y += 3;
  }

  // ── SERVICE REQUESTS ─────────────────────────────────────────────────────
  checkPage(20);
  sectionHeader("SERVICE REQUESTS — ServiceNow");
  const SR = { num:M+3, title:M+32, priority:M+128, status:M+155 };

  if (serviceRequests.length===0) {
    doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text(lang==="en"?"No SRs registered.":"Sin SRs registrados.", M+3, y+5); y+=10;
  } else {
    doc.setFillColor(248,250,252); doc.rect(M, y, CW, 6, "F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GRAY);
    doc.text("SR #",                             SR.num,      y+4);
    doc.text(lang==="en"?"Title":"Título",       SR.title,    y+4);
    doc.text(lang==="en"?"Priority":"Prioridad", SR.priority, y+4);
    doc.text(lang==="en"?"Status":"Estado",      SR.status,   y+4);
    y += 7;

    serviceRequests.forEach((sr, idx) => {
      checkPage(7);
      if (idx%2===0) { doc.setFillColor(248,250,252); doc.rect(M, y, CW, 6.5, "F"); }
      doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(...BLUE);
      doc.text(sr.sr_number||"", SR.num, y+4.5);
      doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
      doc.text(doc.splitTextToSize(sr.title||"",93)[0], SR.title, y+4.5);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...hexToRgb(statusColor(sr.priority)));
      doc.text(sr.priority||"", SR.priority, y+4.5);
      doc.setTextColor(...hexToRgb(statusColor(sr.status)));
      doc.text(sr.status||"", SR.status, y+4.5);
      y += 6.5;
    });
    y += 3;
  }

  // ── RESOURCES ────────────────────────────────────────────────────────────
  if (resources.length>0) {
    checkPage(20 + 12);
    sectionHeader(lang==="en" ? "RESOURCES" : "RECURSOS");
    resources.forEach((r, idx) => {
      checkPage(12);
      if (idx%2===0) { doc.setFillColor(248,250,252); doc.rect(M, y, CW, 11, "F"); }
      doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
      doc.text(doc.splitTextToSize(r.title||"",CW-3)[0], M+3, y+4);
      doc.setFont("helvetica","normal"); doc.setTextColor(...BLUE);
      const urlDisplay = (r.url||"").length>70 ? r.url.slice(0,70)+"…" : (r.url||"");
      doc.text(urlDisplay, M+3, y+8.5);
      if (r.category) { doc.setTextColor(...GRAY); doc.text(r.category, W-M-3, y+4, {align:"right"}); }
      y += 11;
    });
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i=1; i<=pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...LGRAY); doc.rect(0, 285, W, 12, "F");
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
    doc.text("Joule × Ariba — Activation Dashboard", M, 291);
    doc.text(`${i} / ${pageCount}`, W-M, 291, {align:"right"});
    doc.text(client.name, W/2, 291, {align:"center"});
  }

  return doc;
}

// ── Consolidated report using pdf-lib for true PDF merge ───────────────────
export async function generateConsolidatedPDF({ clients, lang = "es" }) {
  const W = 210, M = 14, CW = W - M * 2;

  // 1. Build the cover/summary page with jsPDF
  const coverDoc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  let y = 0;

  // Cover band
  coverDoc.setFillColor(...BLUE); coverDoc.rect(0, 0, W, 50, "F");
  coverDoc.setTextColor(...WHITE);
  coverDoc.setFontSize(22); coverDoc.setFont("helvetica","bold");
  coverDoc.text("Joule × Ariba", M, 22);
  coverDoc.setFontSize(12); coverDoc.setFont("helvetica","normal");
  coverDoc.text(lang==="en"?"Consolidated Activation Report":"Reporte Consolidado de Activación", M, 32);
  coverDoc.setFontSize(9);
  coverDoc.text(new Date().toLocaleDateString(lang==="es"?"es-MX":"en-US",{year:"numeric",month:"long",day:"numeric"}), M, 42);
  coverDoc.setFontSize(10); coverDoc.setFont("helvetica","bold");
  coverDoc.text(`${clients.length} ${lang==="en"?"clients":"clientes"}`, W-M, 42, {align:"right"});
  y = 60;

  // Summary table title
  coverDoc.setFontSize(11); coverDoc.setFont("helvetica","bold"); coverDoc.setTextColor(...DARK);
  coverDoc.text(lang==="en"?"Client Summary":"Resumen de Clientes", M, y); y += 7;

  // Table header
  const SC = { client:M+3, consultant:M+55, checklist:M+105, tasks:M+132, srs:M+153, status:M+168 };
  coverDoc.setFillColor(...BLUE); coverDoc.rect(M, y, CW, 7, "F");
  coverDoc.setFontSize(7.5); coverDoc.setFont("helvetica","bold"); coverDoc.setTextColor(...WHITE);
  coverDoc.text(lang==="en"?"Client":"Cliente",       SC.client,     y+5);
  coverDoc.text(lang==="en"?"Consultant":"Consultor", SC.consultant, y+5);
  coverDoc.text("Checklist",                          SC.checklist,  y+5);
  coverDoc.text(lang==="en"?"Tasks":"Tareas",         SC.tasks,      y+5);
  coverDoc.text("SRs",                                SC.srs,        y+5);
  coverDoc.text(lang==="en"?"Status":"Estado",        SC.status,     y+5);
  y += 8;

  clients.forEach((c, idx) => {
    if (y > 265) { coverDoc.addPage(); y = 20; }
    const pctCL  = c.checklist?.length ? Math.round(c.checklist.filter(i=>i.done).length/c.checklist.length*100) : 0;
    const doneT  = c.tasks?.filter(t=>t.status==="Completado").length || 0;
    const openSR = c.serviceRequests?.filter(s=>s.status==="Abierto"||s.status==="En progreso").length || 0;
    const overallStatus = pctCL===100
      ? (lang==="en"?"Complete":"Completo")
      : pctCL>=50 ? (lang==="en"?"In Progress":"En Progreso")
      : (lang==="en"?"Starting":"Iniciando");
    const statusCol = pctCL===100 ? GREEN : pctCL>=50 ? BLUE : AMBER;

    if (idx%2===0) { coverDoc.setFillColor(248,250,252); coverDoc.rect(M, y, CW, 7, "F"); }
    coverDoc.setFontSize(8); coverDoc.setFont("helvetica","bold"); coverDoc.setTextColor(...DARK);
    coverDoc.text(coverDoc.splitTextToSize(c.client.name,48)[0], SC.client, y+5);
    coverDoc.setFont("helvetica","normal"); coverDoc.setTextColor(...GRAY);
    const primary = c.consultants?.find(a=>a.role==="primary");
    coverDoc.text(coverDoc.splitTextToSize(primary?.profiles?.name||"—",46)[0], SC.consultant, y+5);
    const barW = 18;
    coverDoc.setFillColor(...LGRAY); coverDoc.rect(SC.checklist, y+2, barW, 2.5, "F");
    coverDoc.setFillColor(...BLUE);  coverDoc.rect(SC.checklist, y+2, barW*(pctCL/100), 2.5, "F");
    coverDoc.setTextColor(...BLUE); coverDoc.setFontSize(7);
    coverDoc.text(`${pctCL}%`, SC.checklist+barW+2, y+5);
    coverDoc.setTextColor(...DARK); coverDoc.setFontSize(8);
    coverDoc.text(`${doneT}/${c.tasks?.length||0}`, SC.tasks, y+5);
    coverDoc.setTextColor(...(openSR>0 ? AMBER : GREEN));
    coverDoc.text(String(c.serviceRequests?.length||0), SC.srs, y+5);
    coverDoc.setFont("helvetica","bold"); coverDoc.setTextColor(...statusCol);
    coverDoc.text(overallStatus, SC.status, y+5);
    y += 7;
  });

  // Footer on cover pages
  const coverPageCount = coverDoc.internal.getNumberOfPages();
  for (let i=1; i<=coverPageCount; i++) {
    coverDoc.setPage(i);
    coverDoc.setFillColor(...LGRAY); coverDoc.rect(0, 285, W, 12, "F");
    coverDoc.setFontSize(7); coverDoc.setFont("helvetica","normal"); coverDoc.setTextColor(...GRAY);
    coverDoc.text("Joule × Ariba — Consolidated Report", M, 291);
    coverDoc.text(`${i} / ${coverPageCount}`, W-M, 291, {align:"right"});
  }

  return coverDoc;
}
