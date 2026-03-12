// ── Joule × Ariba Standard Checklist Template ─────────────────────────────────
// Structure: { phase, item_es, item_en, parent_key, key, sort_order }
// parent_key null = root step; otherwise references key of parent

export const CHECKLIST_TEMPLATE = [
  // ── DISCOVER ─────────────────────────────────────────────────────────────────
  { key:"d1",  phase:"Discover", parent_key:null, sort_order:10, item_es:"El cliente está interesado en Joule y contacta a SAP", item_en:"Customer is interested in Joule and contacts SAP" },
  { key:"d2",  phase:"Discover", parent_key:null, sort_order:20, item_es:"Completar formulario para definir el camino de habilitación de Joule", item_en:"Form Completion to Define the Joule Enablement Journey" },
  { key:"d3",  phase:"Discover", parent_key:null, sort_order:30, item_es:"Sesión de visión general de SAP Joule", item_en:"SAP Joule Overview session" },

  // ── PREPARE ──────────────────────────────────────────────────────────────────
  { key:"pr1", phase:"Prepare", parent_key:null, sort_order:10, item_es:"Sesión SAP Joule Readiness Check", item_en:"SAP Joule Readiness Check session" },
  { key:"pr2", phase:"Prepare", parent_key:null, sort_order:20, item_es:"Completar el Joule Readiness Questionnaire", item_en:"Complete the Joule Readiness Questionnaire" },
  { key:"pr3", phase:"Prepare", parent_key:null, sort_order:30, item_es:"Adquisición de licencia de Joule", item_en:"Joule License Acquisition" },

  // ── EXPLORE ──────────────────────────────────────────────────────────────────
  { key:"ex1", phase:"Explore", parent_key:null, sort_order:10, item_es:"Revisión de arquitectura Joule + Ariba / sesión BTP CIS", item_en:"Review Joule + Ariba architecture / BTP CIS session" },
  { key:"ex2", phase:"Explore", parent_key:null, sort_order:20, item_es:"CIS / Enfoque de implementación Joule - Finalización", item_en:"CIS / Joule implementation Approach - Finalization" },

  // ── REALIZE ──────────────────────────────────────────────────────────────────
  // Group: CIS - IAS/IPS Enablement
  { key:"r_g1",  phase:"Realize", parent_key:null,   sort_order:10, item_es:"CIS - Habilitación IAS / IPS", item_en:"CIS - IAS / IPS Enablement" },
  { key:"r_g1a", phase:"Realize", parent_key:"r_g1", sort_order:11, item_es:"BTP - Entitlement / Sub-account / CIS Tenant / Validaciones (paso 1)", item_en:"BTP - Entitlement / Sub-account / CIS Tenant / Validations" },
  { key:"r_g1b", phase:"Realize", parent_key:"r_g1", sort_order:12, item_es:"BTP - Entitlement / Sub-account / CIS Tenant / Validaciones (paso 2)", item_en:"BTP - Entitlement / Sub-account / CIS Tenant / Validations" },

  // Group: SAP Ariba SSO with CIS enablement
  { key:"r_g2",  phase:"Realize", parent_key:null,   sort_order:20, item_es:"Habilitación de SAP Ariba SSO con SAP Cloud Identity Services (CIS)", item_en:"SAP Ariba SSO with SAP Cloud Identity Services (CIS) enablement" },
  { key:"r_g2a", phase:"Realize", parent_key:"r_g2", sort_order:21, item_es:"Habilitación de feature - PS-1444", item_en:"Feature enablement - PS-1444" },
  { key:"r_g2b", phase:"Realize", parent_key:"r_g2", sort_order:22, item_es:"Depende de si CIP acepta HTTPS o HTTP", item_en:"Depends on whether CIP accepts HTTPS or HTTP." },

  // Group: SAP Ariba SSO with CIS
  { key:"r_g3",  phase:"Realize", parent_key:null,   sort_order:30, item_es:"SAP Ariba SSO con SAP Cloud Identity Services (CIS)", item_en:"SAP Ariba SSO with SAP Cloud Identity Services (CIS)" },
  { key:"r_g3a", phase:"Realize", parent_key:"r_g3", sort_order:31, item_es:"Habilitar IAS como Identity Provider o IDP corporativo con IAS federado", item_en:"Enable IAS as Identity Provider or Corporate IDP with federated IAS" },

  // Group: SAP Ariba SSO Validation
  { key:"r_g4",  phase:"Realize", parent_key:null,   sort_order:40, item_es:"Validación de SAP Ariba SSO", item_en:"SAP Ariba SSO Validation" },
  { key:"r_g4a", phase:"Realize", parent_key:"r_g4", sort_order:41, item_es:"Crear manualmente 1 o 2 usuarios en CIS para pruebas", item_en:"Manually create 1 or 2 users in CIS for Testing purpose" },
  { key:"r_g4b", phase:"Realize", parent_key:"r_g4", sort_order:42, item_es:"Ejecución de pruebas", item_en:"Testing execution" },

  // Group: IPS Enablement for SAP Ariba
  { key:"r_g5",  phase:"Realize", parent_key:null,   sort_order:50, item_es:"Habilitación de IPS (Identity Provisioning Service) para aplicaciones SAP Ariba", item_en:"IPS (Identity Provisioning Service) for SAP Ariba Applications enablement" },
  { key:"r_g5a", phase:"Realize", parent_key:"r_g5", sort_order:51, item_es:"Crear 2 grupos en CIS (ARB__CTRL y ARB__CONTAINS)", item_en:"Create 2 Groups in CIS (ARB__CTRL and ARB__CONTAINS)" },
  { key:"r_g5b", phase:"Realize", parent_key:"r_g5", sort_order:52, item_es:"Configurar/Actualizar el sistema fuente para IPS", item_en:"Configure/Update the Source System for IPS" },
  { key:"r_g5c", phase:"Realize", parent_key:"r_g5", sort_order:53, item_es:"Configurar/Actualizar los sistemas destino para IPS", item_en:"Configure/Update the Target Systems for IPS" },
  { key:"r_g5d", phase:"Realize", parent_key:"r_g5", sort_order:54, item_es:"Sincronizar manualmente 1 o 2 usuarios entre IAS y Ariba", item_en:"Manually sync 1 or 2 users between IAS and Ariba" },

  // Group: IPS from IAS to SAP Build Work Zone
  { key:"r_g6",  phase:"Realize", parent_key:null,   sort_order:60, item_es:"IPS de IAS a SAP Build Work Zone", item_en:"IPS from IAS to SAP Build Work Zone Setting" },
  { key:"r_g6a", phase:"Realize", parent_key:"r_g6", sort_order:61, item_es:"Configurar/Actualizar el sistema fuente para WorkZone", item_en:"Configure/Update the Source System for WorkZone" },
  { key:"r_g6b", phase:"Realize", parent_key:"r_g6", sort_order:62, item_es:"Configurar/Actualizar los sistemas destino para WorkZone", item_en:"Configure/Update the Target Systems for WorkZone" },
  { key:"r_g6c", phase:"Realize", parent_key:"r_g6", sort_order:63, item_es:"Sincronizar manualmente 1 o 2 usuarios a WorkZone", item_en:"Manually sync 1 or 2 users to Workzone" },

  // Group: Full sync
  { key:"r_g7",  phase:"Realize", parent_key:null,   sort_order:70, item_es:"Sincronización completa entre Ariba, CIS y WorkZone", item_en:"Full sync between Ariba, CIS and Workzone" },
  { key:"r_g7a", phase:"Realize", parent_key:"r_g7", sort_order:71, item_es:"Ejecutar el Job de sincronización para usuarios y grupos", item_en:"Run the Sync Job for users and groups" },

  // Group: IAS/IPS Testing
  { key:"r_g8",  phase:"Realize", parent_key:null,   sort_order:80, item_es:"Pruebas y validación de habilitación IAS / IPS", item_en:"IAS / IPS Enablement Testing and Validation" },
  { key:"r_g8a", phase:"Realize", parent_key:"r_g8", sort_order:81, item_es:"Ejecución de pruebas", item_en:"Testing execution" },
  { key:"r_g8b", phase:"Realize", parent_key:"r_g8", sort_order:82, item_es:"Firma de pruebas (sign-off)", item_en:"Testing sign-off" },

  // Group: Joule Integration to SAP Ariba
  { key:"r_g9",  phase:"Realize", parent_key:null,   sort_order:90, item_es:"Integración de Joule con SAP Ariba", item_en:"Joule Integration to SAP Ariba" },

  // Group: Informational and Transactional scenarios
  { key:"r_g10",  phase:"Realize", parent_key:"r_g9", sort_order:91, item_es:"Joule - Escenarios informativos y transaccionales", item_en:"Joule - Informational and Transactional scenarios" },
  { key:"r_g10a", phase:"Realize", parent_key:"r_g10", sort_order:92, item_es:"Credenciales OAuth para CDM API (SAP Ariba Developer Portal)", item_en:"OAuth Credentials for CDM API (SAP Ariba Developer Portal)" },

  // Group: API Access
  { key:"r_g11",  phase:"Realize", parent_key:"r_g9", sort_order:93, item_es:"Requisición de acceso API", item_en:"API Access requisition" },
  { key:"r_g11a", phase:"Realize", parent_key:"r_g11", sort_order:94, item_es:"Requisición de acceso API (Solicitar - Generar - Validar)", item_en:"API Access requisition (Request - Generate - Validate)" },
  { key:"r_g11b", phase:"Realize", parent_key:"r_g11", sort_order:95, item_es:"Realizar antes o en paralelo con el Paso 1 para ahorrar tiempo", item_en:"Perform before or in parallel with Step 1 to save time." },

  // Group: OAuth Configuration
  { key:"r_g12",  phase:"Realize", parent_key:"r_g9", sort_order:96, item_es:"Configuración OAuth", item_en:"OAuth Configuration" },
  { key:"r_g12a", phase:"Realize", parent_key:"r_g12", sort_order:97, item_es:"Generar OAuth Secret", item_en:"Generate OAuth Secret" },

  // Group: Feature enablement
  { key:"r_g13",  phase:"Realize", parent_key:"r_g9", sort_order:98, item_es:"Habilitación de feature", item_en:"Feature enablement" },
  { key:"r_g13a", phase:"Realize", parent_key:"r_g13", sort_order:99, item_es:"Habilitación de feature - PLUI-2928 (obligatorio)", item_en:"Feature enablement - PLUI-2928 (mandatory)" },
  { key:"r_g13b", phase:"Realize", parent_key:"r_g13", sort_order:100, item_es:"TEST: Consultor Técnico SAP / PROD: Caso SAP", item_en:"TEST: SAP Tech Consultant / PROD: SAP Case." },

  // Group: Integrating Joule
  { key:"r_g14",  phase:"Realize", parent_key:"r_g9", sort_order:101, item_es:"Integración de Joule", item_en:"Integrating Joule" },
  { key:"r_g14a", phase:"Realize", parent_key:"r_g14", sort_order:102, item_es:"Escenario 1: Nueva configuración de Joule en SAP Ariba, o", item_en:"Scenario 1: New Joule setup in SAP Ariba or" },
  { key:"r_g14b", phase:"Realize", parent_key:"r_g14", sort_order:103, item_es:"Escenario 2: Joule existente (ej: SuccessFactors, S4) con formation creado", item_en:"Scenario 2: Existing Joule (E.g: SuccessFactor, S4) with formation created" },

  // Group: Post-integration checks
  { key:"r_g15",  phase:"Realize", parent_key:"r_g9", sort_order:104, item_es:"Verificaciones post-integración", item_en:"Post-integration checks" },
  { key:"r_g15a", phase:"Realize", parent_key:"r_g15", sort_order:105, item_es:"Validar lista de aplicaciones", item_en:"Validate Application List" },
  { key:"r_g15b", phase:"Realize", parent_key:"r_g15", sort_order:106, item_es:"Validar atributos (ej. User ID, email, roles, etc.)", item_en:"Validate the Attributes (e.g., User ID, email, roles, etc)" },
  { key:"r_g15c", phase:"Realize", parent_key:"r_g15", sort_order:107, item_es:"Dominios confiables (Trusted Domains)", item_en:"Trusted Domains" },

  // Group: Post-integration validation
  { key:"r_g16",  phase:"Realize", parent_key:"r_g9", sort_order:108, item_es:"Validación post-integración", item_en:"Post-integration validation" },
  { key:"r_g16a", phase:"Realize", parent_key:"r_g16", sort_order:109, item_es:"Validar que Joule es visible en los sistemas SAP Ariba", item_en:"Post-integration validation: Validate the Joule is visible in your SAP Ariba Systems" },

  // Group: Informational and Transactional - Testing
  { key:"r_g17",  phase:"Realize", parent_key:"r_g9", sort_order:110, item_es:"Pruebas de escenarios informativos y transaccionales", item_en:"Informational and Transactional scenarios - Testing" },
  { key:"r_g17a", phase:"Realize", parent_key:"r_g17", sort_order:111, item_es:"Ejecutar pruebas para escenarios informativos y transaccionales", item_en:"Perform testing for Informational and Transactional scenarios" },

  // Group: Navigational scenarios
  { key:"r_g18",  phase:"Realize", parent_key:null,   sort_order:120, item_es:"Escenarios de navegación", item_en:"Navigational scenarios" },

  // Group: Destination Setup
  { key:"r_g19",  phase:"Realize", parent_key:"r_g18", sort_order:121, item_es:"Configuración de Destinations", item_en:"Destination Setup" },
  { key:"r_g19a", phase:"Realize", parent_key:"r_g19", sort_order:122, item_es:"Destinations de SAP Ariba Sourcing", item_en:"SAP Ariba Sourcing Destinations" },
  { key:"r_g19b", phase:"Realize", parent_key:"r_g19", sort_order:123, item_es:"Destinations de SAP Ariba Procurement", item_en:"SAP Ariba Procurement Destinations" },

  // Group: SAP Build Work Zone - Content Provider
  { key:"r_g20",  phase:"Realize", parent_key:"r_g18", sort_order:124, item_es:"SAP Build Work Zone - Content Provider", item_en:"SAP Build Work Zone - Content Provider" },
  { key:"r_g20a", phase:"Realize", parent_key:"r_g20", sort_order:125, item_es:"Content Provider para soluciones SAP Ariba Sourcing", item_en:"Content Provider for SAP Ariba Sourcing Solutions" },
  { key:"r_g20b", phase:"Realize", parent_key:"r_g20", sort_order:126, item_es:"Content Provider para soluciones SAP Ariba Procurement", item_en:"Content Provider for SAP Ariba Procurement Solutions" },

  // Group: Channel Updates
  { key:"r_g21",  phase:"Realize", parent_key:"r_g18", sort_order:127, item_es:"Actualizaciones de canal (Channel Updates)", item_en:"Channel Updates" },

  // Group: Navigational - Testing
  { key:"r_g22",  phase:"Realize", parent_key:"r_g18", sort_order:128, item_es:"Pruebas de escenarios de navegación", item_en:"Navigational scenarios - Testing" },
  { key:"r_g22a", phase:"Realize", parent_key:"r_g22", sort_order:129, item_es:"Ejecutar pruebas para escenarios de navegación", item_en:"Perform testing for Navigational scenarios" },

  // Group: Joule Testing and Validation
  { key:"r_g23",  phase:"Realize", parent_key:null,   sort_order:130, item_es:"Pruebas y validación de Joule", item_en:"Joule Testing and Validation" },
  { key:"r_g23a", phase:"Realize", parent_key:"r_g23", sort_order:131, item_es:"Pruebas funcionales y validación por usuarios finales de Joule", item_en:"Joule End-User Functional Testing & Validation" },
  { key:"r_g23b", phase:"Realize", parent_key:"r_g23", sort_order:132, item_es:"Firma de pruebas (sign-off)", item_en:"Testing sign-off" },

  // ── DEPLOY / RUN ─────────────────────────────────────────────────────────────
  // Group: IAS/IPS Enablement
  { key:"dr_g1",  phase:"Deploy/Run", parent_key:null,    sort_order:10, item_es:"Habilitación IAS / IPS", item_en:"IAS / IPS Enablement" },
  { key:"dr_g1a", phase:"Deploy/Run", parent_key:"dr_g1", sort_order:11, item_es:"Cutover + Smoke Test", item_en:"Cutover + Smoke Test" },
  { key:"dr_g1b", phase:"Deploy/Run", parent_key:"dr_g1", sort_order:12, item_es:"Go Live", item_en:"Go Live" },
  { key:"dr_g1c", phase:"Deploy/Run", parent_key:"dr_g1", sort_order:13, item_es:"Transición a soporte y firma (sign-off)", item_en:"Transition to Support and Sign-off" },

  // Group: Joule Integration to SAP Ariba
  { key:"dr_g2",  phase:"Deploy/Run", parent_key:null,    sort_order:20, item_es:"Integración de Joule con SAP Ariba", item_en:"Joule Integration to SAP Ariba" },
  { key:"dr_g2a", phase:"Deploy/Run", parent_key:"dr_g2", sort_order:21, item_es:"Sesión de preparación para migración a producción", item_en:"Readiness for production migration session" },
  { key:"dr_g2b", phase:"Deploy/Run", parent_key:"dr_g2", sort_order:22, item_es:"Go Live", item_en:"Go Live" },
  { key:"dr_g2c", phase:"Deploy/Run", parent_key:"dr_g2", sort_order:23, item_es:"Transición a soporte y firma (sign-off)", item_en:"Transition to Support and Sign-off" },
];

