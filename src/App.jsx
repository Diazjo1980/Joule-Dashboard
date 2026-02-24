import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { generateClientPDF } from "./lib/pdfReport";
import t, { PILLARS } from "./i18n";
import { PHASE_COLORS, PRIORITY_COLORS, STATUS_COLORS } from "./data";

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
  calendar: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  user: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  back: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  shield: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

const Badge = ({ label, style: s }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, fontFamily:"'DM Mono', monospace", ...s }}>{label}</span>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
    <div style={{ background:"#fff", borderRadius:16, width:"min(540px,96vw)", maxHeight:"88vh", overflow:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px 0" }}>
        <h3 style={{ fontSize:17, fontWeight:700, color:"#0f172a" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, color:"#64748b", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.close(16)}</button>
      </div>
      <div style={{ padding:"20px 24px 24px" }}>{children}</div>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ fontSize:11.5, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.7px", display:"block", marginBottom:5 }}>{label}</label>
    {children}
  </div>
);

const inp = { width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:14, color:"#0f172a", background:"#f8fafc", outline:"none", fontFamily:"'DM Sans', sans-serif", boxSizing:"border-box" };
const sel = { ...inp };

const BtnPrimary = ({ onClick, children, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ background:disabled?"#94a3b8":"linear-gradient(135deg,#0ea5e9,#2563eb)", border:"none", color:"#fff", padding:"9px 20px", borderRadius:8, cursor:disabled?"not-allowed":"pointer", fontWeight:700, fontSize:13.5, fontFamily:"'DM Sans', sans-serif", display:"inline-flex", alignItems:"center", gap:6 }}>
    {children}
  </button>
);
const BtnGhost = ({ onClick, children }) => (
  <button onClick={onClick} style={{ background:"#f1f5f9", border:"1.5px solid #e2e8f0", color:"#64748b", padding:"9px 16px", borderRadius:8, cursor:"pointer", fontSize:13.5, fontFamily:"'DM Sans', sans-serif" }}>{children}</button>
);
const BtnAdd = ({ onClick, children }) => (
  <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#eff6ff", border:"1.5px dashed #93c5fd", color:"#2563eb", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"'DM Sans', sans-serif", marginTop:12 }}>
    {icons.plus(14)} {children}
  </button>
);
const Spinner = () => (
  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"60px 0" }}>
    <div style={{ width:32, height:32, border:"3px solid #e2e8f0", borderTopColor:"#2563eb", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginView({ tr }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f0f4f8,#e8f0fe)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"40px 44px", width:"min(420px,100%)", boxShadow:"0 20px 60px rgba(0,0,0,0.1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32, justifyContent:"center" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#0ea5e9,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🤖</div>
          <div>
            <div style={{ fontSize:19, fontWeight:800, color:"#0f172a" }}>Joule × Ariba</div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>{tr.appSubtitle}</div>
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <Field label="Email"><input style={inp} type="email" placeholder="consultor@empresa.com" value={email} onChange={e=>setEmail(e.target.value)} required /></Field>
          <Field label={tr.password || "Password"}><input style={inp} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required /></Field>
          {error && <div style={{ color:"#ef4444", fontSize:13, marginBottom:12, padding:"8px 12px", background:"#fef2f2", borderRadius:8, border:"1px solid #fecaca" }}>{error}</div>}
          <BtnPrimary disabled={loading}>{loading ? (tr.loggingIn||"Ingresando...") : (tr.login||"Ingresar")}</BtnPrimary>
        </form>
      </div>
    </div>
  );
}

// ── CLIENT LIST ───────────────────────────────────────────────────────────────
function ClientListView({ profile, tr, onSelectClient, lang, setLang }) {
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const [{ data: c }, { data: a }] = await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("client_assignments").select("*, profiles(name,email)").eq("active", true),
      ]);
      setClients(c||[]); setAssignments(a||[]); setLoading(false);
    };
    load();
  }, []);

  const getMyRole = (cid) => assignments.find(a=>a.client_id===cid&&a.consultant_id===profile.id)?.role;
  const getConsultants = (cid) => assignments.filter(a=>a.client_id===cid&&a.active);
  const roleColor = { primary:"#2563eb", specialist:"#7c3aed", backup:"#f59e0b" };
  const roleBg   = { primary:"#eff6ff", specialist:"#f3eeff", backup:"#fffbeb" };
  const filtered = clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8" }}>
      <div style={{ background:"#fff", borderBottom:"1.5px solid #e2e8f0", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 20px", display:"flex", justifyContent:"space-between", alignItems:"center", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0ea5e9,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>Joule × Ariba</div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>{tr.appSubtitle}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {profile.role === "admin" && (
              <button onClick={()=>onSelectClient("__admin__")} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#fef9c3", border:"1.5px solid #fde68a", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13, fontWeight:700, color:"#92400e" }}>
                {icons.shield(14)} {tr.adminPanel}
              </button>
            )}
            <div style={{ display:"flex", background:"#f1f5f9", borderRadius:8, padding:3, gap:2 }}>
              {["es","en"].map(l=>(
                <button key={l} onClick={()=>setLang(l)} style={{ padding:"4px 10px", borderRadius:6, border:"none", cursor:"pointer", fontWeight:700, fontSize:12, background:lang===l?"#fff":"transparent", color:lang===l?"#2563eb":"#94a3b8" }}>{l.toUpperCase()}</button>
              ))}
            </div>
            <span style={{ fontSize:13, color:"#64748b", display:"flex", alignItems:"center", gap:5 }}>{icons.user(13)} {profile.name}</span>
            <button onClick={()=>supabase.auth.signOut()} style={{ background:"#fff0f0", border:"1.5px solid #fecaca", borderRadius:8, padding:"6px 10px", cursor:"pointer", color:"#ef4444", lineHeight:0 }}>{icons.logout(16)}</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"28px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#1e293b" }}>{tr.myClients||"Mis Clientes"}</h2>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}>{icons.search(15)}</span>
            <input style={{ ...inp, paddingLeft:34, width:240 }} placeholder={tr.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <Spinner /> : (
          filtered.length === 0
            ? <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8" }}><div style={{ fontSize:40, marginBottom:12 }}>👤</div>{tr.noClientsAssigned||"No tienes clientes asignados"}</div>
            : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
                {filtered.map(client => {
                  const myRole = getMyRole(client.id);
                  const consultants = getConsultants(client.id);
                  return (
                    <div key={client.id} onClick={()=>onSelectClient(client)}
                      style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:14, padding:"20px 22px", cursor:"pointer", transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 24px rgba(37,99,235,0.1)";e.currentTarget.style.borderColor="#bfdbfe"}}
                      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="#e2e8f0"}}
                    >
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:17, fontWeight:800, color:"#1e293b", marginBottom:3 }}>{client.name}</div>
                          <div style={{ fontSize:11.5, color:"#94a3b8", fontFamily:"'DM Mono', monospace" }}>?client={client.slug}</div>
                        </div>
                        {myRole && <Badge label={myRole} style={{ background:roleBg[myRole], color:roleColor[myRole], border:`1px solid ${roleColor[myRole]}33` }} />}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        {consultants.map(a=>(
                          <div key={a.id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748b" }}>
                            {icons.user(12)} <span>{a.profiles?.name}</span>
                            {a.area && <span style={{ color:"#94a3b8" }}>· {a.area}</span>}
                            {a.role==="backup" && <Badge label="backup" style={{ background:"#fffbeb", color:"#f59e0b", border:"1px solid #fde68a", fontSize:10 }} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
        )}
      </div>
    </div>
  );
}

// ── Consolidated Report Button (Admin) ───────────────────────────────────────
function ConsolidatedReportButton({ clients, assignments }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const clientsData = await Promise.all(clients.map(async (client) => {
        const [{ data:checklist },{ data:tasks },{ data:resources },{ data:serviceRequests }] = await Promise.all([
          supabase.from("client_checklist").select("*").eq("client_id", client.id).order("sort_order").order("created_at"),
          supabase.from("client_tasks").select("*").eq("client_id", client.id),
          supabase.from("client_resources").select("*").eq("client_id", client.id),
          supabase.from("client_service_requests").select("*").eq("client_id", client.id),
        ]);
        const consultants = assignments.filter(a => a.client_id === client.id && a.active);
        return { client, consultants, checklist:checklist||[], tasks:tasks||[], resources:resources||[], serviceRequests:serviceRequests||[] };
      }));

      // Build consolidated PDF manually
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
      const W=210, M=18, CW=W-M*2;

      // Cover page
      doc.setFillColor(37,99,235); doc.rect(0,0,W,50,"F");
      doc.setTextColor(255,255,255);
      doc.setFontSize(22); doc.setFont("helvetica","bold"); doc.text("Joule × Ariba",M,22);
      doc.setFontSize(12); doc.setFont("helvetica","normal"); doc.text("Reporte Consolidado de Activación",M,32);
      doc.setFontSize(9); doc.text(new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"}),M,42);
      doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.text(`${clients.length} clientes`,W-M,42,{align:"right"});

      let y = 60;
      // Summary table header
      doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42);
      doc.text("Resumen de Clientes", M, y); y+=7;
      doc.setFillColor(37,99,235); doc.rect(M,y,CW,7,"F");
      doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
      doc.text("Cliente",M+3,y+5); doc.text("Consultor",M+55,y+5); doc.text("Checklist",M+105,y+5);
      doc.text("Tareas",M+130,y+5); doc.text("SRs",M+152,y+5); doc.text("Estado",M+165,y+5);
      y+=8;

      clientsData.forEach(({ client:c, consultants:cons, checklist, tasks, serviceRequests }, idx) => {
        if (y>265) { doc.addPage(); y=20; }
        const pct = checklist.length ? Math.round(checklist.filter(i=>i.done).length/checklist.length*100) : 0;
        const doneT = tasks.filter(t=>t.status==="Completado").length;
        const openSR = serviceRequests.filter(s=>s.status==="Abierto"||s.status==="En progreso").length;
        const primary = cons.find(a=>a.role==="primary");
        const statusText = pct===100?"Completo":pct>=50?"En Progreso":"Iniciando";
        const statusCol = pct===100?[22,163,74]:pct>=50?[37,99,235]:[245,158,11];
        if(idx%2===0){doc.setFillColor(248,250,252);doc.rect(M,y-4,CW,7,"F");}
        doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42);
        doc.text(c.name,M+3,y);
        doc.setFont("helvetica","normal"); doc.setTextColor(100,116,139);
        doc.text(primary?.profiles?.name||"—",M+55,y);
        // progress bar
        doc.setFillColor(226,232,240); doc.rect(M+105,y-3,20,2.5,"F");
        doc.setFillColor(37,99,235); doc.rect(M+105,y-3,20*(pct/100),2.5,"F");
        doc.setTextColor(37,99,235); doc.setFontSize(7); doc.text(`${pct}%`,M+127,y);
        doc.setFontSize(8); doc.setTextColor(15,23,42); doc.text(`${doneT}/${tasks.length}`,M+130,y);
        doc.setTextColor(...(openSR>0?[245,158,11]:[22,163,74])); doc.text(`${serviceRequests.length}`,M+152,y);
        doc.setFont("helvetica","bold"); doc.setTextColor(...statusCol); doc.text(statusText,M+165,y);
        y+=7;
      });

      // Detail section per client
      for (const { client:c, consultants:cons, checklist, tasks, serviceRequests, resources } of clientsData) {
        doc.addPage(); y=0;
        // Client header
        doc.setFillColor(37,99,235); doc.rect(0,0,W,28,"F");
        doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont("helvetica","bold"); doc.text(c.name,M,16);
        doc.setFontSize(8); doc.setFont("helvetica","normal");
        const primary=cons.find(a=>a.role==="primary");
        if(primary) doc.text(`Consultor: ${primary.profiles?.name}`,M,23);
        y=36;

        // Mini summary
        const pct=checklist.length?Math.round(checklist.filter(i=>i.done).length/checklist.length*100):0;
        doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(100,116,139);
        doc.text(`Checklist: ${checklist.filter(i=>i.done).length}/${checklist.length} (${pct}%)  ·  Tareas completadas: ${tasks.filter(t=>t.status==="Completado").length}/${tasks.length}  ·  SRs: ${serviceRequests.length}`,M,y);
        y+=10;

        // Checklist phases
        const sectionH = (t2) => {
          if(y>260){doc.addPage();y=20;}
          doc.setFillColor(37,99,235); doc.rect(M,y,CW,7,"F");
          doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255); doc.text(t2,M+3,y+5); y+=10;
        };
        sectionH("CHECKLIST POR FASE");
        const phases=[...new Set(checklist.map(i=>i.phase))];
        phases.forEach(phase=>{
          const items=checklist.filter(i=>i.phase===phase);
          const done=items.filter(i=>i.done).length;
          if(y>260){doc.addPage();y=20;}
          doc.setFillColor(240,244,248); doc.rect(M,y,CW,7,"F");
          doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42); doc.text(phase,M+3,y+5);
          doc.setTextColor(37,99,235); doc.text(`${done}/${items.length}`,W-M-3,y+5,{align:"right"});
          y+=9;
          items.forEach(item=>{
            if(y>268){doc.addPage();y=20;}
            const label=item.item_es;
            if(item.done){doc.setFillColor(22,163,74);doc.rect(M+3,y-3.5,4,4,"F");doc.setTextColor(255,255,255);doc.setFontSize(6);doc.text("✓",M+3.8,y-0.5);}
            else{doc.setDrawColor(226,232,240);doc.rect(M+3,y-3.5,4,4,"S");}
            doc.setFontSize(7.5); doc.setFont("helvetica","normal");
            doc.setTextColor(item.done?100:15,item.done?116:23,item.done?139:42);
            const lines=doc.splitTextToSize(label,CW-12); doc.text(lines,M+9,y); y+=lines.length*4.5+0.5;
          });
          y+=2;
        });

        // SRs
        if(serviceRequests.length>0){
          sectionH("SERVICE REQUESTS — ServiceNow");
          serviceRequests.forEach((sr,idx)=>{
            if(y>268){doc.addPage();y=20;}
            if(idx%2===0){doc.setFillColor(248,250,252);doc.rect(M,y-4,CW,6.5,"F");}
            doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(37,99,235); doc.text(sr.sr_number||"",M+3,y);
            doc.setFont("helvetica","normal"); doc.setTextColor(15,23,42); doc.text(doc.splitTextToSize(sr.title||"",100)[0],M+28,y);
            doc.setTextColor(100,116,139); doc.text(sr.priority||"",M+140,y); doc.text(sr.status||"",M+160,y);
            y+=6.5;
          });
          y+=3;
        }

        // Tasks
        if(tasks.length>0){
          sectionH("TAREAS");
          tasks.forEach((task,idx)=>{
            if(y>268){doc.addPage();y=20;}
            if(idx%2===0){doc.setFillColor(248,250,252);doc.rect(M,y-4,CW,6.5,"F");}
            doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(15,23,42);
            doc.text(doc.splitTextToSize(task.title_es||"",90)[0],M+3,y);
            doc.setTextColor(100,116,139); doc.text(task.priority||"",M+105,y); doc.text(task.status||"",M+130,y);
            if(task.due) doc.text(task.due,M+163,y);
            y+=6.5;
          });
        }
      }

      // Page numbers
      const total=doc.internal.getNumberOfPages();
      for(let i=1;i<=total;i++){
        doc.setPage(i); doc.setFillColor(226,232,240); doc.rect(0,285,W,12,"F");
        doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(100,116,139);
        doc.text("Joule × Ariba — Reporte Consolidado",M,291);
        doc.text(`${i} / ${total}`,W-M,291,{align:"right"});
      }

      doc.save(`joule-ariba-reporte-consolidado-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch(e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  return (
    <button onClick={generate} disabled={loading} style={{ display:"inline-flex", alignItems:"center", gap:6, background:loading?"#f1f5f9":"linear-gradient(135deg,#0ea5e9,#2563eb)", border:"none", borderRadius:8, padding:"8px 16px", cursor:loading?"not-allowed":"pointer", fontSize:13, fontWeight:700, color:"#fff" }}>
      📊 {loading?"Generando PDF...":"Reporte Consolidado PDF"}
    </button>
  );
}

// ── Client Progress Badge (used in Admin progress tab) ────────────────────────
function ClientProgressBadge({ clientId }) {
  const [pct, setPct] = useState(null);
  useEffect(() => {
    supabase.from("client_checklist").select("done").eq("client_id", clientId).then(({ data }) => {
      if (!data || data.length === 0) { setPct(-1); return; }
      setPct(Math.round((data.filter(i=>i.done).length / data.length) * 100));
    });
  }, [clientId]);
  if (pct === null) return <span style={{ fontSize:12, color:"#94a3b8" }}>...</span>;
  if (pct === -1) return <span style={{ fontSize:12, color:"#94a3b8" }}>Sin checklist</span>;
  const color = pct === 100 ? "#16a34a" : pct >= 50 ? "#2563eb" : "#f59e0b";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:80, height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3 }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, color, fontFamily:"'DM Mono', monospace" }}>{pct}%</span>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ profile, tr, onBack }) {
  const [tab, setTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data:c },{ data:p },{ data:a }] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("profiles").select("*").order("name"),
      supabase.from("client_assignments").select("*, clients(name), profiles(name,email)").order("created_at",{ascending:false}),
    ]);
    setClients(c||[]); setConsultants(p||[]); setAssignments(a||[]); setLoading(false);
  }, []);
  useEffect(()=>{ load(); },[load]);

  const saveClient = async () => {
    if (!form.name?.trim()) return;
    const slug = (form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));
    if (editId) await supabase.from("clients").update({ name:form.name, slug }).eq("id",editId);
    else await supabase.from("clients").insert({ name:form.name, slug });
    setModal(null); setForm({}); setEditId(null); load();
  };

  const deleteClient = async (id) => {
    if (!window.confirm(tr.deleteClientConfirm)) return;
    await supabase.from("clients").delete().eq("id",id); load();
  };

  const saveAssignment = async () => {
    if (!form.client_id||!form.consultant_id) return;
    await supabase.from("client_assignments").upsert({ client_id:form.client_id, consultant_id:form.consultant_id, role:form.role||"primary", area:form.area||null, active:true },{ onConflict:"client_id,consultant_id" });
    setModal(null); setForm({}); load();
  };

  const saveBackup = async () => {
    if (!form.client_id||!form.consultant_id||!form.backup_start||!form.backup_end) return;
    await supabase.from("client_assignments").upsert({ client_id:form.client_id, consultant_id:form.consultant_id, role:"backup", backup_start:form.backup_start, backup_end:form.backup_end, active:true },{ onConflict:"client_id,consultant_id" });
    setModal(null); setForm({}); load();
  };

  const deleteAssignment = async (id) => { await supabase.from("client_assignments").delete().eq("id",id); load(); };

  // ── Call Netlify function ────────────────────────────────────────────────
  const callAdminFn = async (action, data) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/.netlify/functions/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
      body: JSON.stringify({ action, ...data }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  };

  const saveConsultant = async () => {
    if (!form.name?.trim()) { alert(tr.fullName + " es requerido"); return; }
    if (!editId && (!form.email?.trim() || !form.password?.trim())) { alert("Email y contraseña son requeridos"); return; }
    setSaving(true);
    try {
      if (editId) {
        // Edit: update name and role in profiles, optionally reset password
        await supabase.from("profiles").update({ name: form.name, role: form.role || "consultant" }).eq("id", editId);
        if (form.password?.trim()) {
          await callAdminFn("reset_password", { userId: editId, password: form.password });
        }
      } else {
        await callAdminFn("create_user", { email: form.email, password: form.password, name: form.name, role: form.role || "consultant" });
      }
      setModal(null); setForm({}); setEditId(null); load();
    } catch(e) { alert(e.message); }
    setSaving(false);
  };

  const updateRole = async (userId, role) => {
    try { await callAdminFn("update_role", { userId, role }); load(); }
    catch(e) { alert(e.message); }
  };

  // Fix: delete admin - use service role via Netlify fn, works for any role
  const deleteConsultant = async (c) => {
    if (c.id === profile.id) { alert("No puedes eliminar tu propio usuario."); return; }
    if (!window.confirm(tr.deleteUserConfirm)) return;
    try {
      await callAdminFn("delete_user", { userId: c.id });
      load();
    } catch(e) { alert(e.message); }
  };

  const tabStyle = (key) => ({ padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"'DM Sans', sans-serif", background:tab===key?"linear-gradient(135deg,#0ea5e9,#2563eb)":"transparent", color:tab===key?"#fff":"#64748b" });
  const TABS_ADMIN = { clients: tr.tabClients, consultants: tr.tabConsultants, assignments: tr.tabAssignments, backup: tr.tabBackup, progress: tr.tabProgress };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8" }}>
      <div style={{ background:"#fff", borderBottom:"1.5px solid #e2e8f0", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 20px", display:"flex", justifyContent:"space-between", alignItems:"center", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={onBack} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:"6px 10px", cursor:"pointer", color:"#64748b", lineHeight:0 }}>{icons.back(16)}</button>
            <span style={{ fontSize:16, fontWeight:800, color:"#1e293b", display:"flex", alignItems:"center", gap:6 }}>{icons.shield(16)} {tr.adminPanelTitle}</span>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {Object.entries(TABS_ADMIN).map(([key,label])=>(
              <button key={key} onClick={()=>setTab(key)} style={tabStyle(key)}>{label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"28px 20px" }}>
        {loading ? <Spinner /> : (
          <>
            {tab==="clients" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ fontSize:17, fontWeight:700, color:"#1e293b" }}>Clientes ({clients.length})</h3>
                  <BtnPrimary onClick={()=>{ setForm({}); setEditId(null); setModal("client"); }}>{icons.plus(14)} {tr.newClient}</BtnPrimary>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {clients.map(c=>{
                    const assigned = assignments.filter(a=>a.client_id===c.id&&a.active);
                    return (
                      <div key={c.id} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:16 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:15, color:"#1e293b" }}>{c.name}</div>
                          <div style={{ fontSize:12, color:"#94a3b8", fontFamily:"'DM Mono', monospace" }}>?client={c.slug}</div>
                        </div>
                        <div style={{ fontSize:12, color:"#64748b" }}>{assigned.length} consultor(es)</div>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>{ setForm({ name:c.name, slug:c.slug }); setEditId(c.id); setModal("client"); }} style={{ background:"#eff6ff", border:"none", borderRadius:7, color:"#2563eb", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.edit(14)}</button>
                          <button onClick={()=>deleteClient(c.id)} style={{ background:"#fff0f0", border:"none", borderRadius:7, color:"#ef4444", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.trash(14)}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tab==="consultants" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ fontSize:17, fontWeight:700, color:"#1e293b" }}>{tr.tabConsultants} ({consultants.length})</h3>
                  <BtnPrimary onClick={()=>{ setForm({ role:"consultant" }); setEditId(null); setModal("consultant"); }}>{icons.plus(14)} {tr.newConsultant}</BtnPrimary>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {consultants.map(c=>(
                    <div key={c.id} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0 }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>{c.name}</div>
                        <div style={{ fontSize:12, color:"#94a3b8" }}>{c.email}</div>
                      </div>
                      <Badge label={c.role==="admin"?tr.roleAdmin:tr.roleConsultant} style={{ background:c.role==="admin"?"#fef9c3":"#eff6ff", color:c.role==="admin"?"#92400e":"#2563eb", border:"none" }} />
                      {/* Promote/demote */}
                      {c.id !== profile.id && (
                        <button onClick={()=>updateRole(c.id, c.role==="admin"?"consultant":"admin")}
                          title={c.role==="admin"?tr.demoteTitle:tr.promoteTitle}
                          style={{ background:c.role==="admin"?"#fff0f0":"#fffbeb", border:`1.5px solid ${c.role==="admin"?"#fecaca":"#fde68a"}`, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:11.5, fontWeight:700, color:c.role==="admin"?"#ef4444":"#92400e" }}>
                          {c.role==="admin"?tr.demoteAdmin:tr.promoteAdmin}
                        </button>
                      )}
                      {/* Edit */}
                      <button onClick={()=>{ setEditId(c.id); setForm({ name:c.name, role:c.role, password:"" }); setModal("consultant"); }}
                        style={{ background:"#eff6ff", border:"none", borderRadius:7, color:"#2563eb", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.edit(14)}</button>
                      {/* Delete - disabled for self */}
                      {c.id !== profile.id && (
                        <button onClick={()=>deleteConsultant(c)} style={{ background:"#fff0f0", border:"none", borderRadius:7, color:"#ef4444", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.trash(14)}</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab==="assignments" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ fontSize:17, fontWeight:700, color:"#1e293b" }}>Asignaciones</h3>
                  <BtnPrimary onClick={()=>{ setForm({}); setModal("assignment"); }}>{icons.plus(14)} Nueva asignación</BtnPrimary>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {assignments.filter(a=>a.role!=="backup").map(a=>(
                    <div key={a.id} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>{a.clients?.name}</div>
                        <div style={{ fontSize:12, color:"#64748b", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
                          {icons.user(12)} {a.profiles?.name} {a.area && <span style={{ color:"#94a3b8" }}>· {a.area}</span>}
                        </div>
                      </div>
                      <Badge label={a.role} style={{ background:"#eff6ff", color:"#2563eb", border:"none" }} />
                      <button onClick={()=>deleteAssignment(a.id)} style={{ background:"#fff0f0", border:"none", borderRadius:7, color:"#ef4444", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.trash(14)}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab==="backup" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ fontSize:17, fontWeight:700, color:"#1e293b" }}>{tr.tabBackup}</h3>
                  <BtnPrimary onClick={()=>{ setForm({}); setModal("backup"); }}>{icons.plus(14)} {tr.registerBackup}</BtnPrimary>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {assignments.filter(a=>a.role==="backup").length===0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}{tr.noBackups}</div>}
                  {assignments.filter(a=>a.role==="backup").map(a=>{
                    const today = new Date().toISOString().split("T")[0];
                    const active = a.backup_end >= today && a.backup_start <= today;
                    return (
                      <div key={a.id} style={{ background:"#fff", border:`1.5px solid ${active?"#fde68a":"#e2e8f0"}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>{a.clients?.name}</div>
                          <div style={{ fontSize:12, color:"#64748b", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
                            {icons.user(12)} {a.profiles?.name} <span style={{ color:"#94a3b8" }}>· {a.backup_start} → {a.backup_end}</span>
                          </div>
                        </div>
                        {active
                          ? <Badge label={tr.active} style={{ background:"#fffbeb", color:"#f59e0b", border:"1px solid #fde68a" }} />
                          : <Badge label={tr.inactive} style={{ background:"#f1f5f9", color:"#94a3b8", border:"none" }} />
                        }
                        <button onClick={()=>deleteAssignment(a.id)} style={{ background:"#fff0f0", border:"none", borderRadius:7, color:"#ef4444", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.trash(14)}</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tab==="progress" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ fontSize:17, fontWeight:700, color:"#1e293b" }}{tr.allClientsProgress}</h3>
                  <ConsolidatedReportButton clients={clients} assignments={assignments} />
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {clients.map(client => {
                    const assigned = assignments.filter(a=>a.client_id===client.id&&a.active&&a.role!=="backup");
                    return (
                      <div key={client.id} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"16px 20px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                          <div>
                            <div style={{ fontWeight:700, fontSize:15, color:"#1e293b" }}>{client.name}</div>
                            <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                              {assigned.map(a=>(
                                <span key={a.id} style={{ fontSize:11.5, color:"#64748b", display:"flex", alignItems:"center", gap:4 }}>
                                  {icons.user(11)} {a.profiles?.name} {a.area&&<span style={{ color:"#94a3b8" }}>({a.area})</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ClientProgressBadge clientId={client.id} />
                        </div>
                      </div>
                    );
                  })}
                  {clients.length===0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>No hay clientes creados aún</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modal==="consultant" && (
        <Modal title={editId ? tr.editConsultant : tr.newConsultant} onClose={()=>{ setModal(null); setForm({}); setEditId(null); }}>
          <Field label={tr.fullName}><input style={inp} placeholder="ej. Ana García" value={form.name||""} onChange={e=>setForm({ ...form, name:e.target.value })} /></Field>
          {!editId && <Field label={tr.email}><input style={inp} type="email" placeholder="ana@empresa.com" value={form.email||""} onChange={e=>setForm({ ...form, email:e.target.value })} /></Field>}
          <Field label={editId ? "Nueva contraseña (dejar vacío para no cambiar)" : tr.tempPassword}>
            <input style={inp} type="password" placeholder={editId ? "••••••• (opcional)" : tr.minChars} value={form.password||""} onChange={e=>setForm({ ...form, password:e.target.value })} />
          </Field>
          <Field label={tr.role}>
            <select style={sel} value={form.role||"consultant"} onChange={e=>setForm({ ...form, role:e.target.value })}>
              <option value="consultant">{tr.roleConsultant}</option>
              <option value="admin">{tr.roleAdmin}</option>
            </select>
          </Field>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <BtnGhost onClick={()=>{ setModal(null); setForm({}); setEditId(null); }}>{tr.cancel}</BtnGhost>
            <BtnPrimary onClick={saveConsultant} disabled={saving}>{saving ? tr.saving : (editId ? tr.updateUser : tr.createUser)}</BtnPrimary>
          </div>
        </Modal>
      )}
      {modal==="client" && (
        <Modal title={editId?tr.editClient:tr.newClient} onClose={()=>{ setModal(null); setForm({}); setEditId(null); }}>
          <Field label={tr.clientName}><input style={inp} placeholder="ej. Acme Corp" value={form.name||""} onChange={e=>setForm({ ...form, name:e.target.value, slug:e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") })} /></Field>
          <Field label={tr.clientSlug}><input style={inp} placeholder="ej. acme-corp" value={form.slug||""} onChange={e=>setForm({ ...form, slug:e.target.value })} /></Field>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}><BtnGhost onClick={()=>{ setModal(null); setForm({}); setEditId(null); }}>{tr.cancel}</BtnGhost><BtnPrimary onClick={saveClient}>{tr.save}</BtnPrimary></div>
        </Modal>
      )}
      {modal==="assignment" && (
        <Modal title={tr.newAssignment} onClose={()=>{ setModal(null); setForm({}); }}>
          <Field label={tr.tabClients}><select style={sel} value={form.client_id||""} onChange={e=>setForm({ ...form, client_id:e.target.value })}><option value="">{tr.selectOption}</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label={tr.tabConsultants}><select style={sel} value={form.consultant_id||""} onChange={e=>setForm({ ...form, consultant_id:e.target.value })}><option value="">{tr.selectOption}</option>{consultants.map(c=><option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}</select></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label={tr.role}><select style={sel} value={form.role||"primary"} onChange={e=>setForm({ ...form, role:e.target.value })}><option value="primary">{tr.rolePrimary}</option><option value="specialist">{tr.roleSpecialist}</option></select></Field>
            <Field label={tr.area}><input style={inp} placeholder={tr.areaPlaceholder} value={form.area||""} onChange={e=>setForm({ ...form, area:e.target.value })} /></Field>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}><BtnGhost onClick={()=>{ setModal(null); setForm({}); }}>{tr.cancel}</BtnGhost><BtnPrimary onClick={saveAssignment}>{tr.save}</BtnPrimary></div>
        </Modal>
      )}
      {modal==="backup" && (
        <Modal title={tr.registerBackup} onClose={()=>{ setModal(null); setForm({}); }}>
          <Field label={tr.tabClients}><select style={sel} value={form.client_id||""} onChange={e=>setForm({ ...form, client_id:e.target.value })}><option value="">{tr.selectOption}</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label={tr.roleBackup}><select style={sel} value={form.consultant_id||""} onChange={e=>setForm({ ...form, consultant_id:e.target.value })}><option value="">{tr.selectOption}</option>{consultants.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label={tr.backupStart}><input type="date" style={inp} value={form.backup_start||""} onChange={e=>setForm({ ...form, backup_start:e.target.value })} /></Field>
            <Field label={tr.backupEnd}><input type="date" style={inp} value={form.backup_end||""} onChange={e=>setForm({ ...form, backup_end:e.target.value })} /></Field>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}><BtnGhost onClick={()=>{ setModal(null); setForm({}); }}>{tr.cancel}</BtnGhost><BtnPrimary onClick={saveBackup}>{tr.save}</BtnPrimary></div>
        </Modal>
      )}
    </div>
  );
}

// ── PILLAR DEFS ───────────────────────────────────────────────────────────────
const PILLAR_DEFS = [
  { key:"pillar1", keyS:"pillar1sub", color:"#e8f4fd", border:"#bbd6f0", icon:"🔍" },
  { key:"pillar2", keyS:"pillar2sub", color:"#e8f8f0", border:"#b2dfc9", icon:"📋" },
  { key:"pillar3", keyS:"pillar3sub", color:"#f3eeff", border:"#d0baff", icon:"🧭" },
  { key:"pillar4", keyS:"pillar4sub", color:"#fff4e8", border:"#ffd4a0", icon:"⚙️" },
  { key:"pillar5", keyS:"pillar5sub", color:"#fdf2f8", border:"#f0abda", icon:"🚀" },
];

// ── CHECKLIST ─────────────────────────────────────────────────────────────────
function ChecklistSection({ clientId, lang, tr }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({});
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ phase:"", item_es:"", item_en:"", parent_id:null });
  const pillars = PILLARS[lang] || PILLARS.es;

  const load = useCallback(async () => {
    const { data } = await supabase.from("client_checklist").select("*").eq("client_id",clientId).order("sort_order").order("created_at");
    setItems(data||[]); setLoading(false);
  },[clientId]);
  useEffect(()=>{ load(); },[load]);

  // Recursively collect all descendant IDs
  const getDescendantIds = useCallback((id, allItems) => {
    const children = allItems.filter(i=>i.parent_id===id);
    return children.reduce((acc, c) => [...acc, c.id, ...getDescendantIds(c.id, allItems)], []);
  }, []);

  const toggle = async (item) => {
    const newDone = !item.done;
    const descIds = getDescendantIds(item.id, items);
    const allIds = [item.id, ...descIds];
    await supabase.from("client_checklist").update({ done:newDone }).in("id", allIds);
    setItems(prev=>prev.map(i=>allIds.includes(i.id)?{ ...i, done:newDone }:i));
  };

  const del = async (id) => {
    const descIds = getDescendantIds(id, items);
    await supabase.from("client_checklist").delete().eq("id",id);
    const removeIds = new Set([id, ...descIds]);
    setItems(prev=>prev.filter(i=>!removeIds.has(i.id)));
  };

  const openAddStep = (parentId=null, phase="") => {
    setForm({ phase: phase||"", item_es:"", item_en:"", parent_id:parentId });
    setModal(true);
  };

  const addItem = async () => {
    if (!form.item_es.trim()) return;
    const phaseValue = form.parent_id
      ? (items.find(i=>i.id===form.parent_id)?.phase || tr.customPhase)
      : (form.phase || tr.customPhase);
    const { data } = await supabase.from("client_checklist").insert({
      client_id:clientId, phase:phaseValue,
      item_es:form.item_es, item_en:form.item_en||form.item_es,
      done:false, parent_id:form.parent_id||null,
    }).select().single();
    if (data) setItems(prev=>[...prev, data]);
    setModal(false); setForm({ phase:"", item_es:"", item_en:"", parent_id:null });
  };

  const getLabel = (it) => it ? (lang==="en" ? (it.item_en||it.item_es) : it.item_es) : "";
  const getChildren = (parentId) => items.filter(i=>i.parent_id===parentId);
  const rootItems = items.filter(i=>!i.parent_id);
  const phases = [...new Set(rootItems.map(i=>i.phase))];
  const done = items.filter(i=>i.done).length;
  const pct = items.length ? Math.round((done/items.length)*100) : 0;

  // Recursive item renderer
  const renderItem = (it, depth=0) => {
    const children = getChildren(it.id);
    const descIds = getDescendantIds(it.id, items);
    const allDesc = items.filter(i=>descIds.includes(i.id));
    const childDone = allDesc.filter(i=>i.done).length;
    const col = PHASE_COLORS[it.phase]||{ bg:"#f1f5f9", border:"#e2e8f0", dot:"#94a3b8" };
    const indent = 16 + depth * 20;
    const checkSize = Math.max(16, 22 - depth * 2);
    const fontSize = Math.max(12, 13.5 - depth * 0.5);
    const isCollapsedItem = collapsed[it.id];

    return (
      <div key={it.id}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:`9px 16px 9px ${indent}px`, borderTop:`1px solid ${col.border}${depth>0?"22":"44"}`, background:it.done?(depth>0?"#f5fdf5":"#f8fff8"):(depth>0?"#fafcff":"#fff"), transition:"background 0.15s" }}>
          {/* Vertical connector line for nested items */}
          {depth > 0 && (
            <div style={{ position:"absolute", left:indent-10, top:0, bottom:0, width:1, background:`${col.border}66` }} />
          )}
          {/* Collapse toggle if has children */}
          {children.length > 0 ? (
            <button onClick={()=>setCollapsed(c=>({ ...c,[it.id]:!c[it.id] }))}
              style={{ flexShrink:0, width:14, height:14, display:"flex", alignItems:"center", justifyContent:"center", background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, transform:isCollapsedItem?"rotate(-90deg)":"none", transition:"0.2s" }}>
              {icons.chevron(12)}
            </button>
          ) : <div style={{ width:14, flexShrink:0 }} />}
          {/* Checkbox */}
          <button onClick={()=>toggle(it)} style={{ flexShrink:0, width:checkSize, height:checkSize, borderRadius:depth>0?4:6, border:`2px solid ${it.done?col.dot:"#cbd5e1"}`, background:it.done?col.bg:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:col.dot, transition:"all 0.15s" }}>
            {it.done && icons.check(checkSize-8)}
          </button>
          {/* Label */}
          <span style={{ flex:1, fontSize, fontWeight:depth===0?600:400, color:it.done?"#94a3b8":"#334155", textDecoration:it.done?"line-through":"none" }}>{getLabel(it)}</span>
          {/* Children counter */}
          {children.length > 0 && (
            <span style={{ fontSize:10, color:col.dot, fontFamily:"'DM Mono',monospace", background:col.bg, padding:"1px 6px", borderRadius:10, border:`1px solid ${col.border}`, flexShrink:0 }}>{childDone}/{allDesc.length}</span>
          )}
          {/* Add sub-step */}
          <button onClick={e=>{e.stopPropagation(); openAddStep(it.id, it.phase);}}
            title={tr.addSubStep}
            style={{ background:"none", border:"none", color:"#bfdbfe", cursor:"pointer", fontSize:10.5, fontWeight:700, padding:"2px 3px", borderRadius:3, flexShrink:0 }}
            onMouseEnter={e=>e.currentTarget.style.color="#2563eb"} onMouseLeave={e=>e.currentTarget.style.color="#bfdbfe"}
          >+ sub</button>
          {/* Delete */}
          <button onClick={()=>del(it.id)} style={{ background:"none", border:"none", color:"#e2e8f0", cursor:"pointer", borderRadius:4, flexShrink:0, lineHeight:0 }}
            onMouseEnter={e=>e.currentTarget.style.color="#ef4444"} onMouseLeave={e=>e.currentTarget.style.color="#e2e8f0"}
          >{icons.trash(depth>0?11:13)}</button>
        </div>
        {/* Render children recursively */}
        {!isCollapsedItem && children.map(child=>renderItem(child, depth+1))}
      </div>
    );
  };

  // Count all descendants for phase (recursive)
  const countPhaseItems = (phase) => {
    const roots = rootItems.filter(i=>i.phase===phase);
    const allIds = roots.flatMap(r=>[r.id, ...getDescendantIds(r.id, items)]);
    return items.filter(i=>allIds.includes(i.id));
  };

  if (loading) return <Spinner />;
  return (
    <div>
      {/* Progress bar */}
      <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:14, padding:"18px 22px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontSize:13.5, fontWeight:600, color:"#334155" }}>{tr.progress}</span>
          <span style={{ fontSize:13, fontFamily:"'DM Mono',monospace", color:"#2563eb", fontWeight:700 }}>{done} {tr.of} {items.length} — {pct}%</span>
        </div>
        <div style={{ height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#0ea5e9,#2563eb)", borderRadius:4, transition:"width 0.5s ease" }} />
        </div>
      </div>

      {rootItems.length===0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>{tr.noStepsYet}</div>}

      {phases.map(phase=>{
        const allPhaseItems = countPhaseItems(phase);
        const phaseDone = allPhaseItems.filter(i=>i.done).length;
        const col = PHASE_COLORS[phase]||{ bg:"#f1f5f9", border:"#e2e8f0", dot:"#94a3b8" };
        const isCollapsed = collapsed[phase];

        return (
          <div key={phase} style={{ marginBottom:14, border:`1.5px solid ${col.border}`, borderRadius:12, overflow:"hidden", background:"#fff", position:"relative" }}>
            {/* Phase header */}
            <div onClick={()=>setCollapsed(c=>({ ...c,[phase]:!c[phase] }))} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:col.bg, cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:col.dot }} />
                <span style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>{phase}</span>
                <span style={{ fontSize:12, color:col.dot, fontFamily:"'DM Mono',monospace", background:"#fff", padding:"1px 8px", borderRadius:20, border:`1px solid ${col.border}` }}>{phaseDone}/{allPhaseItems.length}</span>
              </div>
              <span style={{ color:"#94a3b8", transform:isCollapsed?"rotate(-90deg)":"none", transition:"0.2s" }}>{icons.chevron(16)}</span>
            </div>

            {!isCollapsed && (
              <>
                {rootItems.filter(i=>i.phase===phase).map(it=>renderItem(it, 0))}
                <div style={{ padding:"8px 16px", borderTop:`1px solid ${col.border}22` }}>
                  <button onClick={()=>openAddStep(null, phase)}
                    style={{ display:"inline-flex", alignItems:"center", gap:5, background:"transparent", border:"none", color:col.dot, cursor:"pointer", fontSize:12.5, fontWeight:600, padding:"4px 0" }}>
                    {icons.plus(12)} {tr.addStep}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      <BtnAdd onClick={()=>openAddStep(null, "")}>{tr.addStep}</BtnAdd>

      {modal && (
        <Modal title={form.parent_id ? tr.addSubStep : tr.addActivationStep} onClose={()=>setModal(false)}>
          {!form.parent_id && (
            <Field label={tr.phase}>
              <select style={sel} value={form.phase} onChange={e=>setForm({ ...form, phase:e.target.value })}>
                <option value="">{tr.enterPhase}</option>
                {pillars.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
                <option value={tr.customPhase}>{tr.customPhase}</option>
              </select>
            </Field>
          )}
          {form.parent_id && (
            <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:12.5, color:"#2563eb" }}>
              📎 {tr.parentStep}: <strong>{getLabel(items.find(i=>i.id===form.parent_id))}</strong>
            </div>
          )}
          <Field label={`${tr.stepDescription} (ES)`}><input style={inp} autoFocus placeholder={tr.enterStep} value={form.item_es} onChange={e=>setForm({ ...form, item_es:e.target.value })} /></Field>
          <Field label={`${tr.stepDescription} (EN)`}><input style={inp} placeholder={tr.enterStep} value={form.item_en} onChange={e=>setForm({ ...form, item_en:e.target.value })} /></Field>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <BtnGhost onClick={()=>setModal(false)}>{tr.cancel}</BtnGhost>
            <BtnPrimary onClick={addItem}>{tr.save}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
const emptyTask = { title_es:"", title_en:"", priority:"Media", status:"Pendiente", due:"", owner:"" };
function TasksSection({ clientId, lang, tr }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(async () => {
    const { data } = await supabase.from("client_tasks").select("*").eq("client_id",clientId).order("created_at");
    setTasks(data||[]); setLoading(false);
  },[clientId]);
  useEffect(()=>{ load(); },[load]);

  const saveTask = async () => {
    if (!form.title_es.trim()) return;
    if (editing) { await supabase.from("client_tasks").update({ ...form }).eq("id",editing); setTasks(prev=>prev.map(t=>t.id===editing?{ ...t,...form }:t)); }
    else { const { data } = await supabase.from("client_tasks").insert({ ...form, client_id:clientId }).select().single(); if (data) setTasks(prev=>[...prev,data]); }
    setModal(false);
  };
  const del = async (id) => { await supabase.from("client_tasks").delete().eq("id",id); setTasks(prev=>prev.filter(t=>t.id!==id)); };

  const statusKeys = ["all","Pendiente","En progreso","Completado","Bloqueado"];
  const statusLabel = (s) => { if(s==="all") return tr.all; return { "Pendiente":tr.pending,"En progreso":tr.inProgress,"Completado":tr.done,"Bloqueado":tr.blocked }[s]||s; };
  const getTitle = (t) => lang==="en"?(t.title_en||t.title_es):t.title_es;
  const getPriLabel = (p) => lang==="en"?({ Alta:"High",Media:"Medium",Baja:"Low" }[p]||p):p;
  const getStLabel = (s) => lang==="en"?({ "Pendiente":"Pending","En progreso":"In Progress","Completado":"Completed","Bloqueado":"Blocked" }[s]||s):s;
  const filtered = filterStatus==="all"?tasks:tasks.filter(t=>t.status===filterStatus);

  if (loading) return <Spinner />;
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {statusKeys.slice(1).map(s=>{
          const count=tasks.filter(t=>t.status===s).length; const col=STATUS_COLORS[s]||{};
          return <div key={s} onClick={()=>setFilterStatus(s===filterStatus?"all":s)} style={{ background:"#fff", border:`1.5px solid ${filterStatus===s?col.border:"#e2e8f0"}`, borderRadius:12, padding:"14px 16px", cursor:"pointer" }}><div style={{ fontSize:22, fontWeight:800, color:col.text, fontFamily:"'DM Mono',monospace" }}>{count}</div><div style={{ fontSize:12, color:"#94a3b8", fontWeight:600, marginTop:2 }}>{statusLabel(s)}</div></div>;
        })}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {statusKeys.map(s=><button key={s} onClick={()=>setFilterStatus(s)} style={{ padding:"5px 14px", borderRadius:20, border:"1.5px solid", borderColor:filterStatus===s?"#2563eb":"#e2e8f0", background:filterStatus===s?"#eff6ff":"#fff", color:filterStatus===s?"#2563eb":"#64748b", cursor:"pointer", fontSize:12.5, fontWeight:600 }}>{statusLabel(s)}</button>)}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>{tr.noItems}</div>}
        {filtered.map(task=>{
          const pc=PRIORITY_COLORS[task.priority]||{}; const sc=STATUS_COLORS[task.status]||{};
          return (
            <div key={task.id} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:14 }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.07)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
            >
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14.5, color:"#1e293b", marginBottom:8 }}>{getTitle(task)}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                  <Badge label={getPriLabel(task.priority)} style={{ background:pc.bg, color:pc.text, border:`1px solid ${pc.border}` }} />
                  <Badge label={getStLabel(task.status)} style={{ background:sc.bg, color:sc.text, border:`1px solid ${sc.border}` }} />
                  {task.due && <span style={{ display:"flex", alignItems:"center", gap:4, color:"#94a3b8", fontSize:12 }}>{icons.calendar(12)} {task.due}</span>}
                  {task.owner && <span style={{ display:"flex", alignItems:"center", gap:4, color:"#94a3b8", fontSize:12 }}>{icons.user(12)} {task.owner}</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                <button onClick={()=>{ setEditing(task.id); setForm({ ...task }); setModal(true); }} style={{ background:"#eff6ff", border:"none", borderRadius:7, color:"#2563eb", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.edit(14)}</button>
                <button onClick={()=>del(task.id)} style={{ background:"#fff0f0", border:"none", borderRadius:7, color:"#ef4444", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.trash(14)}</button>
              </div>
            </div>
          );
        })}
      </div>
      <BtnAdd onClick={()=>{ setEditing(null); setForm(emptyTask); setModal(true); }}>{tr.addTask}</BtnAdd>
      {modal && (
        <Modal title={editing?tr.editTask:tr.newTask} onClose={()=>setModal(false)}>
          <Field label={`${tr.title} (ES)`}><input style={inp} placeholder={tr.taskTitle} value={form.title_es} onChange={e=>setForm({ ...form, title_es:e.target.value })} /></Field>
          <Field label={`${tr.title} (EN)`}><input style={inp} placeholder={tr.taskTitle} value={form.title_en} onChange={e=>setForm({ ...form, title_en:e.target.value })} /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label={tr.priority}><select style={sel} value={form.priority} onChange={e=>setForm({ ...form, priority:e.target.value })}>{["Alta","Media","Baja"].map(p=><option key={p}>{p}</option>)}</select></Field>
            <Field label={tr.status}><select style={sel} value={form.status} onChange={e=>setForm({ ...form, status:e.target.value })}>{["Pendiente","En progreso","Completado","Bloqueado"].map(s=><option key={s}>{s}</option>)}</select></Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label={tr.dueDate}><input type="date" style={inp} value={form.due||""} onChange={e=>setForm({ ...form, due:e.target.value })} /></Field>
            <Field label={tr.owner}><input style={inp} placeholder={tr.enterOwner} value={form.owner||""} onChange={e=>setForm({ ...form, owner:e.target.value })} /></Field>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}><BtnGhost onClick={()=>setModal(false)}>{tr.cancel}</BtnGhost><BtnPrimary onClick={saveTask}>{tr.save}</BtnPrimary></div>
        </Modal>
      )}
    </div>
  );
}

// ── RESOURCES ─────────────────────────────────────────────────────────────────
const emptyDoc = { title:"", url:"", category:"", type:"url", notes:"" };
function ResourcesSection({ clientId, lang, tr }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyDoc);
  const [editing, setEditing] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.from("client_resources").select("*").eq("client_id",clientId).order("created_at");
    setDocs(data||[]); setLoading(false);
  },[clientId]);
  useEffect(()=>{ load(); },[load]);

  const saveDoc = async () => {
    if (!form.title.trim()||!form.url.trim()) return;
    if (editing) { await supabase.from("client_resources").update({ ...form }).eq("id",editing); setDocs(prev=>prev.map(d=>d.id===editing?{ ...d,...form }:d)); }
    else { const { data } = await supabase.from("client_resources").insert({ ...form, client_id:clientId }).select().single(); if (data) setDocs(prev=>[...prev,data]); }
    setModal(false);
  };
  const del = async (id) => { await supabase.from("client_resources").delete().eq("id",id); setDocs(prev=>prev.filter(d=>d.id!==id)); };

  const cats = [...new Set(docs.map(d=>d.category).filter(Boolean))];
  let filtered = filterCat==="all"?docs:docs.filter(d=>d.category===filterCat);
  if (search.trim()) filtered=filtered.filter(d=>d.title.toLowerCase().includes(search.toLowerCase())||d.url.toLowerCase().includes(search.toLowerCase()));
  const grouped = filtered.reduce((acc,d)=>{ const cat=d.category||tr.otherCategory; if(!acc[cat]) acc[cat]=[]; acc[cat].push(d); return acc; },{});

  if (loading) return <Spinner />;
  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:"1 1 200px" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}>{icons.search(15)}</span>
          <input style={{ ...inp, paddingLeft:34 }} placeholder={tr.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {["all",...cats].map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{ padding:"5px 14px", borderRadius:20, border:"1.5px solid", borderColor:filterCat===c?"#2563eb":"#e2e8f0", background:filterCat===c?"#eff6ff":"#fff", color:filterCat===c?"#2563eb":"#64748b", cursor:"pointer", fontSize:12.5, fontWeight:600 }}>{c==="all"?tr.all:c}</button>)}
        </div>
      </div>
      {Object.entries(grouped).map(([cat,items])=>(
        <div key={cat} style={{ marginBottom:22 }}>
          <div style={{ fontSize:11.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ flex:1, height:1, background:"#f1f5f9" }}/>{cat}<div style={{ flex:1, height:1, background:"#f1f5f9" }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
            {items.map(d=>(
              <div key={d.id} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"14px 16px", position:"relative" }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.07)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
              >
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:d.type==="screenshot"?"#f3eeff":"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", color:d.type==="screenshot"?"#7c3aed":"#2563eb", flexShrink:0 }}>
                    {d.type==="screenshot"?icons.image(16):icons.link(16)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13.5, color:"#1e293b", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.title}</div>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, color:"#2563eb", fontSize:12, textDecoration:"none", fontFamily:"'DM Mono',monospace" }}>
                      {icons.external(11)} {d.url.length>38?d.url.slice(0,38)+"…":d.url}
                    </a>
                    {d.notes && <div style={{ color:"#94a3b8", fontSize:12, marginTop:4 }}>{d.notes}</div>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:4, position:"absolute", top:10, right:10 }}>
                  <button onClick={()=>{ setEditing(d.id); setForm({ ...d }); setModal(true); }} style={{ background:"#f1f5f9", border:"none", borderRadius:6, color:"#2563eb", cursor:"pointer", padding:"4px 6px", lineHeight:0 }}>{icons.edit(13)}</button>
                  <button onClick={()=>del(d.id)} style={{ background:"#fff0f0", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", padding:"4px 6px", lineHeight:0 }}>{icons.trash(13)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {Object.keys(grouped).length===0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>{tr.noResults}</div>}
      <BtnAdd onClick={()=>{ setEditing(null); setForm(emptyDoc); setModal(true); }}>{tr.addResource}</BtnAdd>
      {modal && (
        <Modal title={editing?tr.editResource:tr.newResource} onClose={()=>setModal(false)}>
          <Field label={tr.title}><input style={inp} placeholder={tr.resourceTitle} value={form.title} onChange={e=>setForm({ ...form, title:e.target.value })} /></Field>
          <Field label={tr.url}><input style={inp} placeholder={tr.enterUrl} value={form.url} onChange={e=>setForm({ ...form, url:e.target.value })} /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label={tr.category}><input style={inp} placeholder={tr.enterCategory} value={form.category} onChange={e=>setForm({ ...form, category:e.target.value })} /></Field>
            <Field label={tr.type}><select style={sel} value={form.type} onChange={e=>setForm({ ...form, type:e.target.value })}><option value="url">{tr.urlType}</option><option value="screenshot">{tr.screenshotType}</option></select></Field>
          </div>
          <Field label={tr.notes}><input style={inp} placeholder={tr.optionalNotes} value={form.notes} onChange={e=>setForm({ ...form, notes:e.target.value })} /></Field>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}><BtnGhost onClick={()=>setModal(false)}>{tr.cancel}</BtnGhost><BtnPrimary onClick={saveDoc}>{tr.save}</BtnPrimary></div>
        </Modal>
      )}
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function OverviewSection({ clientId, lang, tr }) {
  const [counts, setCounts] = useState({ checklist:0, done:0, tasks:0, tasksDone:0, resources:0, phases:[] });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const load = async () => {
      const [{ data:cl },{ data:tk },{ data:rs },{ data:sr }] = await Promise.all([
        supabase.from("client_checklist").select("phase,done").eq("client_id",clientId),
        supabase.from("client_tasks").select("status").eq("client_id",clientId),
        supabase.from("client_resources").select("id").eq("client_id",clientId),
        supabase.from("client_service_requests").select("id,status").eq("client_id",clientId),
      ]);
      const checklist=cl||[]; const tasks=tk||[]; const srs=sr||[];
      const phases=[...new Set(checklist.map(i=>i.phase))].map(phase=>({ phase, total:checklist.filter(i=>i.phase===phase).length, done:checklist.filter(i=>i.phase===phase&&i.done).length }));
      setCounts({ checklist:checklist.length, done:checklist.filter(i=>i.done).length, tasks:tasks.length, tasksDone:tasks.filter(t=>t.status==="Completado").length, resources:(rs||[]).length, srsTotal:srs.length, srsOpen:srs.filter(s=>s.status==="Abierto"||s.status==="En progreso").length, phases });
      setLoading(false);
    };
    load();
  },[clientId]);

  if (loading) return <Spinner />;
  const pct = counts.checklist ? Math.round((counts.done/counts.checklist)*100) : 0;

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Checklist", val:`${counts.done}/${counts.checklist}`, sub:`${pct}%`, color:"#2196f3" },
          { label:tr.tasks, val:`${counts.tasksDone}/${counts.tasks}`, sub:tr.done, color:"#22a861" },
          { label:tr.resources, val:counts.resources, sub:"links", color:"#7c3aed" },
          { label:"SRs ServiceNow", val:counts.srsTotal||0, sub:`${counts.srsOpen||0} abiertos`, color:(counts.srsOpen||0)>0?"#f59e0b":"#22a861" },
        ].map(({ label,val,sub,color })=>(
          <div key={label} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:14, padding:"20px 22px" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:28, fontWeight:800, color, fontFamily:"'DM Mono',monospace", lineHeight:1 }}>{val}</div>
            <div style={{ fontSize:12.5, color:"#94a3b8", marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:14, padding:"22px 24px", marginBottom:22 }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:"#1e293b", marginBottom:18, textAlign:"center" }}>{tr.pillarsTitle}</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
          {PILLAR_DEFS.map(({ key,keyS,color,border,icon })=>(
            <div key={key} style={{ background:color, border:`1.5px solid ${border}`, borderRadius:12, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:26 }}>{icon}</span>
              <div><div style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>{tr[key]}</div><div style={{ fontSize:12.5, color:"#64748b", marginTop:2 }}>{tr[keyS]}</div></div>
            </div>
          ))}
        </div>
      </div>
      {counts.phases.length>0 && (
        <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:14, padding:"22px 24px" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:"#1e293b", marginBottom:16 }}>{tr.checklistByPhase}</h3>
          {counts.phases.map(({ phase,total,done })=>{
            const phPct=total?Math.round((done/total)*100):0; const col=PHASE_COLORS[phase]||{ dot:"#94a3b8" };
            return (
              <div key={phase} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ width:8, height:8, borderRadius:"50%", background:col.dot }}/><span style={{ fontSize:13.5, fontWeight:600, color:"#334155" }}>{phase}</span></div>
                  <span style={{ fontSize:12, color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{done}/{total}</span>
                </div>
                <div style={{ height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${phPct}%`, background:col.dot, borderRadius:3, transition:"width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SERVICE REQUESTS SECTION ──────────────────────────────────────────────────
const emptySR = { sr_number:"", title:"", priority:"Media", status:"Abierto", notes:"" };
function ServiceRequestsSection({ clientId, lang, tr }) {
  const [srs, setSrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptySR);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("client_service_requests").select("*").eq("client_id", clientId).order("created_at");
    setSrs(data||[]); setLoading(false);
  }, [clientId]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.sr_number?.trim()) return;
    if (editing) { await supabase.from("client_service_requests").update({ ...form }).eq("id", editing); setSrs(prev => prev.map(s => s.id===editing ? { ...s,...form } : s)); }
    else { const { data } = await supabase.from("client_service_requests").insert({ ...form, client_id:clientId }).select().single(); if(data) setSrs(prev => [...prev, data]); }
    setModal(false);
  };
  const del = async (id) => { await supabase.from("client_service_requests").delete().eq("id", id); setSrs(prev => prev.filter(s => s.id!==id)); };

  const SR_STATUS_ES = ["Abierto","En progreso","Resuelto","Cerrado"];
  const SR_STATUS_EN = ["Open","In Progress","Resolved","Closed"];
  const SR_PRIORITY_ES = ["Alta","Media","Baja"];
  const SR_PRIORITY_EN = ["High","Medium","Low"];
  // Always store in Spanish internally, display translated
  const SR_STATUS = SR_STATUS_ES;
  const SR_PRIORITY = SR_PRIORITY_ES;
  const SR_DISPLAY_STATUS = lang==="en" ? SR_STATUS_EN : SR_STATUS_ES;
  const SR_DISPLAY_PRIORITY = lang==="en" ? SR_PRIORITY_EN : SR_PRIORITY_ES;
  const statusColor = { "Abierto":{ bg:"#fffbeb",text:"#f59e0b",border:"#fde68a" }, "En progreso":{ bg:"#eff6ff",text:"#2563eb",border:"#bfdbfe" }, "Resuelto":{ bg:"#f0fdf4",text:"#16a34a",border:"#86efac" }, "Cerrado":{ bg:"#f1f5f9",text:"#64748b",border:"#e2e8f0" } };
  const priColor = { "Alta":{ bg:"#fff0f0",text:"#ef4444",border:"#fecaca" }, "Media":{ bg:"#fffbeb",text:"#f59e0b",border:"#fde68a" }, "Baja":{ bg:"#f0fdf4",text:"#16a34a",border:"#86efac" } };
  const openCount = srs.filter(s=>s.status==="Abierto"||s.status==="En progreso").length;
  const displayStatus = (s) => { const idx=SR_STATUS_ES.indexOf(s); return idx>=0?SR_DISPLAY_STATUS[idx]:s; };
  const displayPriority = (p) => { const idx=SR_PRIORITY_ES.indexOf(p); return idx>=0?SR_DISPLAY_PRIORITY[idx]:p; };

  if (loading) return <Spinner />;
  return (
    <div>
      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Total SRs", val:srs.length, color:"#2563eb" },
          { label:lang==="en"?"Open":"Abiertos", val:srs.filter(s=>s.status==="Abierto").length, color:"#f59e0b" },
          { label:lang==="en"?"In Progress":"En progreso", val:srs.filter(s=>s.status==="En progreso").length, color:"#2563eb" },
          { label:lang==="en"?"Resolved/Closed":"Resueltos/Cerrados", val:srs.filter(s=>s.status==="Resuelto"||s.status==="Cerrado").length, color:"#16a34a" },
        ].map(b=>(
          <div key={b.label} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:22, fontWeight:800, color:b.color, fontFamily:"'DM Mono',monospace" }}>{b.val}</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{b.label}</div>
          </div>
        ))}
      </div>
      {openCount > 0 && <div style={{ background:"#fffbeb", border:"1.5px solid #fde68a", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#92400e", display:"flex", alignItems:"center", gap:8 }}>⚠️ <strong>{openCount}</strong> SR(s) {lang==="en"?"pending resolution":tr.srPending}</div>}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {srs.length===0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>{lang==="en"?"No SRs registered. Add the first one.":"No hay SRs registrados. Agrega el primero."}</div>}
        {srs.map(sr=>{
          const sc = statusColor[sr.status]||statusColor["Abierto"];
          const pc = priColor[sr.priority]||priColor["Media"];
          return (
            <div key={sr.id} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:14 }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.07)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
            >
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, color:"#2563eb" }}>{sr.sr_number}</span>
                  <span style={{ fontSize:14, fontWeight:600, color:"#1e293b" }}>{sr.title}</span>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Badge label={displayPriority(sr.priority)} style={{ background:pc.bg, color:pc.text, border:`1px solid ${pc.border}` }} />
                  <Badge label={displayStatus(sr.status)} style={{ background:sc.bg, color:sc.text, border:`1px solid ${sc.border}` }} />
                  {sr.notes && <span style={{ fontSize:12, color:"#94a3b8" }}>{sr.notes}</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                <button onClick={()=>{ setEditing(sr.id); setForm({ ...sr }); setModal(true); }} style={{ background:"#eff6ff", border:"none", borderRadius:7, color:"#2563eb", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.edit(14)}</button>
                <button onClick={()=>del(sr.id)} style={{ background:"#fff0f0", border:"none", borderRadius:7, color:"#ef4444", cursor:"pointer", padding:"6px 8px", lineHeight:0 }}>{icons.trash(14)}</button>
              </div>
            </div>
          );
        })}
      </div>
      <BtnAdd onClick={()=>{ setEditing(null); setForm(emptySR); setModal(true); }}>{tr.addSR}</BtnAdd>
      {modal && (
        <Modal title={editing?tr.editSR:tr.newSR} onClose={()=>setModal(false)}>
          <Field label={tr.srNumber}><input style={inp} placeholder="ej. REQ0012345" value={form.sr_number} onChange={e=>setForm({ ...form, sr_number:e.target.value })} /></Field>
          <Field label={tr.srTitle}><input style={inp} placeholder="ej. Activación de Joule en tenant BTP" value={form.title} onChange={e=>setForm({ ...form, title:e.target.value })} /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label={tr.priority}><select style={sel} value={form.priority} onChange={e=>setForm({ ...form, priority:e.target.value })}>{SR_PRIORITY.map((p,i)=><option key={p} value={p}>{SR_DISPLAY_PRIORITY[i]}</option>)}</select></Field>
            <Field label={tr.status}><select style={sel} value={form.status} onChange={e=>setForm({ ...form, status:e.target.value })}>{SR_STATUS.map((s,i)=><option key={s} value={s}>{SR_DISPLAY_STATUS[i]}</option>)}</select></Field>
          </div>
          <Field label={tr.srNotes}><input style={inp} placeholder={lang==="en"?"Additional notes":"Observaciones adicionales"} value={form.notes||""} onChange={e=>setForm({ ...form, notes:e.target.value })} /></Field>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}><BtnGhost onClick={()=>setModal(false)}>{tr.cancel}</BtnGhost><BtnPrimary onClick={save}>{tr.save}</BtnPrimary></div>
        </Modal>
      )}
    </div>
  );
}

// ── REPORT BUTTON (single client) ─────────────────────────────────────────────
function ReportButton({ client, consultants, lang, tr }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const [{ data:checklist },{ data:tasks },{ data:resources },{ data:serviceRequests }] = await Promise.all([
        supabase.from("client_checklist").select("*").eq("client_id", client.id).order("sort_order").order("created_at"),
        supabase.from("client_tasks").select("*").eq("client_id", client.id).order("created_at"),
        supabase.from("client_resources").select("*").eq("client_id", client.id).order("created_at"),
        supabase.from("client_service_requests").select("*").eq("client_id", client.id).order("created_at"),
      ]);
      const doc = await generateClientPDF({ client, consultants, checklist:checklist||[], tasks:tasks||[], resources:resources||[], serviceRequests:serviceRequests||[], lang });
      doc.save(`${client.slug || client.name.toLowerCase().replace(/\s+/g,"-")}-report.pdf`);
    } catch(e) { alert("Error generando PDF: " + e.message); }
    setLoading(false);
  };

  return (
    <button onClick={generate} disabled={loading} style={{ display:"inline-flex", alignItems:"center", gap:6, background:loading?"#f1f5f9":"#eff6ff", border:"1.5px solid #bfdbfe", borderRadius:8, padding:"6px 14px", cursor:loading?"not-allowed":"pointer", fontSize:12.5, fontWeight:700, color:"#2563eb", transition:"all 0.2s" }}>
      📄 {loading ? "Generando..." : (lang==="en"?"PDF Report":"Reporte PDF")}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────
const TABS = ["overview","checklist","tasks","resources","srs"];
const TAB_LABELS = { es:{ overview:"Resumen",checklist:"Checklist",tasks:"Tareas",resources:"Recursos",srs:"SRs ServiceNow" }, en:{ overview:"Overview",checklist:"Checklist",tasks:"Tasks",resources:"Resources",srs:"SRs ServiceNow" } };
const TAB_ICONS = { overview:"📊",checklist:"✅",tasks:"📋",resources:"🔗",srs:"🎫" };

function DashboardView({ client, profile, tr, lang, setLang, onBack }) {
  const [tab, setTab] = useState("overview");
  const [consultants, setConsultants] = useState([]);

  useEffect(() => {
    supabase.from("client_assignments").select("*, profiles(name,email)").eq("client_id", client.id).eq("active", true).then(({ data }) => setConsultants(data||[]));
  }, [client.id]);

  const tabStyle = (key) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:13.5, fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s", background:tab===key?"linear-gradient(135deg,#0ea5e9,#2563eb)":"transparent", color:tab===key?"#fff":"#64748b", boxShadow:tab===key?"0 2px 8px rgba(37,99,235,0.3)":"none" });
  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8" }}>
      <div style={{ background:"#fff", borderBottom:"1.5px solid #e2e8f0", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0 10px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={onBack} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:"6px 10px", cursor:"pointer", color:"#64748b", lineHeight:0 }}>{icons.back(16)}</button>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0ea5e9,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
              <div><div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{client.name}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{tr.appSubtitle}</div></div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <ReportButton client={client} consultants={consultants} lang={lang} tr={tr} />
              <div style={{ display:"flex", background:"#f1f5f9", borderRadius:8, padding:3, gap:2 }}>
                {["es","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{ padding:"4px 10px", borderRadius:6, border:"none", cursor:"pointer", fontWeight:700, fontSize:12, background:lang===l?"#fff":"transparent", color:lang===l?"#2563eb":"#94a3b8" }}>{l.toUpperCase()}</button>)}
              </div>
              <span style={{ fontSize:12, color:"#64748b", display:"flex", alignItems:"center", gap:5 }}>{icons.user(13)} {profile.name}</span>
              <button onClick={()=>supabase.auth.signOut()} style={{ background:"#fff0f0", border:"1.5px solid #fecaca", borderRadius:8, padding:"6px 10px", cursor:"pointer", color:"#ef4444", lineHeight:0 }}>{icons.logout(16)}</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:4, paddingBottom:10 }}>
            {TABS.map(key=><button key={key} onClick={()=>setTab(key)} style={tabStyle(key)}><span>{TAB_ICONS[key]}</span> {TAB_LABELS[lang][key]}</button>)}
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"28px 20px" }}>
        {tab==="overview"  && <OverviewSection  clientId={client.id} lang={lang} tr={tr} />}
        {tab==="checklist" && <ChecklistSection clientId={client.id} lang={lang} tr={tr} />}
        {tab==="tasks"     && <TasksSection     clientId={client.id} lang={lang} tr={tr} />}
        {tab==="resources" && <ResourcesSection clientId={client.id} lang={lang} tr={tr} />}
        {tab==="srs"       && <ServiceRequestsSection clientId={client.id} lang={lang} tr={tr} />}
      </div>
      <div style={{ textAlign:"center", padding:"24px 0 32px", color:"#cbd5e1", fontSize:12 }}>Joule × Ariba {tr.footerText} · {new Date().getFullYear()}</div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lang, setLang] = useState(()=>{ try { return localStorage.getItem("joule_lang")||"es"; } catch { return "es"; } });
  const [selectedClient, setSelectedClient] = useState(null);
  const tr = t[lang];
  const saveLang = (l) => { setLang(l); try { localStorage.setItem("joule_lang",l); } catch {} };

  useEffect(()=>{
    supabase.auth.getSession().then(({ data:{ session } })=>{ setSession(session); if(session) loadProfile(session.user.id); else setAuthLoading(false); });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_,session)=>{ setSession(session); if(session) loadProfile(session.user.id); else { setProfile(null); setAuthLoading(false); setSelectedClient(null); } });
    return ()=>subscription.unsubscribe();
  },[]);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id",uid).single();
    setProfile(data); setAuthLoading(false);
  };

  if (authLoading) return <div style={{ minHeight:"100vh", background:"#f0f4f8", display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner /></div>;
  if (!session) return <LoginView tr={tr} />;
  if (!profile) return <Spinner />;
  if (selectedClient==="__admin__") return <AdminPanel profile={profile} tr={tr} onBack={()=>setSelectedClient(null)} />;
  if (selectedClient) return <DashboardView client={selectedClient} profile={profile} tr={tr} lang={lang} setLang={saveLang} onBack={()=>setSelectedClient(null)} />;
  return <ClientListView profile={profile} tr={tr} lang={lang} setLang={saveLang} onSelectClient={setSelectedClient} />;
}
