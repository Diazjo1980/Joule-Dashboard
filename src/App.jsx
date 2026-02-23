import { useState, useEffect, useCallback } from "react";
import t from "./i18n";
import {
  DEFAULT_CHECKLIST, DEFAULT_TASKS, DEFAULT_DOCS,
  PHASE_COLORS, PRIORITY_COLORS, STATUS_COLORS
} from "./data";

// ── Client ID from URL (?client=acme) ────────────────────────────────────────
const getClientId = () => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("client") || "default";
  // sanitize: lowercase alphanumeric + hyphens only
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32) || "default";
};

const CLIENT_ID = getClientId();

// ── localStorage helpers (namespaced per client) ───────────────────────────
const store = {
  get: (key, fallback) => {
    try {
      const v = localStorage.getItem(`joule_${CLIENT_ID}_${key}`);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(`joule_${CLIENT_ID}_${key}`, JSON.stringify(val)); } catch {}
  },
  // Returns all client IDs that have data stored
  listClients: () => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("joule_") && k.includes("_checklist"));
      return keys.map(k => k.replace("joule_", "").replace("_checklist", "")).filter(Boolean);
    } catch { return []; }
  },
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const icons = {
  check: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  circle: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>,
  plus: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/></svg>,
  edit: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11,4H4a2,2,0,0,0-2,2v14a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V13"/><path d="M18.5,2.5a2.121,2.121,0,0,1,3,3L12,15l-4,1,1-4Z"/></svg>,
  link: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10,13a5,5,0,0,0,7.54.54l3-3a5,5,0,0,0-7.07-7.07l-1.72,1.71"/><path d="M14,11a5,5,0,0,0-7.54-.54l-3,3a5,5,0,0,0,7.07,7.07l1.71-1.71"/></svg>,
  image: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
  close: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  external: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  chevron: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,9 12,15 18,9"/></svg>,
  search: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  globe: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  calendar: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  user: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

// ── Shared UI Primitives ──────────────────────────────────────────────────────
const Badge = ({ label, style: s }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, fontFamily: "'DM Mono', monospace", ...s }}>{label}</span>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "min(540px,96vw)", maxHeight: "88vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 0" }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, color: "#64748b", cursor: "pointer", padding: "6px 8px", lineHeight: 0 }}>
          {icons.close(16)}
        </button>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>{children}</div>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: 5 }}>{label}</label>
    {children}
  </div>
);

const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" };
const sel = { ...inp };

const BtnPrimary = ({ onClick, children }) => (
  <button onClick={onClick} style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)", border: "none", color: "#fff", padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 6 }}>
    {children}
  </button>
);
const BtnGhost = ({ onClick, children }) => (
  <button onClick={onClick} style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#64748b", padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13.5, fontFamily: "'DM Sans', sans-serif" }}>
    {children}
  </button>
);
const BtnAdd = ({ onClick, children }) => (
  <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1.5px dashed #93c5fd", color: "#2563eb", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>
    {icons.plus(14)} {children}
  </button>
);