/**
 * Apply the template to a client.
 * Inserts items that don't already exist (matched by item_en).
 * @param {string} clientId - UUID of the target client
 * @param {object} supabase  - Supabase client instance
 * @returns {number} count of items inserted
 */
export async function applyTemplateToClient(clientId, supabase) {
  // Fetch existing items to avoid duplicates
  const { data: existing } = await supabase
    .from("client_checklist")
    .select("item_en, parent_id")
    .eq("client_id", clientId);

  const existingTexts = new Set((existing || []).map(i => i.item_en?.trim().toLowerCase()));

  // First pass: insert root items and build key→uuid map
  const keyToId = {};

  // Separate roots and children
  const roots    = CHECKLIST_TEMPLATE.filter(t => !t.parent_key);
  const children = CHECKLIST_TEMPLATE.filter(t =>  t.parent_key);

  // Insert roots
  for (const t of roots) {
    if (existingTexts.has(t.item_en.trim().toLowerCase())) {
      // Already exists — find its id
      const existing_row = (existing || []).find(
        i => i.item_en?.trim().toLowerCase() === t.item_en.trim().toLowerCase()
      );
      if (existing_row?.id) keyToId[t.key] = existing_row.id;
      continue;
    }
    const { data } = await supabase.from("client_checklist").insert({
      client_id: clientId,
      phase:     t.phase,
      item_es:   t.item_es,
      item_en:   t.item_en,
      done:      false,
      sort_order: t.sort_order,
      parent_id:  null,
    }).select("id").single();
    if (data?.id) keyToId[t.key] = data.id;
  }

  // Insert children using resolved parent ids
  let inserted = roots.filter(r => !existingTexts.has(r.item_en.trim().toLowerCase())).length;
  for (const t of children) {
    if (existingTexts.has(t.item_en.trim().toLowerCase())) continue;
    const parentId = keyToId[t.parent_key] || null;
    const { data } = await supabase.from("client_checklist").insert({
      client_id:  clientId,
      phase:      t.phase,
      item_es:    t.item_es,
      item_en:    t.item_en,
      done:       false,
      sort_order: t.sort_order,
      parent_id:  parentId,
    }).select("id").single();
    if (data?.id) { keyToId[t.key] = data.id; inserted++; }
  }

  return inserted;
}
