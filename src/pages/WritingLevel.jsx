import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function WritingLevel() {
  const { level } = useParams();

  const [activity, setActivity] = useState(null);
  const [studentText, setStudentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [submissionMessage, setSubmissionMessage] =
    useState("");

  useEffect(() => {
    async function loadWritingActivity() {
      setLoading(true);
      setErrorMessage("");
      setSubmissionMessage("");
      setSubmitted(false);

      const { data, error } = await supabase
        .from("writing_activities")
        .select("*")
        .eq("cefr_level", level)
        .limit(1)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setActivity(data);
      setLoading(false);
    }

    loadWritingActivity();
  }, [level]);

  const wordCount = studentText.trim()
    ? studentText.trim().split(/\s+/).length
    : 0;

  const minimumWords = activity?.minimum_words || 0;

  const minimumReached =
    wordCount >= minimumWords;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!activity) {
      return;
    }

    if (!minimumReached) {
      setSubmissionMessage(
        `Please write at least ${minimumWords} words before submitting.`
      );
      return;
    }

    const savedProfile =
      localStorage.getItem("studentProfile");

    if (!savedProfile) {
      setSubmissionMessage(
        "Please log in before submitting your writing."
      );
      return;
    }

    let studentProfile;

    try {
      studentProfile = JSON.parse(savedProfile);
    } catch (error) {
      console.error(
        "Invalid student profile:",
        error
      );

      setSubmissionMessage(
        "Unable to read your student profile."
      );
      return;
    }

    if (
      !studentProfile.id ||
      !studentProfile.class_id
    ) {
      setSubmissionMessage(
        "Student information is incomplete."
      );
      return;
    }

    setSubmitting(true);
    setSubmissionMessage("");

    const { error } = await supabase
      .from("writing_submissions")
      .insert([
        {
          activity_id: activity.id,
          student_id: studentProfile.id,
          class_id: studentProfile.class_id,
          student_text: studentText.trim(),
          word_count: wordCount,
          cefr_level: activity.cefr_level,
        },
      ]);

    if (error) {
      console.error(
        "Writing submission error:",
        error
      );

      setSubmissionMessage(
        `Unable to submit writing: ${error.message}`
      );

      setSubmitting(false);
      return;
    }

    setSubmitted(true);

    setSubmissionMessage(
      "Writing submitted successfully ✅"
    );

    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="writing-level-page">
        <p>Loading writing activity...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="writing-level-page">
        <h1>Something went wrong</h1>
        <p>{errorMessage}</p>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="writing-level-page">
        <h1>Writing Level {level}</h1>

        <p>
          No writing activity is available for this
          level yet.
        </p>
      </main>
    );
  }

  return (
    <main className="writing-level-page">

      <section className="writing-level-header">

        <div className="hero-badge">
          CEFR Writing Practice
        </div>

        <p>
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>{activity.title}</h1>

        <div className="writing-activity-meta">
          <span>
            CEFR {activity.cefr_level}
          </span>

          <span>
            {activity.writing_type}
          </span>

          <span>
            Minimum {activity.minimum_words} words
          </span>
        </div>

      </section>

      <section className="writing-task-card">

        <div className="writing-task-label">
          Writing Task
        </div>

        <h2>Prompt</h2>

        <p className="writing-prompt">
          {activity.prompt}
        </p>

        {activity.instructions && (
          <div className="writing-instructions">
            <h3>Instructions</h3>

            <p>
              {activity.instructions}
            </p>
          </div>
        )}

      </section>

      <section className="writing-workspace">

        <div className="writing-workspace-header">
          <div>
            <p>Student Workspace</p>
            <h2>Write your response</h2>
          </div>

          <div
            className={`writing-word-counter ${
              minimumReached
                ? "writing-word-counter-ready"
                : ""
            }`}
          >
            <strong>{wordCount}</strong>

            <span>
              / {minimumWords} words
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <textarea
            className="writing-textarea"
            value={studentText}
            onChange={(event) =>
              setStudentText(event.target.value)
            }
            placeholder="Start writing your paragraph here..."
            rows="14"
            disabled={submitted}
          />

          <div className="writing-progress-info">

            {minimumReached ? (
              <p className="writing-ready-message">
                ✓ Minimum word requirement reached.
              </p>
            ) : (
              <p>
                Write at least{" "}
                <strong>
                  {minimumWords - wordCount}
                </strong>{" "}
                more word
                {minimumWords - wordCount === 1
                  ? ""
                  : "s"}.
              </p>
            )}

          </div>

          <button
            type="submit"
            className="writing-submit-button"
            disabled={
              submitting ||
              submitted ||
              !minimumReached
            }
          >
            {submitting
              ? "Submitting..."
              : submitted
              ? "Submitted ✓"
              : "Submit Writing"}
          </button>

        </form>

        {submissionMessage && (
          <div
            className={`writing-submission-message ${
              submitted
                ? "writing-submission-success"
                : ""
            }`}
          >
            {submissionMessage}
          </div>
        )}

      </section>

      <section className="writing-assessment-preview">

        <div className="home-section-heading">
          <p>Writing Assessment</p>

          <h2>
            Your writing will be evaluated using five clear criteria
          </h2>

          <span>
            Each criterion is worth 20 marks.
            Total score: 100.
          </span>
        </div>

        <div className="writing-rubric-grid">

          <article>
            <strong>
              Task Completion
            </strong>

            <span>20 marks</span>

            <p>
              How completely and clearly the response addresses
              the writing task and required content.
            </p>
          </article>

          <article>
            <strong>
              Organization
            </strong>

            <span>20 marks</span>

            <p>
              Logical sequencing, coherence, paragraph structure,
              and clear connection between ideas.
            </p>
          </article>

          <article>
            <strong>
              Vocabulary & Spelling
            </strong>

            <span>20 marks</span>

            <p>
              Appropriate vocabulary, variety of word choice,
              accurate word use, and correct spelling.
            </p>
          </article>

          <article>
            <strong>
              Grammar
            </strong>

            <span>20 marks</span>

            <p>
              Accurate sentence structures, verb forms,
              agreement, and grammar appropriate to the CEFR level.
            </p>
          </article>

          <article>
            <strong>
              Punctuation
            </strong>

            <span>20 marks</span>

            <p>
              Correct use of full stops, commas, question marks,
              apostrophes, and other punctuation where appropriate.
            </p>
          </article>

        </div>

      </section>

    </main>
  );
}

export default WritingLevel;