import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function TeacherLogin() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function handleTeacherLogin(event) {
    event.preventDefault();

    setMessage("");

    if (!password.trim()) {
      setMessage("Please enter the teacher password.");
      return;
    }

    setLoggingIn(true);

    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "teacher.wafa@school.local",
        password,
      });

    if (signInError) {
      console.error("Teacher sign in error:", signInError);

      setMessage("Incorrect teacher password.");
      setLoggingIn(false);
      return;
    }

    const userId = authData?.user?.id;

    if (!userId) {
      setMessage("Unable to verify teacher account.");
      setLoggingIn(false);
      return;
    }

    const {
      data: teacherProfile,
      error: profileError,
    } = await supabase
      .from("teacher_profiles")
      .select(`
        id,
        auth_user_id,
        teacher_name,
        role
      `)
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Teacher profile error:",
        profileError
      );

      setMessage(
        `Unable to verify teacher profile: ${profileError.message}`
      );

      setLoggingIn(false);
      return;
    }

    if (
      !teacherProfile ||
      teacherProfile.role !== "teacher"
    ) {
      await supabase.auth.signOut();

      setMessage(
        "This account does not have teacher access."
      );

      setLoggingIn(false);
      return;
    }

    localStorage.setItem(
      "teacherProfile",
      JSON.stringify({
        id: teacherProfile.id,
        auth_user_id: teacherProfile.auth_user_id,
        teacher_name: teacherProfile.teacher_name,
        role: teacherProfile.role,
      })
    );

    localStorage.removeItem("studentProfile");

    /*
      Tell Navbar immediately that
      the login state has changed.
    */
    window.dispatchEvent(
      new Event("loginStateChanged")
    );

    setLoggingIn(false);

    navigate("/teacher");
  }

  return (
    <main className="student-login-page">
      <section className="student-login-card">

        <div className="login-school-header">
          <p>
            Zayed Educational Complex-Al Kharran
          </p>

          <h1>
            Teacher Login
          </h1>

          <p>
            T. Wafa Al Hebsi
          </p>
        </div>

        <div className="login-title">
          <h2>
            Teacher Access
          </h2>

          <p>
            Enter your private teacher password
            to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleTeacherLogin}>

          <div className="login-field">
            <label htmlFor="teacherPassword">
              Teacher Password
            </label>

            <input
              id="teacherPassword"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter teacher password"
              autoComplete="current-password"
            />
          </div>

          <button
            className="student-login-button"
            type="submit"
            disabled={loggingIn}
          >
            {loggingIn
              ? "Verifying..."
              : "Open Teacher Dashboard"}
          </button>

          {message && (
            <p className="login-message">
              {message}
            </p>
          )}

        </form>
      </section>
    </main>
  );
}

export default TeacherLogin;