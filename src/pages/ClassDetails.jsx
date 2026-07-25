import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function ClassDetails() {
  const { classId } = useParams();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadClassDetails() {
      setLoading(true);
      setErrorMessage("");

      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id, class_name, grade, academic_year")
        .eq("id", classId)
        .maybeSingle();

      if (classError) {
        setErrorMessage(
          `Unable to load class: ${classError.message}`
        );
        setLoading(false);
        return;
      }

      if (!classData) {
        setErrorMessage("Class not found.");
        setLoading(false);
        return;
      }

      setClassInfo(classData);

      const { data: studentData, error: studentError } = await supabase
        .from("student_profiles")
        .select("id, student_name, cefr_level")
        .eq("class_id", classId)
        .order("student_name", { ascending: true });

      if (studentError) {
        setErrorMessage(
          `Unable to load students: ${studentError.message}`
        );
        setLoading(false);
        return;
      }

      const studentSummaries = await Promise.all(
        (studentData || []).map(async (student) => {
          const { data: resultsData, error: resultsError } =
            await supabase
              .from("student_results")
              .select(
                "id, skill, percentage, score, total_questions, completed_at"
              )
              .eq("student_id", student.id)
              .order("completed_at", { ascending: false });

          if (resultsError) {
            throw resultsError;
          }

          const results = resultsData || [];

          const average =
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

          return {
            id: student.id,
            studentName: student.student_name,
            cefrLevel: student.cefr_level,
            activities: results.length,
            average,
            readingAverage,
            bestResult,
          };
        })
      );

      setStudents(studentSummaries);
      setLoading(false);
    }

    loadClassDetails().catch((error) => {
      console.error("Class details error:", error);

      setErrorMessage(
        `Unable to load class details: ${
          error?.message || "Unknown error"
        }`
      );

      setLoading(false);
    });
  }, [classId]);

  if (loading) {
    return (
      <main className="class-details-page">
        <p>Loading class details...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="class-details-page">
        <h1>Class Details</h1>
        <p>{errorMessage}</p>
      </main>
    );
  }

  return (
    <main className="class-details-page">
      <section className="class-details-header">
        <p>Zayed Educational Complex-Al Kharran</p>

        <h1>{classInfo.class_name}</h1>

        <p>
          {classInfo.grade} · {classInfo.academic_year}
        </p>

        <p>T. Wafa Al Hebsi</p>
      </section>

      <section className="class-details-content">
        <div className="class-details-title">
          <p>Student Performance</p>
          <h2>Students in this class</h2>
        </div>

        {students.length === 0 ? (
          <div className="class-details-empty">
            <h3>No students yet</h3>

            <p>
              Students assigned to this class will appear here.
            </p>
          </div>
        ) : (
          <div className="class-student-table">
            <div className="class-student-row class-student-header">
              <span>Student</span>
              <span>CEFR</span>
              <span>Activities</span>
              <span>Average</span>
              <span>Reading</span>
              <span>Best Result</span>
            </div>

            {students.map((student) => (
              <div
                className="class-student-row"
                key={student.id}
              >
                <span>
                  <Link
                    to={`/teacher/student/${student.id}`}
                    className="student-report-link"
                  >
                    {student.studentName}
                  </Link>
                </span>

                <span>{student.cefrLevel || "-"}</span>
                <span>{student.activities}</span>
                <span>{student.average}%</span>
                <span>{student.readingAverage}%</span>
                <span>{student.bestResult}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ClassDetails;