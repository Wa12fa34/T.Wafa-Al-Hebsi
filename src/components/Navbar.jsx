import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function Navbar() {
  const navigate = useNavigate();

  const [studentLoggedIn, setStudentLoggedIn] =
    useState(false);

  const [teacherLoggedIn, setTeacherLoggedIn] =
    useState(false);

  function checkLoginState() {
    const studentProfile =
      localStorage.getItem("studentProfile");

    const teacherProfile =
      localStorage.getItem("teacherProfile");

    setStudentLoggedIn(Boolean(studentProfile));
    setTeacherLoggedIn(Boolean(teacherProfile));
  }

  useEffect(() => {
    checkLoginState();

    window.addEventListener(
      "storage",
      checkLoginState
    );

    window.addEventListener(
      "loginStateChanged",
      checkLoginState
    );

    return () => {
      window.removeEventListener(
        "storage",
        checkLoginState
      );

      window.removeEventListener(
        "loginStateChanged",
        checkLoginState
      );
    };
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("studentProfile");
    localStorage.removeItem("teacherProfile");

    window.dispatchEvent(
      new Event("loginStateChanged")
    );

    setStudentLoggedIn(false);
    setTeacherLoggedIn(false);

    navigate("/");
  }

  return (
    <nav className="navbar">

      <div className="navbar-brand">

        <div className="navbar-logo">
          E
        </div>

        <div>
          <h2>
            English Learning Hub
          </h2>

          <p>
            Zayed Educational Complex – Al Kharran
          </p>
        </div>

      </div>

      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/reading">
          Reading
        </Link>

        <Link to="/writing">
          Writing
        </Link>

        <Link to="/vocabulary">
          Vocabulary
        </Link>

        <Link to="/grammar">
          Grammar
        </Link>

        {studentLoggedIn && (
          <Link to="/progress">
            My Progress
          </Link>
        )}

        {teacherLoggedIn && (
          <Link to="/teacher">
            Teacher Dashboard
          </Link>
        )}

        {!studentLoggedIn &&
          !teacherLoggedIn && (
            <>
              <Link
                to="/login"
                className="navbar-student-login"
              >
                Student Login
              </Link>

              <Link
                to="/teacher-login"
                className="navbar-login-button"
              >
                Teacher Login
              </Link>
            </>
          )}

        {(studentLoggedIn ||
          teacherLoggedIn) && (
          <button
            type="button"
            className="navbar-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

      </div>

    </nav>
  );
}

export default Navbar;