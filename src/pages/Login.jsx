import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function Login() {
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("");
  const [password, setPassword] = useState("");
  const [classId, setClassId] = useState("");

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    async function loadClasses() {
      setLoadingClasses(true);
      setMessage("");

      const { data, error } = await supabase
        .from("classes")
        .select("id, class_name, grade, academic_year")
        .order("grade", { ascending: true })
        .order("class_name", { ascending: true });

      if (error) {
        console.error("Classes error:", error);

        setMessage(
          `Unable to load classes: ${error.message}`
        );

        setLoadingClasses(false);
        return;
      }

      setClasses(data || []);
      setLoadingClasses(false);
    }

    loadClasses();
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");

    if (!studentName.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!classId) {
      setMessage("Please select your class.");
      return;
    }

    if (!password.trim()) {
      setMessage("Please enter your password.");
      return;
    }

    setLoggingIn(true);

    const { data: profileData, error: profileError } =
      await supabase
        .from("student_profiles")
        .select(`
          id,
          student_name,
          class_id,
          cefr_level,
          login_email
        `)
        .eq("student_name", studentName.trim())
        .eq("class_id", classId)
        .maybeSingle();

    if (profileError) {
      console.error("Profile error:", profileError);

      setMessage(
        `Login error: ${profileError.message}`
      );

      setLoggingIn(false);
      return;
    }

    if (!profileData) {
      setMessage(
        "Student name or class is incorrect."
      );

      setLoggingIn(false);
      return;
    }

    if (!profileData.login_email) {
      setMessage(
        "This student account is not ready for login."
      );

      setLoggingIn(false);
      return;
    }

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: profileData.login_email,
        password,
      });

    if (signInError) {
      console.error(
        "Student sign in error:",
        signInError
      );

      setMessage(
        "Student name or password is incorrect."
      );

      setLoggingIn(false);
      return;
    }

    const selectedClass = classes.find(
      (classItem) =>
        classItem.id === profileData.class_id
    );

    localStorage.setItem(
      "studentProfile",
      JSON.stringify({
        id: profileData.id,
        student_name: profileData.student_name,
        class_id: profileData.class_id,
        class_name:
          selectedClass?.class_name ||
          "Not assigned",
        cefr_level: profileData.cefr_level,
      })
    );

    /*
      Make sure teacher data is removed
      when a student logs in.
    */
    localStorage.removeItem("teacherProfile");

    /*
      Tell Navbar immediately that
      the login state has changed.
    */
    window.dispatchEvent(
      new Event("loginStateChanged")
    );

    setLoggingIn(false);

    navigate("/");
  }

  return (
    <main className="student-login-page">
      <section className="student-login-card">

        <div className="login-school-header">
          <p>
            Zayed Educational Complex-Al Kharran
          </p>

          <h1>
            English Learning Platform
          </h1>

          <p>
            T. Wafa Al Hebsi
          </p>
        </div>

        <div className="login-title">
          <h2>
            Student Login
          </h2>

          <p>
            Enter your name, class, and password
            to continue.
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="login-field">
            <label htmlFor="studentName">
              Student Name
            </label>

            <input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(event) =>
                setStudentName(event.target.value)
              }
              placeholder="Enter your name"
              autoComplete="off"
            />
          </div>

          <div className="login-field">
            <label htmlFor="studentClass">
              Class
            </label>

            <select
              id="studentClass"
              value={classId}
              onChange={(event) =>
                setClassId(event.target.value)
              }
              disabled={loadingClasses}
            >
              <option value="">
                {loadingClasses
                  ? "Loading classes..."
                  : "Select your class"}
              </option>

              {classes.map((classItem) => (
                <option
                  key={classItem.id}
                  value={classItem.id}
                >
                  {classItem.class_name}
                </option>
              ))}
            </select>
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            className="student-login-button"
            type="submit"
            disabled={loggingIn}
          >
            {loggingIn
              ? "Logging in..."
              : "Login"}
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

export default Login;