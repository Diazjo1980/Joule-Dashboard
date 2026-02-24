export const DEFAULT_CHECKLIST = [
  // Pre-requisitos
  { id: 1, phase: "Pre-requisitos", phaseKey: "prereq", item_es: "Verificar versión SAP BTP y entitlements de Joule", item_en: "Verify SAP BTP version and Joule entitlements", done: false },
  { id: 2, phase: "Pre-requisitos", phaseKey: "prereq", item_es: "Confirmar licenciamiento SAP Ariba (Buying/Sourcing)", item_en: "Confirm SAP Ariba licensing (Buying/Sourcing)", done: false },
  { id: 3, phase: "Pre-requisitos", phaseKey: "prereq", item_es: "Crear subaccount en BTP Cloud Foundry", item_en: "Create subaccount in BTP Cloud Foundry", done: false },
  { id: 4, phase: "Pre-requisitos", phaseKey: "prereq", item_es: "Verificar acceso al BTP Cockpit con usuario administrador", item_en: "Verify BTP Cockpit access with admin user", done: false },
  // Configuración BTP
  { id: 5, phase: "Configuración BTP", phaseKey: "btp", item_es: "Habilitar servicio Joule en BTP Cockpit", item_en: "Enable Joule service in BTP Cockpit", done: false },
  { id: 6, phase: "Configuración BTP", phaseKey: "btp", item_es: "Crear instancia de servicio Joule y generar Service Key", item_en: "Create Joule service instance and generate Service Key", done: false },
  { id: 7, phase: "Configuración BTP", phaseKey: "btp", item_es: "Configurar Trust entre BTP y IAS (Identity Authentication)", item_en: "Configure Trust between BTP and IAS (Identity Authentication)", done: false },
  { id: 8, phase: "Configuración BTP", phaseKey: "btp", item_es: "Asignar roles y scopes en BTP a usuarios Joule", item_en: "Assign roles and scopes in BTP to Joule users", done: false },
  // Integración Ariba
  { id: 9, phase: "Integración Ariba", phaseKey: "ariba", item_es: "Registrar Joule como Application en Ariba Administration", item_en: "Register Joule as Application in Ariba Administration", done: false },
  { id: 10, phase: "Integración Ariba", phaseKey: "ariba", item_es: "Configurar SSO / SAML assertion mapping", item_en: "Configure SSO / SAML assertion mapping", done: false },
  { id: 11, phase: "Integración Ariba", phaseKey: "ariba", item_es: "Activar Joule Feature Flag en el Realm de Ariba", item_en: "Enable Joule Feature Flag in Ariba Realm", done: false },
  { id: 12, phase: "Integración Ariba", phaseKey: "ariba", item_es: "Validar configuración de API Key entre Ariba y BTP", item_en: "Validate API Key configuration between Ariba and BTP", done: false },
  // Validación
  { id: 13, phase: "Validación", phaseKey: "validation", item_es: "Test de autenticación end-to-end con usuario de prueba", item_en: "End-to-end authentication test with test user", done: false },
  { id: 14, phase: "Validación", phaseKey: "validation", item_es: "Validar respuestas de Joule en contexto de Ariba", item_en: "Validate Joule responses in Ariba context", done: false },
  { id: 15, phase: "Validación", phaseKey: "validation", item_es: "Pruebas UAT con usuarios clave del negocio", item_en: "UAT testing with key business users", done: false },
];

export const DEFAULT_TASKS = [
  { id: 1, title_es: "Reunión kickoff con equipo BTP", title_en: "BTP team kickoff meeting", priority: "Alta", status: "Pendiente", due: "", owner: "" },
  { id: 2, title_es: "Solicitar accesos BTP Cockpit al admin", title_en: "Request BTP Cockpit access from admin", priority: "Alta", status: "En progreso", due: "", owner: "" },
  { id: 3, title_es: "Documentar mapeo de roles Ariba ↔ Joule", title_en: "Document Ariba ↔ Joule role mapping", priority: "Media", status: "Pendiente", due: "", owner: "" },
  { id: 4, title_es: "Preparar ambiente de pruebas UAT", title_en: "Prepare UAT test environment", priority: "Media", status: "Pendiente", due: "", owner: "" },
];

