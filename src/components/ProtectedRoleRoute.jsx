import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function ProtectedRoleRoute({ roles, children, redirectTo = "/login" }) {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    let active = true;

    async function verify() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (active) setState({ loading: false, allowed: false });
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, is_active")
        .eq("id", user.id)
        .maybeSingle();

      const allowed = !error && profile?.is_active && roles.includes(profile.role);
      if (active) setState({ loading: false, allowed });
    }

    verify();
    return () => { active = false; };
  }, [roles]);

  if (state.loading) {
    return <main className="route-loading"><h2>Verifying secure access...</h2></main>;
  }

  return state.allowed ? children : <Navigate to={redirectTo} replace />;
}
