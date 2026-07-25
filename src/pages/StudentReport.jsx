import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function StudentReport() {
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStudentReport() {
      setLoading(true);
      setErrorMessage("");

      const { data: studentData, error: studentError } =
        await supabase
          .from("student_profiles")
          .select(`
            id,
            student_name,
            cefr_level,
            class_id,
            classes (
              class_name,
              grade,
              academic_year
            )
          `)
          .eq("id", studentId)
          .maybeSingle();

      if (studentError) {
        setErrorMessage(
          `Unable to load student: ${studentError.message}`
        );
        setLoading(false);
        return;
      }

      if (!studentData) {
        setErrorMessage("Student not found.");
        setLoading(false);
        return;
      }

      setStudent(studentData);

      const { data: resultsData, error: resultsError } =
        await supabase
          .from("student_results")
          .select(`
            id,
            skill,
            cefr_level,
            score,
            total_questions,
            percentage,
            completed_at
          `)
          .eq("student_id", studentId)
          .order("completed_at", { ascending: false });

      if (resultsError) {
        setErrorMessage(
          `Unable to load results: ${resultsError.message}`
        );
        setLoading(false);
        return;
      }

      setResults(resultsData || []);
      setLoading(false);
    }

    loadStudentReport();
  }, [studentId]);

  const skills = [
    "Reading",
    "Writing",
    "Vocabulary",
    "Grammar",
  ];

  function getSkillResults(skill) {
    return results.filter(
      (result) => result.skill === skill
    );
  }

  function getSkillAverage(skill) {
    const skillResults = getSkillResults(skill);

    if (skillResults.length === 0) {
      return null;
    }

    return Math.round(
      skillResults.reduce(
        (total, result) =>
          total + (result.percentage || 0),
        0
      ) / skillResults.length
    );
  }

  function getSkillBest(skill) {
    const skillResults = getSkillResults(skill);

    if (skillResults.length === 0) {
      return null;
    }

    return Math.max(
      ...skillResults.map(
        (result) => result.percentage || 0
      )
    );
  }

  const completedActivities = results.length;

  const overallAverage =
    results.length > 0
      ? Math.round(
          results.reduce(
            (total, result) =>
              total + (result.percentage || 0),
            0
          ) / results.length
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

  function formatDate(value) {
    if (!value) {
      return "-";
    }

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
      <main className="student-report-page">
        <p>Loading student report...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="student-report-page">
        <h1>Student Report</h1>
        <p>{errorMessage}</p>
      </main>
    );
  }

  return (
    <main className="student-report-page">

      <section className="student-report-header">
        <p>
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>{student.student_name}</h1>

        <p>T. Wafa Al Hebsi</p>

        <div className="student-report-meta">
          <p>
            <strong>Class:</strong>{" "}
            {student.classes?.class_name || "-"}
          </p>

          <p>
            <strong>CEFR Level:</strong>{" "}
            {student.cefr_level || "-"}
          </p>
        </div>
      </section>

      <section className="student-report-summary">

        <article>
          <p>Completed Activities</p>
          <h2>{completedActivities}</h2>
        </article>

        <article>
          <p>Overall Average</p>
          <h2>{overallAverage}%</h2>
        </article>

        <article>
          <p>Best Result</p>
          <h2>{bestResult}%</h2>
        </article>

        <article>
          <p>Current CEFR</p>
          <h2>{student.cefr_level || "-"}</h2>
        </article>

      </section>

      <section className="student-skill-performance">

        <div className="student-report-title">
          <p>Skill Performance</p>
          <h2>English Skills Overview</h2>
        </div>

        <div className="student-skill-grid">

          {skills.map((skill) => {
            const skillResults =
              getSkillResults(skill);

            const average =
              getSkillAverage(skill);

            const best =
              getSkillBest(skill);

            return (
              <article
                className="student-skill-card"
                key={skill}
              >
                <h3>{skill}</h3>

                {skillResults.length === 0 ? (
                  <div className="student-skill-empty">
                    <p>No activities yet</p>
                  </div>
                ) : (
                  <>
                    <p>
                      <strong>Activities:</strong>{" "}
                      {skillResults.length}
                    </p>

                    <p>
                      <strong>Average:</strong>{" "}
                      {average}%
                    </p>

                    <p>
                      <strong>Best Result:</strong>{" "}
                      {best}%
                    </p>

                    <div className="student-skill-progress">
                      <div
                        className="student-skill-progress-fill"
                        style={{
                          width: `${average}%`,
                        }}
                      ></div>
                    </div>
                  </>
                )}
              </article>
            );
          })}

        </div>

      </section>

      <section className="student-report-history">

        <div className="student-report-title">
          <p>Performance History</p>
          <h2>Activity Results</h2>
        </div>

        {results.length === 0 ? (
          <div className="student-report-empty">
            <h3>No results yet</h3>

            <p>
              This student has not completed any
              activities yet.
            </p>
          </div>
        ) : (
          <div className="student-report-results">

            {results.map((result) => (
              <article
                className="student-report-result-card"
                key={result.id}
              >

                <div className="student-report-result-heading">
                  <h3>{result.skill}</h3>

                  <span>
                    CEFR {result.cefr_level}
                  </span>
                </div>

                <div className="student-report-result-details">

                  <p>
                    <strong>Score:</strong>{" "}
                    {result.score} /{" "}
                    {result.total_questions}
                  </p>

                  <p>
                    <strong>Percentage:</strong>{" "}
                    {result.percentage}%
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(
                      result.completed_at
                    )}
                  </p>

                </div>

                <div className="student-report-progress">
                  <div
                    className="student-report-progress-fill"
                    style={{
                      width: `${result.percentage}%`,
                    }}
                  ></div>
                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      <div className="student-report-back">
        <Link
          to={`/teacher/class/${student.class_id}`}
        >
          ← Back to Class
        </Link>
      </div>

    </main>
  );
}

export default StudentReport;