// ── Overview Pillar Cards ─────────────────────────────────────────────────────
const PILLAR_DEFS = [
  { key: "pillar1", keyS: "pillar1sub", color: "#e8f4fd", border: "#bbd6f0", icon: "🔍" },
  { key: "pillar2", keyS: "pillar2sub", color: "#e8f8f0", border: "#b2dfc9", icon: "📋" },
  { key: "pillar3", keyS: "pillar3sub", color: "#f3eeff", border: "#d0baff", icon: "🧭" },
  { key: "pillar4", keyS: "pillar4sub", color: "#fff4e8", border: "#ffd4a0", icon: "⚙️" },
  { key: "pillar5", keyS: "pillar5sub", color: "#fdf2f8", border: "#f0abda", icon: "🚀" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST SECTION
// ─────────────────────────────────────────────────────────────────────────────
function ChecklistSection({ lang, tr }) {
  const [items, setItems] = useState(() => store.get("checklist", DEFAULT_CHECKLIST));
  const [collapsed, setCollapsed] = useState({});
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ phase: "", item_es: "", item_en: "" });

  const save = (data) => { setItems(data); store.set("checklist", data); };
  const toggle = (id) => save(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const del = (id) => save(items.filter(i => i.id !== id));
  const addItem = () => {
    if (!form.item_es.trim() && !form.item_en.trim()) return;
    save([...items, { id: Date.now(), phase: form.phase || tr.customPhase, phaseKey: "custom", item_es: form.item_es, item_en: form.item_en || form.item_es, done: false }]);
    setModal(false); setForm({ phase: "", item_es: "", item_en: "" });
  };

  const phases = [...new Set(items.map(i => i.phase))];
  const done = items.filter(i => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  const getLabel = (it) => lang === "en" ? (it.item_en || it.item_es) : it.item_es;

  return (
    <div>
      {/* Progress */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>{tr.progress}</span>
          <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#2563eb", fontWeight: 700 }}>{done} {tr.of} {items.length} — {pct}%</span>
        </div>
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#0ea5e9,#2563eb)", borderRadius: 4, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {phases.map((phase, pi) => {
        const phaseItems = items.filter(i => i.phase === phase);
        const phaseDone = phaseItems.filter(i => i.done).length;
        const col = PHASE_COLORS[phase] || { bg: "#f1f5f9", border: "#cbd5e1", icon: "#64748b", dot: "#64748b" };
        const isCollapsed = collapsed[phase];
        return (
          <div key={phase} style={{ marginBottom: 14, border: `1.5px solid ${col.border}`, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            {/* Phase header */}
            <div
              onClick={() => setCollapsed(c => ({ ...c, [phase]: !c[phase] }))}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: col.bg, cursor: "pointer", userSelect: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{phase}</span>
                <span style={{ fontSize: 12, color: col.icon, fontFamily: "'DM Mono', monospace", background: "#fff", padding: "1px 8px", borderRadius: 20, border: `1px solid ${col.border}` }}>
                  {phaseDone}/{phaseItems.length}
                </span>
              </div>
              <span style={{ color: "#94a3b8", transform: isCollapsed ? "rotate(-90deg)" : "none", transition: "0.2s" }}>{icons.chevron(16)}</span>
            </div>

            {/* Items */}
            {!isCollapsed && phaseItems.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderTop: `1px solid ${col.border}44`, background: it.done ? "#f8fff8" : "#fff", transition: "background 0.2s" }}>
                <button
                  onClick={() => toggle(it.id)}
                  style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: `2px solid ${it.done ? col.dot : "#cbd5e1"}`, background: it.done ? col.bg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", color: col.dot }}
                >
                  {it.done && icons.check(12)}
                </button>
                <span style={{ flex: 1, fontSize: 13.5, color: it.done ? "#94a3b8" : "#334155", textDecoration: it.done ? "line-through" : "none", lineHeight: 1.4 }}>
                  {getLabel(it)}
                </span>
                <button onClick={() => del(it.id)} style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", padding: "2px 4px", lineHeight: 0, borderRadius: 4 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={e => e.currentTarget.style.color = "#e2e8f0"}
                >{icons.trash(13)}</button>
              </div>
            ))}
          </div>
        );
      })}

      <BtnAdd onClick={() => setModal(true)}>{tr.addStep}</BtnAdd>

      {modal && (
        <Modal title={tr.addActivationStep} onClose={() => setModal(false)}>
          <Field label={tr.phase}>
            <input style={inp} placeholder={tr.enterPhase} value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })} />
          </Field>
          <Field label={`${tr.stepDescription} (ES)`}>
            <input style={inp} placeholder={tr.enterStep} value={form.item_es} onChange={e => setForm({ ...form, item_es: e.target.value })} />
          </Field>
          <Field label={`${tr.stepDescription} (EN)`}>
            <input style={inp} placeholder={tr.enterStep} value={form.item_en} onChange={e => setForm({ ...form, item_en: e.target.value })} />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <BtnGhost onClick={() => setModal(false)}>{tr.cancel}</BtnGhost>
            <BtnPrimary onClick={addItem}>{tr.save}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASKS SECTION
