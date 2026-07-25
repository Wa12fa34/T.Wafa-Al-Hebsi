import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function WritingAssessment() {
  const { submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [scores, setScores] = useState({
    task_completion: 0,
    organization: 0,
    vocabulary_spelling: 0,
    grammar: 0,
    punctuation: 0,
  });

  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadSubmission() {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("writing_submissions")
        .select(`
          *,
          writing_activities (
            title,
            cefr_level,
            writing_type,
            prompt,
            instructions,
            minimum_words
          ),
          student_profiles (
            student_name,
            cefr_level,
            class_id,
            classes (
              class_name
            )
          )
        `)
        .eq("id", submissionId)
        .single();

      if (error) {
        console.error(error);

        setMessage(
          `Unable to load submission: ${error.message}`
        );

        setLoading(false);
        return;
      }

      setSubmission(data);

      setScores({
        task_completion: data.task_completion ?? 0,
        organization: data.organization ?? 0,
        vocabulary_spelling:
          data.vocabulary_spelling ?? 0,
        grammar: data.grammar ?? 0,
        punctuation: data.punctuation ?? 0,
      });

      setFeedback(data.feedback || "");

      setLoading(false);
    }

    loadSubmission();
  }, [submissionId]);

  function handleScoreChange(field, value) {
    let number = Number(value);

    if (Number.isNaN(number)) {
      number = 0;
    }

    if (number < 0) {
      number = 0;
    }

    if (number > 20) {
      number = 20;
    }

    setScores((previous) => ({
      ...previous,
      [field]: number,
    }));
  }

  const total =
    scores.task_completion +
    scores.organization +
    scores.vocabulary_spelling +
    scores.grammar +
    scores.punctuation;

  async function saveAssessment() {
    if (!submission) {
      return;
    }

    setSaving(true);
    setMessage("");

    const { error: submissionError } = await supabase
      .from("writing_submissions")
      .update({
        task_completion: scores.task_completion,
        organization: scores.organization,
        vocabulary_spelling:
          scores.vocabulary_spelling,
        grammar: scores.grammar,
        punctuation: scores.punctuation,
        score: total,
        percentage: total,
        feedback: feedback.trim(),
      })
      .eq("id", submission.id);

    if (submissionError) {
      console.error(submissionError);

      setMessage(
        `Unable to save assessment: ${submissionError.message}`
      );

      setSaving(false);
      return;
    }

    const {
      data: existingResults,
      error: searchError,
    } = await supabase
      .from("student_results")
      .select("id")
      .eq(
        "writing_submission_id",
        submission.id
      )
      .limit(1);

    if (searchError) {
      console.error(searchError);

      setMessage(
        `Assessment saved, but progress could not be updated: ${searchError.message}`
      );

      setSaving(false);
      return;
    }

    if (existingResults?.length > 0) {
      const { error: resultError } = await supabase
        .from("student_results")
        .update({
          skill: "Writing",
          cefr_level: submission.cefr_level,
          score: total,
          total_questions: 100,
          percentage: total,
          class_id: submission.class_id,
        })
        .eq("id", existingResults[0].id);

      if (resultError) {
        console.error(resultError);

        setMessage(
          `Assessment saved, but progress could not be updated: ${resultError.message}`
        );

        setSaving(false);
        return;
      }
    } else {
      const { error: resultError } = await supabase
        .from("student_results")
        .insert([
          {
            student_id: submission.student_id,
            class_id: submission.class_id,
            passage_id: null,
            writing_submission_id:
              submission.id,
            skill: "Writing",
            cefr_level: submission.cefr_level,
            score: total,
            total_questions: 100,
            percentage: total,
          },
        ]);

      if (resultError) {
        console.error(resultError);

        setMessage(
          `Assessment saved, but progress could not be updated: ${resultError.message}`
        );

        setSaving(false);
        return;
      }
    }

    setMessage(
      "Writing assessment saved successfully ✅"
    );

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="writing-assessment-page">
        <p>Loading writing submission...</p>
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="writing-assessment-page">
        <h1>Writing Assessment</h1>
        <p>{message || "Submission not found."}</p>
      </main>
    );
  }

  const activity =
    submission.writing_activities;

  const student =
    submission.student_profiles;

  const criteria = [
    {
      key: "task_completion",
      title: "Task Completion",
      description:
        "Completion of the task and relevance of the response.",
    },
    {
      key: "organization",
      title: "Organization",
      description:
        "Logical sequencing, coherence, and organization of ideas.",
    },
    {
      key: "vocabulary_spelling",
      title: "Vocabulary & Spelling",
      description:
        "Appropriate vocabulary, word choice, range, and spelling accuracy.",
    },
    {
      key: "grammar",
      title: "Grammar",
      description:
        "Accuracy and appropriate use of grammatical structures.",
    },
    {
      key: "punctuation",
      title: "Punctuation",
      description:
        "Accurate and appropriate use of punctuation.",
    },
  ];

  return (
    <main className="writing-assessment-page">

      <section className="writing-assessment-header">
        <div className="hero-badge">
          Teacher Writing Assessment
        </div>

        <p>
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>Writing Assessment</h1>

        <p>T. Wafa Al Hebsi</p>
      </section>

      <section className="writing-assessment-student">

        <div>
          <span>Student</span>

          <h2>
            {student?.student_name || "Student"}
          </h2>
        </div>

        <div>
          <span>Class</span>

          <strong>
            {student?.classes?.class_name || "—"}
          </strong>
        </div>

        <div>
          <span>CEFR</span>

          <strong>
            {submission.cefr_level}
          </strong>
        </div>

        <div>
          <span>Word Count</span>

          <strong>
            {submission.word_count}
          </strong>
        </div>

      </section>

      <section className="writing-assessment-task">

        <p>Writing Task</p>

        <h2>
          {activity?.title}
        </h2>

        <p>
          <strong>Prompt:</strong>{" "}
          {activity?.prompt}
        </p>

        {activity?.instructions && (
          <p>
            <strong>
              Instructions:
            </strong>{" "}
            {activity.instructions}
          </p>
        )}

      </section>

      <section className="writing-student-response">

        <p>Student Response</p>

        <h2>
          Submitted Writing
        </h2>

        <div className="writing-response-text">
          {submission.student_text}
        </div>

      </section>

      <section className="writing-rubric-assessment">

        <div className="progress-section-title">
          <p>Assessment Rubric</p>

          <h2>
            Evaluate the writing
          </h2>

          <span>
            Each criterion is worth 20 marks.
          </span>
        </div>

        <div className="writing-assessment-criteria">

          {criteria.map((criterion) => (
            <article
              className="writing-assessment-criterion"
              key={criterion.key}
            >

              <div>
                <h3>
                  {criterion.title}
                </h3>

                <p>
                  {criterion.description}
                </p>
              </div>

              <div className="writing-score-input">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={
                    scores[criterion.key]
                  }
                  onChange={(event) =>
                    handleScoreChange(
                      criterion.key,
                      event.target.value
                    )
                  }
                />

                <span>/20</span>
              </div>

            </article>
          ))}

        </div>

      </section>

      <section className="writing-total-card">

        <p>Total Writing Score</p>

        <h2>{total}/100</h2>

        <div className="result-progress">
          <div
            className="result-progress-fill"
            style={{
              width: `${total}%`,
            }}
          />
        </div>

        <p>
          {total >= 80
            ? "🌟 Excellent Writing Performance"
            : total >= 60
            ? "👍 Good Writing Progress"
            : "📚 Further Practice Recommended"}
        </p>

      </section>

      <section className="writing-feedback-section">

        <label htmlFor="writing-feedback">
          <strong>
            Teacher Feedback
          </strong>
        </label>

        <textarea
          id="writing-feedback"
          rows="6"
          value={feedback}
          onChange={(event) =>
            setFeedback(event.target.value)
          }
          placeholder="Write clear, constructive feedback for the student..."
        />

        <button
          type="button"
          className="writing-submit-button"
          onClick={saveAssessment}
          disabled={saving}
        >
          {saving
            ? "Saving Assessment..."
            : "Save Writing Assessment"}
        </button>

        {message && (
          <p className="writing-submission-message">
            {message}
          </p>
        )}

      </section>

    </main>
  );
}

export default WritingAssessment;