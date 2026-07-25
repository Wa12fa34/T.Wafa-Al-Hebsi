import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Single student
  const [studentName, setStudentName] = useState("");
  const [classId, setClassId] = useState("");
  const [cefrLevel, setCefrLevel] = useState("A1");
  const [saving, setSaving] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Bulk students
  const [bulkNames, setBulkNames] = useState("");
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkCefrLevel, setBulkCefrLevel] = useState("A1");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkFailures, setBulkFailures] = useState([]);

  // Other
  const [selectedClassFilter, setSelectedClassFilter] =
    useState("all");
  const [resettingStudentId, setResettingStudentId] =
    useState(null);
  const [temporaryPasswordInfo, setTemporaryPasswordInfo] =
    useState(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);

    const { data: classesData, error: classesError } =
      await supabase
        .from("classes")
        .select("id, class_name, grade, academic_year")
        .order("grade", { ascending: true })
        .order("class_name", { ascending: true });

    if (classesError) {
      setErrorMessage(
        `Unable to load classes: ${classesError.message}`
      );
      setLoading(false);
      return;
    }

    setClasses(classesData || []);

    const { data: studentsData, error: studentsError } =
      await supabase
        .from("student_profiles")
        .select(`
          id,
          auth_user_id,
          student_name,
          class_id,
          cefr_level,
          login_email,
          created_at,
          classes (
            class_name,
            grade
          )
        `)
        .order("student_name", { ascending: true });

    if (studentsError) {
      setErrorMessage(
        `Unable to load students: ${studentsError.message}`
      );
      setLoading(false);
      return;
    }

    setStudents(studentsData || []);
    setLoading(false);
  }

  function resetSingleForm() {
    setStudentName("");
    setClassId("");
    setCefrLevel("A1");
    setEditingStudentId(null);
  }

  async function getTeacherSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
      throw new Error(
        "Teacher session expired. Please log in again."
      );
    }

    return data.session;
  }

  // ==========================
  // CREATE / EDIT ONE STUDENT
  // ==========================

  async function handleSaveStudent(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setTemporaryPasswordInfo(null);

    if (!studentName.trim()) {
      setErrorMessage("Please enter the student name.");
      return;
    }

    if (!classId) {
      setErrorMessage("Please select the student class.");
      return;
    }

    setSaving(true);

    try {
      if (editingStudentId) {
        const { error } = await supabase
          .from("student_profiles")
          .update({
            student_name: studentName.trim(),
            class_id: classId,
            cefr_level: cefrLevel,
          })
          .eq("id", editingStudentId);

        if (error) throw error;

        setMessage(
          "Student information updated successfully ✅"
        );

        resetSingleForm();
        await loadPageData();
        return;
      }

      const session = await getTeacherSession();

      const { data, error } = await supabase.functions.invoke(
        "create-student-account",
        {
          body: {
            student_name: studentName.trim(),
            class_id: classId,
            cefr_level: cefrLevel,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;
      if (!data?.success) {
        throw new Error(
          data?.error || "Unable to create student account."
        );
      }

      setTemporaryPasswordInfo({
        studentName:
          data.student?.student_name || studentName.trim(),
        loginEmail:
          data.login_email ||
          data.student?.login_email ||
          "",
        password: data.temporary_password,
        type: "created",
      });

      setMessage("Student account created successfully ✅");
      resetSingleForm();
      await loadPageData();
    } catch (error) {
      setErrorMessage(
        error?.message || "Unable to save student."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================
  // BULK CREATE STUDENTS
  // ==========================

  async function handleBulkCreate(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setBulkResults([]);
    setBulkFailures([]);
    setTemporaryPasswordInfo(null);

    const names = bulkNames
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean);

    if (!bulkClassId) {
      setErrorMessage(
        "Please select a class for the students."
      );
      return;
    }

    if (names.length === 0) {
      setErrorMessage(
        "Please enter at least one student name."
      );
      return;
    }

    if (names.length > 50) {
      setErrorMessage(
        "You can create a maximum of 50 students at one time."
      );
      return;
    }

    setBulkSaving(true);

    try {
      const session = await getTeacherSession();

      const { data, error } = await supabase.functions.invoke(
        "bulk-create-student-accounts",
        {
          body: {
            student_names: names,
            class_id: bulkClassId,
            cefr_level: bulkCefrLevel,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      if (!data) {
        throw new Error(
          "No response was received from the server."
        );
      }

      const created = data.students || [];
      const failed = data.failed_students || [];

      setBulkResults(created);
      setBulkFailures(failed);

      if (created.length > 0) {
        setMessage(
          `${created.length} student account(s) created successfully ✅`
        );
        setBulkNames("");
        await loadPageData();
      }

      if (created.length === 0) {
        setErrorMessage(
          data.error ||
            "No student accounts could be created."
        );
      }
    } catch (error) {
      console.error("Bulk create error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to create student accounts."
      );
    } finally {
      setBulkSaving(false);
    }
  }

  async function handleCopyAllLoginDetails() {
    if (bulkResults.length === 0) return;

    const details = bulkResults
      .map(
        (student, index) =>
          `${index + 1}. ${student.student_name}\n` +
          `Login Email: ${student.login_email}\n` +
          `Temporary Password: ${student.temporary_password}`
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(details);
      setMessage("All login details copied successfully ✅");
    } catch {
      setErrorMessage(
        "Unable to copy all login details automatically."
      );
    }
  }

  function clearBulkResults() {
    setBulkResults([]);
    setBulkFailures([]);
    setMessage("");
  }

  // ==========================
  // RESET PASSWORD
  // ==========================

  async function handleResetPassword(student) {
    setMessage("");
    setErrorMessage("");
    setTemporaryPasswordInfo(null);

    if (!student.auth_user_id) {
      setErrorMessage(
        "This student does not have a login account yet."
      );
      return;
    }

    const confirmed = window.confirm(
      `Reset the password for ${student.student_name}?\n\nThe old password will stop working.`
    );

    if (!confirmed) return;

    setResettingStudentId(student.id);

    try {
      const session = await getTeacherSession();

      const { data, error } = await supabase.functions.invoke(
        "reset-student-password",
        {
          body: {
            student_id: student.id,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      if (!data?.success) {
        throw new Error(
          data?.error || "Unable to reset student password."
        );
      }

      setTemporaryPasswordInfo({
        studentName:
          data.student?.student_name ||
          student.student_name,
        loginEmail:
          data.student?.login_email ||
          student.login_email,
        password: data.temporary_password,
        type: "reset",
      });

      setMessage(
        "Student password reset successfully ✅"
      );
    } catch (error) {
      setErrorMessage(
        error?.message ||
          "Unable to reset student password."
      );
    } finally {
      setResettingStudentId(null);
    }
  }

  // ==========================
  // COPY LOGIN DETAILS
  // ==========================

  async function handleCopyPassword() {
    if (!temporaryPasswordInfo?.password) return;

    try {
      await navigator.clipboard.writeText(
        temporaryPasswordInfo.password
      );
      setMessage("Temporary password copied ✅");
    } catch {
      setErrorMessage(
        "Unable to copy the password automatically."
      );
    }
  }

  async function handleCopyLoginDetails() {
    if (!temporaryPasswordInfo) return;

    const details =
      `Student: ${temporaryPasswordInfo.studentName}\n` +
      `Login Email: ${temporaryPasswordInfo.loginEmail}\n` +
      `Temporary Password: ${temporaryPasswordInfo.password}`;

    try {
      await navigator.clipboard.writeText(details);
      setMessage("Login details copied successfully ✅");
    } catch {
      setErrorMessage(
        "Unable to copy login details automatically."
      );
    }
  }

  // ==========================
  // EDIT
  // ==========================

  function handleEditStudent(student) {
    setEditingStudentId(student.id);
    setStudentName(student.student_name || "");
    setClassId(student.class_id || "");
    setCefrLevel(student.cefr_level || "A1");
    setTemporaryPasswordInfo(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCancelEdit() {
    resetSingleForm();
    setMessage("");
    setErrorMessage("");
  }

  const filteredStudents =
    selectedClassFilter === "all"
      ? students
      : students.filter(
          (student) =>
            student.class_id === selectedClassFilter
        );

  if (loading) {
    return (
      <main className="student-management-page">
        <p>Loading student management...</p>
      </main>
    );
  }

  return (
    <main className="student-management-page">
      <section className="student-management-header">
        <div className="hero-badge">
          Teacher Administration
        </div>

        <p>Zayed Educational Complex-Al Kharran</p>
        <h1>Student Management</h1>
        <p>T. Wafa Al Hebsi</p>
      </section>

      {/* CREATE ONE STUDENT */}

      <section className="student-management-form-card">
        <div className="student-management-section-title">
          <p>
            {editingStudentId
              ? "Edit Student"
              : "Create One Student"}
          </p>

          <h2>
            {editingStudentId
              ? "Update student information"
              : "Add an individual student"}
          </h2>

          <span>
            Login email and temporary password are
            generated automatically.
          </span>
        </div>

        <form
          className="student-management-form"
          onSubmit={handleSaveStudent}
        >
          <div className="student-management-field">
            <label>Student Name</label>

            <input
              type="text"
              value={studentName}
              onChange={(event) =>
                setStudentName(event.target.value)
              }
              placeholder="Enter student name"
            />
          </div>

          <div className="student-management-field">
            <label>Class</label>

            <select
              value={classId}
              onChange={(event) =>
                setClassId(event.target.value)
              }
            >
              <option value="">Select class</option>

              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.class_name}
                </option>
              ))}
            </select>
          </div>

          <div className="student-management-field">
            <label>CEFR Level</label>

            <select
              value={cefrLevel}
              onChange={(event) =>
                setCefrLevel(event.target.value)
              }
            >
              {cefrLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="student-management-actions">
            <button
              type="submit"
              className="student-management-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingStudentId
                ? "Update Student"
                : "Create Student Account"}
            </button>

            {editingStudentId && (
              <button
                type="button"
                className="student-management-cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* BULK ADD */}

      {!editingStudentId && (
        <section className="student-management-form-card">
          <div className="student-management-section-title">
            <p>Bulk Add Students</p>
            <h2>Add a whole class at once</h2>

            <span>
              Enter one student name per line. Each
              student will receive a unique login email
              and temporary password automatically.
            </span>
          </div>

          <form onSubmit={handleBulkCreate}>
            <div className="student-management-form">
              <div className="student-management-field">
                <label>Class</label>

                <select
                  value={bulkClassId}
                  onChange={(event) =>
                    setBulkClassId(event.target.value)
                  }
                >
                  <option value="">Select class</option>

                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="student-management-field">
                <label>CEFR Level</label>

                <select
                  value={bulkCefrLevel}
                  onChange={(event) =>
                    setBulkCefrLevel(event.target.value)
                  }
                >
                  {cefrLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="student-management-field"
              style={{ marginTop: "18px" }}
            >
              <label>Student Names</label>

              <textarea
                value={bulkNames}
                onChange={(event) =>
                  setBulkNames(event.target.value)
                }
                rows="10"
                placeholder={
                  "Enter one student name per line:\n\nSara Ahmed\nMariam Ali\nFatima Saeed\nAisha Khalid"
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #d0d5dd",
                  font: "inherit",
                  resize: "vertical",
                }}
              />

              <small>
                {bulkNames
                  .split("\n")
                  .map((name) => name.trim())
                  .filter(Boolean).length}{" "}
                student(s) entered — maximum 50.
              </small>
            </div>

            <div
              className="student-management-actions"
              style={{ marginTop: "18px" }}
            >
              <button
                type="submit"
                className="student-management-save-button"
                disabled={bulkSaving}
              >
                {bulkSaving
                  ? "Creating Accounts..."
                  : "Create All Student Accounts"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* MESSAGES */}

      {message && (
        <p className="student-management-success">
          {message}
        </p>
      )}

      {errorMessage && (
        <p className="student-management-error">
          {errorMessage}
        </p>
      )}

      {/* SINGLE LOGIN DETAILS */}

      {temporaryPasswordInfo && (
        <section className="temporary-password-card">
          <div className="temporary-password-header">
            <div>
              <p>
                {temporaryPasswordInfo.type === "created"
                  ? "Student Account Created ✅"
                  : "Password Reset Successful ✅"}
              </p>

              <h2>
                {temporaryPasswordInfo.studentName}
              </h2>
            </div>

            <button
              type="button"
              className="temporary-password-close"
              onClick={() => {
                setTemporaryPasswordInfo(null);
                setMessage("");
              }}
            >
              ×
            </button>
          </div>

          <div className="temporary-password-details">
            <p>
              <strong>Login Email:</strong>{" "}
              {temporaryPasswordInfo.loginEmail}
            </p>

            <p className="temporary-password-warning">
              Copy these details now. The password will
              disappear when you close this card.
            </p>
          </div>

          <div className="temporary-password-value">
            <code>
              {temporaryPasswordInfo.password}
            </code>

            <button
              type="button"
              onClick={handleCopyPassword}
            >
              Copy Password
            </button>
          </div>

          <button
            type="button"
            className="copy-login-details-button"
            onClick={handleCopyLoginDetails}
          >
            Copy Login Details
          </button>
        </section>
      )}

      {/* BULK RESULTS */}

      {bulkResults.length > 0 && (
        <section className="student-management-list-section">
          <div className="student-management-list-header">
            <div>
              <p>Accounts Created Successfully ✅</p>
              <h2>Student Login Details</h2>
            </div>

            <div className="student-management-row-actions">
              <button
                type="button"
                className="student-management-save-button"
                onClick={handleCopyAllLoginDetails}
              >
                Copy All Login Details
              </button>

              <button
                type="button"
                className="student-management-edit-button"
                onClick={clearBulkResults}
              >
                Hide Passwords
              </button>
            </div>
          </div>

          <p className="temporary-password-warning">
            Copy these details now. For security, the
            passwords are not stored in the student
            profiles.
          </p>

          <div className="student-management-table">
            <div className="student-management-row student-management-table-header">
              <span>Student</span>
              <span>Class</span>
              <span>CEFR</span>
              <span>Login Email</span>
              <span>Password</span>
            </div>

            {bulkResults.map((student) => (
              <div
                className="student-management-row"
                key={student.id}
              >
                <span className="student-management-name">
                  {student.student_name}
                </span>

                <span>{student.class_name}</span>

                <span>{student.cefr_level}</span>

                <span>{student.login_email}</span>

                <span>
                  <code>
                    {student.temporary_password}
                  </code>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {bulkFailures.length > 0 && (
        <section className="student-management-form-card">
          <div className="student-management-section-title">
            <p>Some Accounts Were Not Created</p>
            <h2>Review these students</h2>
          </div>

          {bulkFailures.map((student, index) => (
            <p
              className="student-management-error"
              key={`${student.student_name}-${index}`}
            >
              {student.student_name}: {student.error}
            </p>
          ))}
        </section>
      )}

      {/* DIRECTORY */}

      <section className="student-management-list-section">
        <div className="student-management-list-header">
          <div>
            <p>Student Directory</p>
            <h2>Manage students by class</h2>
          </div>

          <div className="student-management-filter">
            <label>Filter by Class</label>

            <select
              value={selectedClassFilter}
              onChange={(event) =>
                setSelectedClassFilter(
                  event.target.value
                )
              }
            >
              <option value="all">All Classes</option>

              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.class_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="progress-empty">
            <h3>No students available</h3>
            <p>Create student accounts above.</p>
          </div>
        ) : (
          <div className="student-management-table">
            <div className="student-management-row student-management-table-header">
              <span>Student</span>
              <span>Class</span>
              <span>CEFR</span>
              <span>Login</span>
              <span>Actions</span>
            </div>

            {filteredStudents.map((student) => (
              <div
                className="student-management-row"
                key={student.id}
              >
                <span className="student-management-name">
                  {student.student_name}
                </span>

                <span>
                  {student.classes?.class_name ||
                    "Not assigned"}
                </span>

                <span>
                  {student.cefr_level || "-"}
                </span>

                <span>
                  {student.auth_user_id
                    ? "Account Ready"
                    : "Profile Only"}
                </span>

                <span className="student-management-row-actions">
                  <button
                    type="button"
                    className="student-management-edit-button"
                    onClick={() =>
                      handleEditStudent(student)
                    }
                  >
                    Edit
                  </button>

                  {student.auth_user_id && (
                    <button
                      type="button"
                      className="student-reset-password-button"
                      disabled={
                        resettingStudentId === student.id
                      }
                      onClick={() =>
                        handleResetPassword(student)
                      }
                    >
                      {resettingStudentId === student.id
                        ? "Resetting..."
                        : "Reset Password"}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentManagement;