import { jsPDF } from "jspdf";

// ── Colors ────────────────────────────────────────────────────────────────────
const BLUE = [37, 99, 235];
const DARK = [15, 23, 42];
const GRAY = [100, 116, 139];
const LGRAY = [226, 232, 240];
const WHITE = [255, 255, 255];
const GREEN = [22, 163, 74];
const AMBER = [245, 158, 11];
const RED = [239, 68, 68];

const statusColor = (s) => {
  const map = { "Completado":"#16a34a","Cerrado":"#16a34a","Resuelto":"#16a34a","En progreso":"#2563eb","En Progreso":"#2563eb","Abierto":"#f59e0b","Pendiente":"#f59e0b","Bloqueado":"#ef4444","Alta":"#ef4444","Media":"#f59e0b","Baja":"#22a861" };
  return map[s] || "#64748b";
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

// ── Single client report data builder ────────────────────────────────────────
export async function generateClientPDF({ client, consultants, checklist, tasks, resources, serviceRequests, lang = "es" }) {
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W = 210, M = 18, CW = W - M*2;
  let y = 0;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkPage = (needed=20) => { if (y + needed > 270) addPage(); };

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
  doc.text(new Date().toLocaleDateString(lang==="es"?"es-MX":"en-US",{ year:"numeric",month:"long",day:"numeric" }), W-M, 30, { align:"right" });

  y = 46;

  // ── Consultants ──────────────────────────────────────────────────────────
  if (consultants?.length) {
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
    const label = lang==="en" ? "Assigned Consultants:" : "Consultores Asignados:";
    doc.text(label, M, y);
    consultants.forEach((c, i) => {
      const roleLabel = c.role==="primary"?"Primary":c.role==="specialist"?"Specialist":"Backup";
      doc.setTextColor(...DARK); doc.setFont("helvetica","bold");
      doc.text(`${c.profiles?.name || c.name}`, M + doc.getTextWidth(label) + 3 + (i>0?50*i:0), y);
      doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
      if (c.area) doc.text(`(${c.area})`, M + doc.getTextWidth(label) + 3 + doc.getTextWidth(c.profiles?.name || c.name) + 2 + (i>0?50*i:0), y);
    });
    y += 8;
  }

  // ── Summary boxes ────────────────────────────────────────────────────────
  const doneCL = checklist.filter(i=>i.done).length;
  const pctCL = checklist.length ? Math.round(doneCL/checklist.length*100) : 0;
  const doneT = tasks.filter(t=>t.status==="Completado").length;
  const openSR = serviceRequests.filter(s=>s.status==="Abierto"||s.status==="En progreso").length;

  const boxes = [
    { label: lang==="en"?"Checklist":"Checklist", val:`${doneCL}/${checklist.length}`, sub:`${pctCL}%`, color:BLUE },
    { label: lang==="en"?"Tasks":"Tareas", val:`${doneT}/${tasks.length}`, sub: lang==="en"?"done":"completadas", color:GREEN },
    { label: lang==="en"?"Resources":"Recursos", val:String(resources.length), sub:"links", color:[124,58,237] },
    { label:"SRs ServiceNow", val:String(serviceRequests.length), sub:`${openSR} ${lang==="en"?"open":"abiertos"}`, color:openSR>0?AMBER:GREEN },
  ];

  const bw = CW/4 - 3;
  boxes.forEach((b,i) => {
    const bx = M + i*(bw+4);
    doc.setFillColor(245,248,255); doc.roundedRect(bx, y, bw, 18, 2, 2, "F");
    doc.setDrawColor(...LGRAY); doc.roundedRect(bx, y, bw, 18, 2, 2, "S");
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
    doc.text(b.label, bx+bw/2, y+5, { align:"center" });
    doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.setTextColor(...b.color);
    doc.text(b.val, bx+bw/2, y+12, { align:"center" });
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
    doc.text(b.sub, bx+bw/2, y+17, { align:"center" });
  });
  y += 24;

  // ── Section header helper ─────────────────────────────────────────────────
  const sectionHeader = (title) => {
    checkPage(12);
    doc.setFillColor(...BLUE);
    doc.rect(M, y, CW, 7, "F");
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE);
    doc.text(title, M+3, y+5);
    y += 10;
  };

  // ── CHECKLIST ─────────────────────────────────────────────────────────────
  sectionHeader(lang==="en" ? "CHECKLIST BY PHASE" : "CHECKLIST POR FASE");
  const phases = [...new Set(checklist.map(i=>i.phase))];
  phases.forEach(phase => {
    const items = checklist.filter(i=>i.phase===phase);
    const done = items.filter(i=>i.done).length;
    const pct = items.length ? Math.round(done/items.length*100) : 0;
    checkPage(14);

    // Phase row
    doc.setFillColor(240,244,248); doc.rect(M, y, CW, 7, "F");
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
    doc.text(phase, M+3, y+5);
    doc.setTextColor(...BLUE);
    doc.text(`${done}/${items.length} — ${pct}%`, W-M-3, y+5, { align:"right" });

    // Progress bar
    const barW = 40;
    doc.setFillColor(...LGRAY); doc.rect(W-M-3-barW, y+2, barW, 3, "F");
    doc.setFillColor(...BLUE); doc.rect(W-M-3-barW, y+2, barW*(pct/100), 3, "F");
    y += 9;

    items.forEach(item => {
      checkPage(6);
      const label = lang==="en" ? (item.item_en||item.item_es) : item.item_es;
      doc.setFontSize(7.5); doc.setFont("helvetica","normal");
      // Checkbox
      if (item.done) {
        doc.setFillColor(...GREEN); doc.rect(M+3, y-3.5, 4, 4, "F");
        doc.setTextColor(...WHITE); doc.setFontSize(6); doc.text("✓", M+3.8, y-0.5);
      } else {
        doc.setDrawColor(...LGRAY); doc.rect(M+3, y-3.5, 4, 4, "S");
      }
      doc.setFontSize(7.5); doc.setTextColor(item.done ? GRAY[0] : DARK[0], item.done ? GRAY[1] : DARK[1], item.done ? GRAY[2] : DARK[2]);
      const lines = doc.splitTextToSize(label, CW-12);
      doc.text(lines, M+9, y);
      y += lines.length * 4.5 + 0.5;
    });
    y += 2;
  });

  // ── TASKS ─────────────────────────────────────────────────────────────────
  checkPage(20);
  sectionHeader(lang==="en" ? "TASKS" : "TAREAS");
  if (tasks.length === 0) {
    doc.setFontSize(8); doc.setTextColor(...GRAY); doc.text(lang==="en"?"No tasks registered.":"Sin tareas registradas.", M+3, y); y += 8;
  } else {
    // Header row
    doc.setFillColor(248,250,252); doc.rect(M, y, CW, 6, "F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GRAY);
    doc.text(lang==="en"?"Task":"Tarea", M+3, y+4);
    doc.text(lang==="en"?"Priority":"Prioridad", M+90, y+4);
    doc.text(lang==="en"?"Status":"Estado", M+115, y+4);
    doc.text(lang==="en"?"Due":"Fecha", M+145, y+4);
    doc.text(lang==="en"?"Owner":"Responsable", M+165, y+4);
    y += 7;

    tasks.forEach((task, idx) => {
      checkPage(7);
      const title = lang==="en" ? (task.title_en||task.title_es) : task.title_es;
      if (idx%2===0) { doc.setFillColor(248,250,252); doc.rect(M, y-4, CW, 6.5, "F"); }
      doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
      doc.text(doc.splitTextToSize(title, 85)[0], M+3, y);
      // Status badge color
      const sc = hexToRgb(statusColor(task.status));
      doc.setTextColor(...sc); doc.setFont("helvetica","bold");
      doc.text(task.priority||"", M+90, y);
      doc.text(task.status||"", M+115, y);
      doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
      doc.text(task.due||"—", M+145, y);
      doc.text(task.owner||"—", M+165, y);
      y += 6.5;
    });
    y += 3;
  }

  // ── SERVICE REQUESTS ──────────────────────────────────────────────────────
  checkPage(20);
  sectionHeader("SERVICE REQUESTS — ServiceNow");
  if (serviceRequests.length === 0) {
    doc.setFontSize(8); doc.setTextColor(...GRAY); doc.text(lang==="en"?"No SRs registered.":"Sin SRs registrados.", M+3, y); y += 8;
  } else {
    doc.setFillColor(248,250,252); doc.rect(M, y, CW, 6, "F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GRAY);
    doc.text("SR #", M+3, y+4);
    doc.text(lang==="en"?"Title":"Título", M+30, y+4);
    doc.text(lang==="en"?"Priority":"Prioridad", M+130, y+4);
    doc.text(lang==="en"?"Status":"Estado", M+155, y+4);
    y += 7;

    serviceRequests.forEach((sr, idx) => {
      checkPage(7);
      if (idx%2===0) { doc.setFillColor(248,250,252); doc.rect(M, y-4, CW, 6.5, "F"); }
      doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(...BLUE);
      doc.text(sr.sr_number||"", M+3, y);
      doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
      doc.text(doc.splitTextToSize(sr.title||"", 95)[0], M+30, y);
      const pc = hexToRgb(statusColor(sr.priority));
      const sc = hexToRgb(statusColor(sr.status));
      doc.setFont("helvetica","bold"); doc.setTextColor(...pc);
      doc.text(sr.priority||"", M+130, y);
      doc.setTextColor(...sc);
      doc.text(sr.status||"", M+155, y);
      y += 6.5;
    });
    y += 3;
  }

  // ── RESOURCES ─────────────────────────────────────────────────────────────
  if (resources.length > 0) {
    checkPage(20);
    sectionHeader(lang==="en" ? "RESOURCES" : "RECURSOS");
    resources.forEach((r, idx) => {
      checkPage(7);
      if (idx%2===0) { doc.setFillColor(248,250,252); doc.rect(M, y-4, CW, 6.5, "F"); }
      doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
      doc.text(r.title||"", M+3, y);
      doc.setFont("helvetica","normal"); doc.setTextColor(...BLUE);
      const urlDisplay = (r.url||"").length > 60 ? r.url.slice(0,60)+"…" : r.url;
      doc.text(urlDisplay, M+3, y+4.5);
      if (r.category) { doc.setTextColor(...GRAY); doc.text(r.category, W-M-3, y, { align:"right" }); }
      y += 9;
    });
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...LGRAY); doc.rect(0, 285, W, 12, "F");
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
    doc.text("Joule × Ariba — Activation Dashboard", M, 291);
    doc.text(`${i} / ${pageCount}`, W-M, 291, { align:"right" });
    doc.text(client.name, W/2, 291, { align:"center" });
  }

  return doc;
}

// ── Consolidated report for multiple clients ──────────────────────────────────
export async function generateConsolidatedPDF({ clients, lang = "es" }) {
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W = 210, M = 18, CW = W - M*2;
  let y = 0;

  // ── Cover page ──────────────────────────────────────────────────────────
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 50, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(22); doc.setFont("helvetica","bold");
  doc.text("Joule × Ariba", M, 22);
  doc.setFontSize(12); doc.setFont("helvetica","normal");
  doc.text(lang==="en"?"Consolidated Activation Report":"Reporte Consolidado de Activación", M, 32);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString(lang==="es"?"es-MX":"en-US",{ year:"numeric",month:"long",day:"numeric" }), M, 42);
  doc.setFontSize(10); doc.setFont("helvetica","bold");
  doc.text(`${clients.length} ${lang==="en"?"clients":"clientes"}`, W-M, 42, { align:"right" });

  y = 60;

  // ── Summary table ────────────────────────────────────────────────────────
  doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
  doc.text(lang==="en"?"Client Summary":"Resumen de Clientes", M, y); y += 7;

  // Table header
  doc.setFillColor(...BLUE); doc.rect(M, y, CW, 7, "F");
  doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE);
  doc.text(lang==="en"?"Client":"Cliente", M+3, y+5);
  doc.text(lang==="en"?"Consultant":"Consultor", M+55, y+5);
  doc.text("Checklist", M+105, y+5);
  doc.text(lang==="en"?"Tasks":"Tareas", M+130, y+5);
  doc.text("SRs", M+152, y+5);
  doc.text(lang==="en"?"Status":"Estado", M+165, y+5);
  y += 8;

  clients.forEach((c, idx) => {
    if (y > 265) { doc.addPage(); y = 20; }
    const pctCL = c.checklist?.length ? Math.round(c.checklist.filter(i=>i.done).length/c.checklist.length*100) : 0;
    const doneT = c.tasks?.filter(t=>t.status==="Completado").length || 0;
    const openSR = c.serviceRequests?.filter(s=>s.status==="Abierto"||s.status==="En progreso").length || 0;
    const overallStatus = pctCL===100 ? (lang==="en"?"Complete":"Completo") : pctCL>=50 ? (lang==="en"?"In Progress":"En Progreso") : (lang==="en"?"Starting":"Iniciando");
    const statusCol = pctCL===100 ? GREEN : pctCL>=50 ? BLUE : AMBER;

    if (idx%2===0) { doc.setFillColor(248,250,252); doc.rect(M, y-4, CW, 7, "F"); }
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
    doc.text(c.client.name, M+3, y);
    doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
    const primaryConsultant = c.consultants?.find(a=>a.role==="primary");
    doc.text(primaryConsultant?.profiles?.name || "—", M+55, y);
    // Checklist progress bar
    const barW = 20;
    doc.setFillColor(...LGRAY); doc.rect(M+105, y-3, barW, 2.5, "F");
    doc.setFillColor(...BLUE); doc.rect(M+105, y-3, barW*(pctCL/100), 2.5, "F");
    doc.setTextColor(...BLUE); doc.setFontSize(7);
    doc.text(`${pctCL}%`, M+127, y);
    doc.setTextColor(...DARK); doc.setFontSize(8);
    doc.text(`${doneT}/${c.tasks?.length||0}`, M+130, y);
    doc.setTextColor(openSR>0 ? AMBER[0] : GREEN[0], openSR>0 ? AMBER[1] : GREEN[1], openSR>0 ? AMBER[2] : GREEN[2]);
    doc.text(`${c.serviceRequests?.length||0}`, M+152, y);
    doc.setFont("helvetica","bold"); doc.setTextColor(...statusCol);
    doc.text(overallStatus, M+165, y);
    y += 7;
  });

  // ── Detail pages per client ───────────────────────────────────────────────
  for (const c of clients) {
    doc.addPage();
    const clientDoc = await generateClientPDF({
      client: c.client,
      consultants: c.consultants || [],
      checklist: c.checklist || [],
      tasks: c.tasks || [],
      resources: c.resources || [],
      serviceRequests: c.serviceRequests || [],
      lang,
    });
    // Copy pages from clientDoc into main doc
    const clientPages = clientDoc.internal.getNumberOfPages();
    for (let p = 1; p <= clientPages; p++) {
      if (p > 1) doc.addPage();
      const pageContent = clientDoc.internal.pages[p];
      if (pageContent) {
        // Transfer internal page data
        doc.internal.pages[doc.internal.getNumberOfPages()] = pageContent;
      }
    }
  }

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...LGRAY); doc.rect(0, 285, W, 12, "F");
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(...GRAY);
    doc.text("Joule × Ariba — Consolidated Report", M, 291);
    doc.text(`${i} / ${pageCount}`, W-M, 291, { align:"right" });
  }

  return doc;
}
