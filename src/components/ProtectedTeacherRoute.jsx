import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function ProtectedTeacherRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifyTeacher() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (active) {
            setAllowed(false);
            setLoading(false);
          }
          return;
        }

        const {
          data: teacherProfile,
          error: profileError,
        } = await supabase
          .from("teacher_profiles")
          .select("id, auth_user_id, teacher_name, role")
          .eq("auth_user_id", user.id)
          .eq("role", "teacher")
          .maybeSingle();

        if (
          profileError ||
          !teacherProfile
        ) {
          await supabase.auth.signOut();

          localStorage.removeItem(
            "teacherProfile"
          );

          if (active) {
            setAllowed(false);
            setLoading(false);
          }

          return;
        }

        localStorage.setItem(
          "teacherProfile",
          JSON.stringify(teacherProfile)
        );

        if (active) {
          setAllowed(true);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Teacher verification error:",
          error
        );

        if (active) {
          setAllowed(false);
          setLoading(false);
        }
      }
    }

    verifyTeacher();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "40px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Verifying teacher access...</h2>

          <p>
            Please wait while your account is
            securely verified.
          </p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <Navigate
        to="/teacher-login"
        replace
      />
    );
  }

  return children;
}

export default ProtectedTeacherRoute;