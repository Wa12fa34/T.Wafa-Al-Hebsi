import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

function GrammarLevel() {
  const { level } = useParams();

  const [activity, setActivity] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingResult, setSavingResult] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    async function loadGrammarActivity() {
      setLoading(true);
      setErrorMessage("");
      setResultMessage("");
      setShowResults(false);

      const { data: activityData, error: activityError } =
        await supabase
          .from("grammar_activities")
          .select("*")
          .eq("cefr_level", level)
          .limit(1)
          .maybeSingle();

      if (activityError) {
        setErrorMessage(activityError.message);
        setLoading(false);
        return;
      }

      if (!activityData) {
        setActivity(null);
        setQuestions([]);
        setLoading(false);
        return;
      }

      const { data: questionData, error: questionError } =
        await supabase
          .from("grammar_questions")
          .select("*")
          .eq("activity_id", activityData.id)
          .order("created_at", { ascending: true });

      if (questionError) {
        setErrorMessage(questionError.message);
        setLoading(false);
        return;
      }

      const formattedQuestions = (questionData || []).map(
        (question) => ({
          id: question.id,
          question: question.question,
          options: [
            question.option_a,
            question.option_b,
            question.option_c,
          ],
          answer: question.correct_answer,
          explanation: question.explanation,
          bloom: question.bloom_level,
        })
      );

      setActivity(activityData);
      setQuestions(formattedQuestions);
      setAnswers({});
      setScore(null);
      setShowResults(false);
      setLoading(false);
    }

    loadGrammarActivity();
  }, [level]);

  function handleAnswerChange(questionIndex, option) {
    if (showResults) {
      return;
    }

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionIndex]: option,
    }));
  }

  async function saveResult(
    calculatedScore,
    calculatedPercentage
  ) {
    const savedProfile =
      localStorage.getItem("studentProfile");

    if (!savedProfile) {
      setResultMessage(
        "Please log in before saving your result."
      );
      return;
    }

    let studentProfile;

    try {
      studentProfile = JSON.parse(savedProfile);
    } catch (error) {
      console.error("Invalid student profile:", error);

      setResultMessage(
        "Unable to read the student profile."
      );

      return;
    }

    if (
      !studentProfile.id ||
      !studentProfile.class_id
    ) {
      setResultMessage(
        "Student information is incomplete."
      );
      return;
    }

    setSavingResult(true);

    const { error } = await supabase
      .from("student_results")
      .insert([
        {
          student_id: studentProfile.id,
          class_id: studentProfile.class_id,
          passage_id: null,
          skill: "Grammar",
          cefr_level: activity.cefr_level,
          score: calculatedScore,
          total_questions: questions.length,
          percentage: calculatedPercentage,
        },
      ]);

    if (error) {
      console.error(
        "Grammar result save error:",
        error
      );

      setResultMessage(
        `Unable to save result: ${error.message}`
      );

      setSavingResult(false);
      return;
    }

    setResultMessage(
      "Grammar result saved successfully ✅"
    );

    setSavingResult(false);
  }

  async function checkAnswers() {
    if (questions.length === 0) {
      return;
    }

    let correctAnswers = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctAnswers++;
      }
    });

    const calculatedPercentage = Math.round(
      (correctAnswers / questions.length) * 100
    );

    setScore(correctAnswers);
    setShowResults(true);

    await saveResult(
      correctAnswers,
      calculatedPercentage
    );
  }

  const percentage =
    score !== null && questions.length > 0
      ? Math.round(
          (score / questions.length) * 100
        )
      : 0;

  if (loading) {
    return (
      <main className="grammar-level-page">
        <p>Loading grammar activity...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="grammar-level-page">
        <h1>Something went wrong</h1>
        <p>{errorMessage}</p>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="grammar-level-page">
        <h1>Grammar Level {level}</h1>

        <p>
          No grammar activity is available for this
          level yet.
        </p>
      </main>
    );
  }

  return (
    <main className="grammar-level-page">

      <section className="vocabulary-level-header">

        <p className="vocabulary-level-label">
          CEFR Grammar Practice
        </p>

        <h1>{activity.title}</h1>

        <p>
          CEFR Level: {activity.cefr_level}
        </p>

        {activity.grammar_topic && (
          <p>
            <strong>Grammar Topic:</strong>{" "}
            {activity.grammar_topic}
          </p>
        )}

        {activity.instructions && (
          <p className="vocabulary-instructions">
            {activity.instructions}
          </p>
        )}

      </section>

      <section className="vocabulary-level-content">

        <div className="vocabulary-quiz-header">
          <p>Interactive Grammar Practice</p>

          <h2>
            Choose the best answer
          </h2>
        </div>

        {questions.map((question, index) => {
          const selectedAnswer = answers[index];

          const isCorrect =
            selectedAnswer === question.answer;

          return (
            <article
              className="question-card"
              key={question.id}
            >
              <h3>
                {index + 1}. {question.question}
              </h3>

              <div className="question-options">

                {question.options.map((option) => {
                  let optionClass = "";

                  if (showResults) {
                    if (
                      option === question.answer
                    ) {
                      optionClass =
                        "option-correct";
                    } else if (
                      option === selectedAnswer
                    ) {
                      optionClass =
                        "option-incorrect";
                    }
                  }

                  return (
                    <label
                      key={option}
                      className={optionClass}
                    >
                      <input
                        type="radio"
                        name={`grammar-question-${index}`}
                        value={option}
                        checked={
                          selectedAnswer === option
                        }
                        onChange={() =>
                          handleAnswerChange(
                            index,
                            option
                          )
                        }
                        disabled={showResults}
                      />

                      <span>{option}</span>
                    </label>
                  );
                })}

              </div>

              {showResults && (
                <div
                  className={`question-feedback ${
                    isCorrect
                      ? "feedback-correct"
                      : "feedback-incorrect"
                  }`}
                >
                  <h4>
                    {isCorrect
                      ? "✅ Correct"
                      : "❌ Incorrect"}
                  </h4>

                  {!isCorrect && (
                    <p>
                      <strong>
                        Correct Answer:
                      </strong>{" "}
                      {question.answer}
                    </p>
                  )}

                  <p>
                    <strong>
                      Explanation:
                    </strong>{" "}
                    {question.explanation}
                  </p>

                  <p>
                    <strong>
                      Bloom's Level:
                    </strong>{" "}
                    {question.bloom}
                  </p>
                </div>
              )}

            </article>
          );
        })}

        {questions.length > 0 &&
          !showResults && (
            <button
              type="button"
              className="vocabulary-check-button"
              onClick={checkAnswers}
              disabled={savingResult}
            >
              {savingResult
                ? "Saving..."
                : "Check Answers"}
            </button>
          )}

        {score !== null && (
          <section className="score-card">

            <h2>
              Grammar Performance
            </h2>

            <div className="score-summary">

              <p>
                <strong>Score:</strong>{" "}
                {score} / {questions.length}
              </p>

              <p>
                <strong>Percentage:</strong>{" "}
                {percentage}%
              </p>

              <p>
                <strong>CEFR Level:</strong>{" "}
                {activity.cefr_level}
              </p>

            </div>

            <div className="result-progress">
              <div
                className="result-progress-fill"
                style={{
                  width: `${percentage}%`,
                }}
              ></div>
            </div>

            <h3 className="performance-message">
              {percentage >= 80
                ? "🌟 Excellent Grammar Performance"
                : percentage >= 60
                ? "👍 Good Grammar Progress"
                : "📚 Keep Practising Grammar"}
            </h3>

            {resultMessage && (
              <p className="result-save-message">
                {resultMessage}
              </p>
            )}

          </section>
        )}

      </section>

    </main>
  );
}

export default GrammarLevel;