// ─────────────────────────────────────────────────────────────────────────────
const emptyTask = { title_es: "", title_en: "", priority: "Media", status: "Pendiente", due: "", owner: "" };

function TasksSection({ lang, tr }) {
  const [tasks, setTasks] = useState(() => store.get("tasks", DEFAULT_TASKS));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const save = (data) => { setTasks(data); store.set("tasks", data); };

  const openAdd = () => { setEditing(null); setForm(emptyTask); setModal(true); };
  const openEdit = (t) => { setEditing(t.id); setForm({ ...t }); setModal(true); };

  const saveTask = () => {
    if (!form.title_es.trim() && !form.title_en.trim()) return;
    const updated = editing
      ? tasks.map(t => t.id === editing ? { ...form, id: editing } : t)
      : [...tasks, { ...form, id: Date.now() }];
    save(updated);
    setModal(false);
  };

  const del = (id) => save(tasks.filter(t => t.id !== id));

  const statusKeys = ["all", "Pendiente", "En progreso", "Completado", "Bloqueado"];
  const statusLabel = (s) => {
    if (s === "all") return tr.all;
    const map = { "Pendiente": tr.pending, "En progreso": tr.inProgress, "Completado": tr.done, "Bloqueado": tr.blocked };
    return map[s] || s;
  };

  const getTitle = (t) => lang === "en" ? (t.title_en || t.title_es) : t.title_es;
  const getPriorityLabel = (p) => {
    if (lang === "en") {
      if (p === "Alta") return "High";
      if (p === "Media") return "Medium";
      if (p === "Baja") return "Low";
    }
    return p;
  };
  const getStatusLabel = (s) => {
    if (lang === "en") {
      const map = { "Pendiente": "Pending", "En progreso": "In Progress", "Completado": "Completed", "Bloqueado": "Blocked" };
      return map[s] || s;
    }
    return s;
  };

  const filtered = filterStatus === "all" ? tasks : tasks.filter(t => t.status === filterStatus);
  const doneCount = tasks.filter(t => t.status === "Completado").length;

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {statusKeys.slice(1).map(s => {
          const count = tasks.filter(t => t.status === s).length;
          const col = STATUS_COLORS[s] || {};
          return (
            <div key={s} onClick={() => setFilterStatus(s === filterStatus ? "all" : s)} style={{ background: "#fff", border: `1.5px solid ${filterStatus === s ? col.border : "#e2e8f0"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: col.text || "#334155", fontFamily: "'DM Mono', monospace" }}>{count}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>{statusLabel(s)}</div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {statusKeys.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "5px 14px", borderRadius: 20, border: "1.5px solid", borderColor: filterStatus === s ? "#2563eb" : "#e2e8f0", background: filterStatus === s ? "#eff6ff" : "#fff", color: filterStatus === s ? "#2563eb" : "#64748b", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
            {statusLabel(s)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>{tr.noItems}</div>
        )}
        {filtered.map(task => {
          const pc = PRIORITY_COLORS[task.priority] || {};
          const sc = STATUS_COLORS[task.status] || {};
          return (
            <div key={task.id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14, transition: "box-shadow 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: "#1e293b", marginBottom: 8 }}>{getTitle(task)}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <Badge label={getPriorityLabel(task.priority)} style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }} />
                  <Badge label={getStatusLabel(task.status)} style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }} />
                  {task.due && <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: 12 }}>{icons.calendar(12)} {task.due}</span>}
                  {task.owner && <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: 12 }}>{icons.user(12)} {task.owner}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => openEdit(task)} style={{ background: "#f1f5f9", border: "none", borderRadius: 7, color: "#2563eb", cursor: "pointer", padding: "6px 8px", lineHeight: 0 }}>{icons.edit(14)}</button>
                <button onClick={() => del(task.id)} style={{ background: "#fff0f0", border: "none", borderRadius: 7, color: "#ef4444", cursor: "pointer", padding: "6px 8px", lineHeight: 0 }}>{icons.trash(14)}</button>
              </div>
            </div>
          );
        })}
      </div>

      <BtnAdd onClick={openAdd}>{tr.addTask}</BtnAdd>

      {modal && (
        <Modal title={editing ? tr.editTask : tr.newTask} onClose={() => setModal(false)}>
          <Field label={`${tr.title} (ES)`}>
            <input style={inp} placeholder={tr.taskTitle} value={form.title_es} onChange={e => setForm({ ...form, title_es: e.target.value })} />
          </Field>
          <Field label={`${tr.title} (EN)`}>
            <input style={inp} placeholder={tr.taskTitle} value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={tr.priority}>
              <select style={sel} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {["Alta", "Media", "Baja"].map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label={tr.status}>
              <select style={sel} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Pendiente", "En progreso", "Completado", "Bloqueado"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={tr.dueDate}>
              <input type="date" style={inp} value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} />
            </Field>
            <Field label={tr.owner}>
              <input style={inp} placeholder={tr.enterOwner} value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <BtnGhost onClick={() => setModal(false)}>{tr.cancel}</BtnGhost>
            <BtnPrimary onClick={saveTask}>{tr.save}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCES SECTION
// ─────────────────────────────────────────────────────────────────────────────
const emptyDoc = { title: "", url: "", category: "", type: "url", notes: "" };

function ResourcesSection({ lang, tr }) {
  const [docs, setDocs] = useState(() => store.get("docs", DEFAULT_DOCS));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyDoc);
  const [editing, setEditing] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");

  const save = (data) => { setDocs(data); store.set("docs", data); };

  const openAdd = () => { setEditing(null); setForm(emptyDoc); setModal(true); };
  const openEdit = (d) => { setEditing(d.id); setForm({ ...d }); setModal(true); };
  const del = (id) => save(docs.filter(d => d.id !== id));

  const saveDoc = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    const updated = editing
      ? docs.map(d => d.id === editing ? { ...form, id: editing } : d)
      : [...docs, { ...form, id: Date.now() }];
    save(updated);
    setModal(false);
  };

  const cats = [...new Set(docs.map(d => d.category).filter(Boolean))];
  let filtered = filterCat === "all" ? docs : docs.filter(d => d.category === filterCat);
  if (search.trim()) filtered = filtered.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.url.toLowerCase().includes(search.toLowerCase()) || (d.notes || "").toLowerCase().includes(search.toLowerCase()));

  const grouped = filtered.reduce((acc, d) => {
    const cat = d.category || tr.otherCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {});

  return (
    <div>
      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>{icons.search(15)}</span>
          <input style={{ ...inp, paddingLeft: 34 }} placeholder={tr.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", ...cats].map(c => (
            <button key={c} onClick={() => setFilterCat(c)} style={{ padding: "5px 14px", borderRadius: 20, border: "1.5px solid", borderColor: filterCat === c ? "#2563eb" : "#e2e8f0", background: filterCat === c ? "#eff6ff" : "#fff", color: filterCat === c ? "#2563eb" : "#64748b", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              {c === "all" ? tr.all : c}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
            {cat}
            <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {items.map(d => (
              <div key={d.id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", transition: "all 0.15s", position: "relative" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: d.type === "screenshot" ? "#f3eeff" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: d.type === "screenshot" ? "#7c3aed" : "#2563eb", flexShrink: 0 }}>
                    {d.type === "screenshot" ? icons.image(16) : icons.link(16)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1e293b", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</div>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#2563eb", fontSize: 12, textDecoration: "none", fontFamily: "'DM Mono', monospace" }}>
                      {icons.external(11)} {d.url.length > 38 ? d.url.slice(0, 38) + "…" : d.url}
                    </a>
                    {d.notes && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{d.notes}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, position: "absolute", top: 10, right: 10 }}>
                  <button onClick={() => openEdit(d)} style={{ background: "#f1f5f9", border: "none", borderRadius: 6, color: "#2563eb", cursor: "pointer", padding: "4px 6px", lineHeight: 0 }}>{icons.edit(13)}</button>
                  <button onClick={() => del(d.id)} style={{ background: "#fff0f0", border: "none", borderRadius: 6, color: "#ef4444", cursor: "pointer", padding: "4px 6px", lineHeight: 0 }}>{icons.trash(13)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>{tr.noResults}</div>
      )}

      <BtnAdd onClick={openAdd}>{tr.addResource}</BtnAdd>

      {modal && (
        <Modal title={editing ? tr.editResource : tr.newResource} onClose={() => setModal(false)}>
          <Field label={tr.title}>
            <input style={inp} placeholder={tr.resourceTitle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label={tr.url}>
            <input style={inp} placeholder={tr.enterUrl} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={tr.category}>
              <input style={inp} placeholder={tr.enterCategory} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </Field>
            <Field label={tr.type}>
              <select style={sel} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="url">{tr.urlType}</option>
                <option value="screenshot">{tr.screenshotType}</option>
              </select>
            </Field>
          </div>
          <Field label={tr.notes}>
            <input style={inp} placeholder={tr.optionalNotes} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <BtnGhost onClick={() => setModal(false)}>{tr.cancel}</BtnGhost>
            <BtnPrimary onClick={saveDoc}>{tr.save}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW SECTION
// ─────────────────────────────────────────────────────────────────────────────
function OverviewSection({ lang, tr, checklist, tasks, docs }) {
  const done = checklist.filter(c => c.done).length;
  const pct = checklist.length ? Math.round((done / checklist.length) * 100) : 0;
  const tasksDone = tasks.filter(t => t.status === "Completado").length;
  const phases = [...new Set(checklist.map(i => i.phase))];

  return (
    <div>
      <ClientURLGenerator tr={tr} />
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Checklist", val: `${done}/${checklist.length}`, sub: `${pct}%`, color: "#2196f3", bg: "#e8f4fd" },
          { label: tr.tasks, val: `${tasksDone}/${tasks.length}`, sub: tr.done, color: "#22a861", bg: "#e8f8f0" },
          { label: tr.resources, val: docs.length, sub: "links", color: "#7c3aed", bg: "#f3eeff" },
        ].map(({ label, val, sub, color, bg }) => (
          <div key={label} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Pillar tiles */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "22px 24px", marginBottom: 22 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 18, textAlign: "center" }}>{tr.pillarsTitle}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {PILLAR_DEFS.map(({ key, keyS, color, border, icon }) => (
            <div key={key} style={{ background: color, border: `1.5px solid ${border}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 26 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{tr[key]}</div>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>{tr[keyS]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase progress */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "22px 24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>{tr.checklistByPhase}</h3>
        {phases.map(phase => {
          const items = checklist.filter(i => i.phase === phase);
          const phDone = items.filter(i => i.done).length;
          const phPct = items.length ? Math.round((phDone / items.length) * 100) : 0;
          const col = PHASE_COLORS[phase] || { dot: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
          return (
            <div key={phase} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>{phase}</span>
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{phDone}/{items.length}</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${phPct}%`, background: col.dot, borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Copy Link Button ──────────────────────────────────────────────────────────
function CopyLinkButton({ tr }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} title={tr.copyLink} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: copied ? "#f0fdf4" : "#f8fafc", border: `1.5px solid ${copied ? "#86efac" : "#e2e8f0"}`, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: copied ? "#16a34a" : "#64748b", transition: "all 0.2s" }}>
      {copied ? tr.copied : tr.copyLink}
    </button>
  );
}

// ── Generate Client URL helper ────────────────────────────────────────────────
function ClientURLGenerator({ tr }) {
  const [clientName, setClientName] = useState("");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const safe = clientName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!safe) return;
    const base = window.location.origin + window.location.pathname;
    setGenerated(`${base}?client=${safe}`);
    setCopied(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(generated).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{tr.generateLinkTitle}</h3>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{tr.generateLinkDesc}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          style={{ ...inp, flex: "1 1 200px" }}
          placeholder={tr.clientNamePlaceholder}
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
        />
        <BtnPrimary onClick={generate}>{tr.generateBtn}</BtnPrimary>
      </div>
      {generated && (
        <div style={{ marginTop: 14, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: "#2563eb", wordBreak: "break-all" }}>{generated}</span>
          <button onClick={copy} style={{ flexShrink: 0, background: copied ? "#f0fdf4" : "#eff6ff", border: `1.5px solid ${copied ? "#86efac" : "#bfdbfe"}`, borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: copied ? "#16a34a" : "#2563eb" }}>
            {copied ? tr.copied : tr.copyBtn}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
const TABS = ["overview", "checklist", "tasks", "resources"];
const TAB_LABELS = { es: { overview: "Resumen", checklist: "Checklist", tasks: "Tareas", resources: "Recursos" }, en: { overview: "Overview", checklist: "Checklist", tasks: "Tasks", resources: "Resources" } };

export default function App() {
  const [lang, setLang] = useState(() => store.get("lang", "es"));
  const [tab, setTab] = useState("overview");
  const tr = t[lang];

  const [checklist] = useState(() => store.get("checklist", DEFAULT_CHECKLIST));
  const [tasks] = useState(() => store.get("tasks", DEFAULT_TASKS));
  const [docs] = useState(() => store.get("docs", DEFAULT_DOCS));

  const setLangSave = (l) => { setLang(l); store.set("lang", l); };

  const tabStyle = (key) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.18s",
    background: tab === key ? "linear-gradient(135deg,#0ea5e9,#2563eb)" : "transparent",
    color: tab === key ? "#fff" : "#64748b",
    boxShadow: tab === key ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
  });

  const tabIcons = { overview: "📊", checklist: "✅", tasks: "📋", resources: "🔗" };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e2e8f0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0 10px" }}>
            {/* Logo/Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0ea5e9,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
                <span style={{ fontSize: 18 }}>🤖</span>
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>{tr.appTitle}</div>
                <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>{tr.appSubtitle}</div>
              </div>
            </div>

            {/* Right: client badge + copy link + lang */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {/* Client badge */}
              <div style={{ background: CLIENT_ID === "default" ? "#fef9c3" : "#eff6ff", border: `1px solid ${CLIENT_ID === "default" ? "#fde68a" : "#bfdbfe"}`, borderRadius: 20, padding: "3px 12px", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Mono', monospace", color: CLIENT_ID === "default" ? "#92400e" : "#1d4ed8" }}>
                👤 {CLIENT_ID === "default" ? tr.noClient : CLIENT_ID}
              </div>
              <CopyLinkButton tr={tr} />
              {/* Lang toggle */}
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, gap: 2 }}>
                {["es", "en"].map(l => (
                  <button key={l} onClick={() => setLangSave(l)} style={{ padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: lang === l ? "#fff" : "transparent", color: lang === l ? "#2563eb" : "#94a3b8", boxShadow: lang === l ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, paddingBottom: 10 }}>
            {TABS.map(key => (
              <button key={key} onClick={() => setTab(key)} style={tabStyle(key)}>
                <span>{tabIcons[key]}</span> {TAB_LABELS[lang][key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px" }}>
        {tab === "overview"   && <OverviewSection lang={lang} tr={tr} checklist={checklist} tasks={tasks} docs={docs} />}
        {tab === "checklist"  && <ChecklistSection lang={lang} tr={tr} />}
        {tab === "tasks"      && <TasksSection lang={lang} tr={tr} />}
        {tab === "resources"  && <ResourcesSection lang={lang} tr={tr} />}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 0 32px", color: "#cbd5e1", fontSize: 12 }}>
        Joule × Ariba {tr.footerText} · {new Date().getFullYear()}
      </div>
    </div>
  );
}
