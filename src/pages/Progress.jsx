import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

function Progress() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [writingSubmissions, setWritingSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProgress() {
      setLoading(true);
      setErrorMessage("");

      const savedProfile =
        localStorage.getItem("studentProfile");

      if (!savedProfile) {
        setErrorMessage(
          "Please log in to view your progress."
        );
        setLoading(false);
        return;
      }

      let profile;

      try {
        profile = JSON.parse(savedProfile);
      } catch (error) {
        console.error(
          "Unable to read student profile:",
          error
        );

        setErrorMessage(
          "Unable to read your student profile."
        );

        setLoading(false);
        return;
      }

      setStudentProfile(profile);

      const {
        data: resultsData,
        error: resultsError,
      } = await supabase
        .from("student_results")
        .select(`
          id,
          skill,
          cefr_level,
          score,
          total_questions,
          percentage,
          completed_at,
          passage_id,
          writing_submission_id
        `)
        .eq("student_id", profile.id)
        .order("completed_at", {
          ascending: false,
        });

      if (resultsError) {
        console.error(
          "Progress loading error:",
          resultsError
        );

        setErrorMessage(
          `Unable to load progress: ${resultsError.message}`
        );

        setLoading(false);
        return;
      }

      const {
        data: writingData,
        error: writingError,
      } = await supabase
        .from("writing_submissions")
        .select(`
          id,
          cefr_level,
          word_count,
          score,
          percentage,
          task_completion,
          organization,
          vocabulary_spelling,
          grammar,
          punctuation,
          feedback,
          submitted_at,
          writing_activities (
            title,
            writing_type,
            prompt
          )
        `)
        .eq("student_id", profile.id)
        .order("submitted_at", {
          ascending: false,
        });

      if (writingError) {
        console.error(
          "Writing progress error:",
          writingError
        );

        setErrorMessage(
          `Unable to load writing progress: ${writingError.message}`
        );

        setLoading(false);
        return;
      }

      setResults(resultsData || []);
      setWritingSubmissions(writingData || []);

      setLoading(false);
    }

    loadProgress();
  }, []);

  const skills = [
    {
      name: "Reading",
      icon: "📖",
    },
    {
      name: "Writing",
      icon: "✍️",
    },
    {
      name: "Vocabulary",
      icon: "🔤",
    },
    {
      name: "Grammar",
      icon: "🧩",
    },
  ];

  function getSkillResults(skillName) {
    return results.filter(
      (result) => result.skill === skillName
    );
  }

  function getSkillAverage(skillName) {
    const skillResults =
      getSkillResults(skillName);

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

  function getSkillBest(skillName) {
    const skillResults =
      getSkillResults(skillName);

    if (skillResults.length === 0) {
      return null;
    }

    return Math.max(
      ...skillResults.map(
        (result) => result.percentage || 0
      )
    );
  }

  function getSkillLevel(skillName) {
    const skillResults =
      getSkillResults(skillName);

    if (skillResults.length === 0) {
      return "-";
    }

    return (
      skillResults[0].cefr_level ||
      studentProfile?.cefr_level ||
      "-"
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

  const bestPercentage =
    results.length > 0
      ? Math.max(
          ...results.map(
            (result) => result.percentage || 0
          )
        )
      : 0;

  function formatDate(dateValue) {
    if (!dateValue) {
      return "No date";
    }

    return new Date(
      dateValue
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="progress-page">
        <p>Loading your progress...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="progress-page">
        <h1>Student Progress</h1>
        <p>{errorMessage}</p>
      </main>
    );
  }

  return (
    <main className="progress-page">

      <section className="progress-header">

        <div className="hero-badge">
          Personal Learning Dashboard
        </div>

        <p>
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>My Learning Progress</h1>

        <p>
          Track your performance across all English
          skills and CEFR levels.
        </p>

      </section>

      {studentProfile && (
        <section className="progress-student-card">

          <div>
            <p>Student</p>

            <h2>
              {studentProfile.student_name}
            </h2>
          </div>

          <div className="progress-student-details">

            <p>
              <strong>Class:</strong>{" "}
              {studentProfile.class_name ||
                "Not assigned"}
            </p>

            <p>
              <strong>Current CEFR:</strong>{" "}
              {studentProfile.cefr_level ||
                "Not assigned"}
            </p>

          </div>

        </section>
      )}

      <section className="progress-summary">

        <article className="progress-summary-card">
          <p>Completed Activities</p>
          <h2>{completedActivities}</h2>
        </article>

        <article className="progress-summary-card">
          <p>Overall Average</p>
          <h2>{overallAverage}%</h2>
        </article>

        <article className="progress-summary-card">
          <p>Best Result</p>
          <h2>{bestPercentage}%</h2>
        </article>

        <article className="progress-summary-card">
          <p>Current CEFR</p>

          <h2>
            {studentProfile?.cefr_level || "-"}
          </h2>
        </article>

      </section>

      <section className="progress-skills-section">

        <div className="progress-section-title">
          <p>Skill Performance</p>

          <h2>My English Skills</h2>
        </div>

        <div className="student-skill-grid">

          {skills.map((skill) => {
            const skillResults =
              getSkillResults(skill.name);

            const average =
              getSkillAverage(skill.name);

            const best =
              getSkillBest(skill.name);

            const level =
              getSkillLevel(skill.name);

            return (
              <article
                className="student-skill-card"
                key={skill.name}
              >
                <div className="progress-skill-heading">

                  <span className="progress-skill-icon">
                    {skill.icon}
                  </span>

                  <div>
                    <h3>{skill.name}</h3>

                    <p>
                      CEFR {level}
                    </p>
                  </div>

                </div>

                {skillResults.length === 0 ? (
                  <div className="student-skill-empty">
                    <p>No activities yet</p>
                  </div>
                ) : (
                  <>
                    <div className="progress-skill-stats">

                      <p>
                        <strong>Activities:</strong>{" "}
                        {skillResults.length}
                      </p>

                      <p>
                        <strong>Average:</strong>{" "}
                        {average}%
                      </p>

                      <p>
                        <strong>Best:</strong>{" "}
                        {best}%
                      </p>

                    </div>

                    <div className="student-skill-progress">
                      <div
                        className="student-skill-progress-fill"
                        style={{
                          width: `${average}%`,
                        }}
                      />
                    </div>
                  </>
                )}

              </article>
            );
          })}

        </div>

      </section>

      <section className="writing-progress-details">

        <div className="progress-section-title">
          <p>Writing Feedback</p>

          <h2>
            My Writing Assessment
          </h2>

          <span>
            Review your rubric scores and teacher feedback.
          </span>
        </div>

        {writingSubmissions.length === 0 ? (
          <div className="progress-empty">
            <h3>No writing submissions yet</h3>

            <p>
              Complete a Writing activity to see your
              detailed assessment here.
            </p>
          </div>
        ) : (
          <div className="writing-progress-list">

            {writingSubmissions.map((submission) => {
              const assessed =
                submission.score !== null &&
                submission.score !== undefined;

              return (
                <article
                  className="writing-progress-card"
                  key={submission.id}
                >
                  <div className="writing-progress-card-header">

                    <div>
                      <p>
                        {submission
                          .writing_activities
                          ?.writing_type ||
                          "Writing"}
                      </p>

                      <h3>
                        {submission
                          .writing_activities
                          ?.title ||
                          "Writing Activity"}
                      </h3>

                      <span>
                        CEFR {submission.cefr_level}
                      </span>
                    </div>

                    <div className="writing-progress-score">
                      {assessed
                        ? `${submission.score}/100`
                        : "Pending"}
                    </div>

                  </div>

                  <div className="writing-progress-meta">

                    <p>
                      <strong>Word Count:</strong>{" "}
                      {submission.word_count}
                    </p>

                    <p>
                      <strong>Submitted:</strong>{" "}
                      {formatDate(
                        submission.submitted_at
                      )}
                    </p>

                  </div>

                  {assessed ? (
                    <>
                      <div className="writing-rubric-results">

                        <article>
                          <span>
                            Task Completion
                          </span>

                          <strong>
                            {submission.task_completion}/20
                          </strong>
                        </article>

                        <article>
                          <span>
                            Organization
                          </span>

                          <strong>
                            {submission.organization}/20
                          </strong>
                        </article>

                        <article>
                          <span>
                            Vocabulary & Spelling
                          </span>

                          <strong>
                            {submission.vocabulary_spelling}/20
                          </strong>
                        </article>

                        <article>
                          <span>
                            Grammar
                          </span>

                          <strong>
                            {submission.grammar}/20
                          </strong>
                        </article>

                        <article>
                          <span>
                            Punctuation
                          </span>

                          <strong>
                            {submission.punctuation}/20
                          </strong>
                        </article>

                      </div>

                      <div className="result-progress">
                        <div
                          className="result-progress-fill"
                          style={{
                            width: `${submission.percentage}%`,
                          }}
                        />
                      </div>

                      <div className="writing-teacher-feedback">
                        <p>
                          Teacher Feedback
                        </p>

                        <blockquote>
                          {submission.feedback ||
                            "No written feedback yet."}
                        </blockquote>
                      </div>
                    </>
                  ) : (
                    <div className="writing-pending-feedback">
                      <p>
                        Your writing has been submitted and
                        is waiting for assessment.
                      </p>
                    </div>
                  )}

                </article>
              );
            })}

          </div>
        )}

      </section>

      <section className="progress-history">

        <div className="progress-section-title">
          <p>Performance History</p>

          <h2>
            Latest Activity Results
          </h2>
        </div>

        {results.length === 0 ? (
          <div className="progress-empty">
            <h3>No results yet</h3>

            <p>
              Complete a learning activity to
              start tracking your progress.
            </p>
          </div>
        ) : (
          <div className="progress-results-list">

            {results.map((result) => (
              <article
                className="progress-result-card"
                key={result.id}
              >
                <div className="progress-result-main">

                  <div>
                    <p className="progress-result-skill">
                      {result.skill}
                    </p>

                    <h3>
                      CEFR {result.cefr_level}
                    </h3>
                  </div>

                  <div className="progress-result-percentage">
                    {result.percentage}%
                  </div>

                </div>

                <div className="progress-result-details">

                  <p>
                    <strong>Score:</strong>{" "}
                    {result.score} /{" "}
                    {result.total_questions}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(
                      result.completed_at
                    )}
                  </p>

                </div>

                <div className="progress-result-bar">
                  <div
                    className="progress-result-bar-fill"
                    style={{
                      width: `${result.percentage}%`,
                    }}
                  />
                </div>

                <p className="progress-result-message">
                  {result.percentage >= 80
                    ? "🌟 Excellent Performance"
                    : result.percentage >= 60
                    ? "👍 Good Progress"
                    : "📚 Keep Practising"}
                </p>

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}

export default Progress;