export const DEFAULT_DOCS = [
  { id: 1, title: "SAP Joule — Official Product Page", url: "https://www.sap.com/products/artificial-intelligence/ai-assistant.html", category: "SAP Official", type: "url", notes: "" },
  { id: 2, title: "Joule for SAP Ariba — Setup Guide", url: "https://help.sap.com/docs/joule", category: "Documentation", type: "url", notes: "BTP configuration guide" },
  { id: 3, title: "SAP BTP Cockpit", url: "https://cockpit.btp.cloud.sap", category: "Tools", type: "url", notes: "" },
  { id: 4, title: "SAP Ariba Administration Portal", url: "https://service.ariba.com", category: "Tools", type: "url", notes: "" },
  { id: 5, title: "SAP Identity Authentication Service", url: "https://help.sap.com/docs/identity-authentication", category: "Documentation", type: "url", notes: "IAS / Trust config" },
];

export const PHASE_COLORS = {
  "Pre-requisitos": { bg: "#e8f4fd", border: "#bbd6f0", icon: "#2196f3", dot: "#2196f3" },
  "prereq":         { bg: "#e8f4fd", border: "#bbd6f0", icon: "#2196f3", dot: "#2196f3" },
  "Configuración BTP": { bg: "#e8f8f0", border: "#b2dfc9", icon: "#22a861", dot: "#22a861" },
  "btp":            { bg: "#e8f8f0", border: "#b2dfc9", icon: "#22a861", dot: "#22a861" },
  "Integración Ariba": { bg: "#f3eeff", border: "#d0baff", icon: "#7c3aed", dot: "#7c3aed" },
  "ariba":          { bg: "#f3eeff", border: "#d0baff", icon: "#7c3aed", dot: "#7c3aed" },
  "Validación":     { bg: "#fff4e8", border: "#ffd4a0", icon: "#f57c00", dot: "#f57c00" },
  "validation":     { bg: "#fff4e8", border: "#ffd4a0", icon: "#f57c00", dot: "#f57c00" },
  // SAP Pillars
  "Discover":       { bg: "#e8f4fd", border: "#bbd6f0", icon: "#2196f3", dot: "#2196f3" },
  "Prepare":        { bg: "#e8f8f0", border: "#b2dfc9", icon: "#22a861", dot: "#22a861" },
  "Explore":        { bg: "#f3eeff", border: "#d0baff", icon: "#7c3aed", dot: "#7c3aed" },
  "Realize":        { bg: "#fff4e8", border: "#ffd4a0", icon: "#f57c00", dot: "#f57c00" },
  "Deploy/Run":     { bg: "#fdf2f8", border: "#f0abdb", icon: "#db2777", dot: "#db2777" },
};

export const PRIORITY_COLORS = {
  Alta:   { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
  Media:  { bg: "#fef9c3", text: "#d97706", border: "#fde68a" },
  Baja:   { bg: "#dcfce7", text: "#16a34a", border: "#86efac" },
  High:   { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
  Medium: { bg: "#fef9c3", text: "#d97706", border: "#fde68a" },
  Low:    { bg: "#dcfce7", text: "#16a34a", border: "#86efac" },
};

export const STATUS_COLORS = {
  "Pendiente":   { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
  "En progreso": { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  "Completado":  { bg: "#dcfce7", text: "#16a34a", border: "#86efac" },
  "Bloqueado":   { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
  "Pending":     { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
  "In Progress": { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  "Completed":   { bg: "#dcfce7", text: "#16a34a", border: "#86efac" },
  "Blocked":     { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
};
