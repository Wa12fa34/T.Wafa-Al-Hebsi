import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function TeacherDashboard() {
  const [classSummaries, setClassSummaries] = useState([]);
  const [writingSubmissions, setWritingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setErrorMessage("");

      const { data: classesData, error: classesError } =
        await supabase
          .from("classes")
          .select("id, class_name, grade, academic_year")
          .order("grade", { ascending: true })
          .order("class_name", { ascending: true });

      if (classesError) {
        throw classesError;
      }

      const summaries = await Promise.all(
        (classesData || []).map(async (classItem) => {
          const {
            data: studentsData,
            error: studentsError,
          } = await supabase
            .from("student_profiles")
            .select("id")
            .eq("class_id", classItem.id);

          if (studentsError) {
            throw studentsError;
          }

          const {
            data: resultsData,
            error: resultsError,
          } = await supabase
            .from("student_results")
            .select(`
              id,
              student_id,
              class_id,
              skill,
              cefr_level,
              percentage,
              completed_at
            `)
            .eq("class_id", classItem.id);

          if (resultsError) {
            throw resultsError;
          }

          const students = studentsData || [];
          const results = resultsData || [];

          const averagePerformance =
            results.length > 0
              ? Math.round(
                  results.reduce(
                    (total, result) =>
                      total + (result.percentage || 0),
                    0
                  ) / results.length
                )
              : 0;

          const readingResults = results.filter(
            (result) => result.skill === "Reading"
          );

          const readingAverage =
            readingResults.length > 0
              ? Math.round(
                  readingResults.reduce(
                    (total, result) =>
                      total + (result.percentage || 0),
                    0
                  ) / readingResults.length
                )
              : 0;

          const bestResult =
            results.length > 0
              ? Math.max(
                  ...results.map(
                    (result) => result.percentage || 0
                  )
                )
              : 0;

          return {
            id: classItem.id,
            className: classItem.class_name,
            grade: classItem.grade,
            academicYear: classItem.academic_year,
            students: students.length,
            activities: results.length,
            average: averagePerformance,
            readingAverage,
            bestResult,
          };
        })
      );

      setClassSummaries(summaries);

      const {
        data: writingData,
        error: writingError,
      } = await supabase
        .from("writing_submissions")
        .select(`
          id,
          student_id,
          class_id,
          word_count,
          cefr_level,
          score,
          percentage,
          submitted_at,
          student_profiles (
            student_name,
            classes (
              class_name
            )
          ),
          writing_activities (
            title,
            writing_type
          )
        `)
        .order("submitted_at", { ascending: false });

      if (writingError) {
        throw writingError;
      }

      setWritingSubmissions(writingData || []);
      setLoading(false);
    }

    loadDashboard().catch((error) => {
      console.error("Teacher dashboard error:", error);

      setErrorMessage(
        `Unable to load teacher dashboard: ${
          error?.message || "Unknown error"
        }`
      );

      setLoading(false);
    });
  }, []);

  function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <main className="teacher-dashboard-page">
        <p>Loading teacher dashboard...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="teacher-dashboard-page">
        <h1>Teacher Dashboard</h1>
        <p>{errorMessage}</p>
      </main>
    );
  }

  return (
    <main className="teacher-dashboard-page">

      <section className="teacher-dashboard-header">

        <div className="hero-badge">
          Teacher Learning Analytics
        </div>

        <p>
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>Teacher Dashboard</h1>

        <p>T. Wafa Al Hebsi</p>

        <div className="teacher-dashboard-actions">
          <Link
            to="/teacher/students"
            className="teacher-manage-students-button"
          >
            Manage Students →
          </Link>
        </div>

      </section>

      <section className="teacher-dashboard-overview">

        <div className="teacher-dashboard-title">
          <p>Class Performance</p>

          <h2>Monitor progress by class</h2>
        </div>

        <div className="teacher-class-grid">

          {classSummaries.map((classItem) => (
            <article
              className="teacher-class-card"
              key={classItem.id}
            >

              <div className="teacher-class-card-header">
                <p>{classItem.grade}</p>

                <h2>{classItem.className}</h2>

                <p>{classItem.academicYear}</p>
              </div>

              <div className="teacher-class-stats">

                <div>
                  <p>Students</p>
                  <strong>
                    {classItem.students}
                  </strong>
                </div>

                <div>
                  <p>Activities</p>
                  <strong>
                    {classItem.activities}
                  </strong>
                </div>

                <div>
                  <p>Overall Average</p>
                  <strong>
                    {classItem.average}%
                  </strong>
                </div>

                <div>
                  <p>Reading Average</p>
                  <strong>
                    {classItem.readingAverage}%
                  </strong>
                </div>

                <div>
                  <p>Best Result</p>
                  <strong>
                    {classItem.bestResult}%
                  </strong>
                </div>

              </div>

              <Link
                className="teacher-view-students-button"
                to={`/teacher/class/${classItem.id}`}
              >
                View Students →
              </Link>

            </article>
          ))}

        </div>

      </section>

      <section className="teacher-writing-section">

        <div className="teacher-dashboard-title">
          <p>Writing Assessment</p>

          <h2>Writing Submissions</h2>

          <span>
            Review student writing and assess each submission
            using the five-criterion rubric.
          </span>
        </div>

        {writingSubmissions.length === 0 ? (
          <div className="teacher-dashboard-empty">

            <h3>No writing submissions yet</h3>

            <p>
              Student writing submissions will appear here
              after they complete a Writing activity.
            </p>

          </div>
        ) : (
          <div className="teacher-writing-list">

            {writingSubmissions.map((submission) => {
              const student =
                submission.student_profiles;

              const activity =
                submission.writing_activities;

              const assessed =
                submission.score !== null &&
                submission.score !== undefined;

              return (
                <article
                  className="teacher-writing-card"
                  key={submission.id}
                >

                  <div className="teacher-writing-main">

                    <div>
                      <p className="teacher-writing-label">
                        {activity?.writing_type ||
                          "Writing"}
                      </p>

                      <h3>
                        {activity?.title ||
                          "Writing Activity"}
                      </h3>

                      <p>
                        <strong>Student:</strong>{" "}
                        {student?.student_name ||
                          "Student"}
                      </p>

                      <p>
                        <strong>Class:</strong>{" "}
                        {student?.classes?.class_name ||
                          "-"}
                      </p>
                    </div>

                    <div className="teacher-writing-status">

                      <span
                        className={
                          assessed
                            ? "writing-status-assessed"
                            : "writing-status-pending"
                        }
                      >
                        {assessed
                          ? "Assessed"
                          : "Pending Assessment"}
                      </span>

                    </div>

                  </div>

                  <div className="teacher-writing-details">

                    <div>
                      <span>CEFR</span>

                      <strong>
                        {submission.cefr_level}
                      </strong>
                    </div>

                    <div>
                      <span>Words</span>

                      <strong>
                        {submission.word_count}
                      </strong>
                    </div>

                    <div>
                      <span>Submitted</span>

                      <strong>
                        {formatDate(
                          submission.submitted_at
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Score</span>

                      <strong>
                        {assessed
                          ? `${submission.score}/100`
                          : "—"}
                      </strong>
                    </div>

                  </div>

                  <Link
                    className="teacher-view-students-button"
                    to={`/teacher/writing/${submission.id}`}
                  >
                    {assessed
                      ? "Review Assessment →"
                      : "Assess Writing →"}
                  </Link>

                </article>
              );
            })}

          </div>
        )}

      </section>

    </main>
  );
}

export default TeacherDashboard;