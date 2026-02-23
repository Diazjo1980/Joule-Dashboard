const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://syksdkgtppwipazglpka.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  if (!SERVICE_ROLE_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: "Service role key not configured" }) };

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Verify caller is admin
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid token" }) };

  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { statusCode: 403, headers, body: JSON.stringify({ error: "Admin only" }) };

  const body = JSON.parse(event.body || "{}");
  const { action } = body;

  try {
    // ── CREATE USER ──────────────────────────────────────────────────────────
    if (action === "create_user") {
      const { email, password, name, role } = body;
      if (!email || !password || !name) return { statusCode: 400, headers, body: JSON.stringify({ error: "email, password and name required" }) };

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { name, role: role || "consultant" }
      });
      if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };

      // Profile is auto-created by trigger but update role just in case
      await supabaseAdmin.from("profiles").update({ name, role: role || "consultant" }).eq("id", data.user.id);

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, user: data.user }) };
    }

    // ── UPDATE ROLE ──────────────────────────────────────────────────────────
    if (action === "update_role") {
      const { userId, role } = body;
      if (!userId || !role) return { statusCode: 400, headers, body: JSON.stringify({ error: "userId and role required" }) };

      await supabaseAdmin.from("profiles").update({ role }).eq("id", userId);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ── DELETE USER ──────────────────────────────────────────────────────────
    if (action === "delete_user") {
      const { userId } = body;
      if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: "userId required" }) };
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
