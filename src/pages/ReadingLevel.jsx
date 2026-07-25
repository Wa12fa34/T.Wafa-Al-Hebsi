import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import QuestionCard from "../components/reading/QuestionCard.jsx";

function ReadingLevel() {
  const { level } = useParams();

  const [passage, setPassage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingResult, setSavingResult] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    async function loadReadingActivity() {
      setLoading(true);
      setErrorMessage("");
      setResultMessage("");
      setShowResults(false);

      const { data: passageData, error: passageError } = await supabase
        .from("reading_passages")
        .select("*")
        .eq("cefr_level", level)
        .limit(1)
        .maybeSingle();

      if (passageError) {
        setErrorMessage(passageError.message);
        setLoading(false);
        return;
      }

      if (!passageData) {
        setPassage(null);
        setQuestions([]);
        setVocabulary([]);
        setLoading(false);
        return;
      }

      const { data: questionData, error: questionError } = await supabase
        .from("reading_questions")
        .select("*")
        .eq("passage_id", passageData.id)
        .order("created_at", { ascending: true });

      if (questionError) {
        setErrorMessage(questionError.message);
        setLoading(false);
        return;
      }

      const { data: vocabularyData, error: vocabularyError } =
        await supabase
          .from("reading_vocabulary")
          .select("*")
          .eq("passage_id", passageData.id)
          .order("created_at", { ascending: true });

      if (vocabularyError) {
        setErrorMessage(vocabularyError.message);
        setLoading(false);
        return;
      }

      const formattedQuestions = (questionData || []).map(
        (question) => ({
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

      setPassage(passageData);
      setQuestions(formattedQuestions);
      setVocabulary(vocabularyData || []);
      setAnswers({});
      setScore(null);
      setShowResults(false);
      setLoading(false);
    }

    loadReadingActivity();
  }, [level]);

  function handleAnswerChange(questionIndex, selectedOption) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionIndex]: selectedOption,
    }));
  }

  async function saveResult(
    calculatedScore,
    calculatedPercentage
  ) {
    const savedProfile = localStorage.getItem("studentProfile");

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
      !studentProfile.class_id ||
      !passage?.id
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
          passage_id: passage.id,
          skill: "Reading",
          cefr_level: passage.cefr_level,
          score: calculatedScore,
          total_questions: questions.length,
          percentage: calculatedPercentage,
        },
      ]);

    if (error) {
      console.error("Result save error:", error);

      setResultMessage(
        `Unable to save result: ${error.message}`
      );

      setSavingResult(false);
      return;
    }

    setResultMessage("Result saved successfully ✅");
    setSavingResult(false);
  }

  async function checkAnswers() {
    let correctAnswers = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctAnswers++;
      }
    });

    const calculatedPercentage =
      questions.length > 0
        ? Math.round(
            (correctAnswers / questions.length) * 100
          )
        : 0;

    setScore(correctAnswers);
    setShowResults(true);

    await saveResult(
      correctAnswers,
      calculatedPercentage
    );
  }

  const percentage =
    score !== null && questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;

  if (loading) {
    return (
      <main className="reading-level-page">
        <p>Loading...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="reading-level-page">
        <h1>Something went wrong</h1>
        <p>{errorMessage}</p>
      </main>
    );
  }

  if (!passage) {
    return (
      <main className="reading-level-page">
        <h1>Level {level}</h1>

        <p>
          No reading passage is available for this level yet.
        </p>
      </main>
    );
  }

  return (
    <main className="reading-level-page">

      <section className="reading-level-header">
        <p className="reading-label">
          CEFR Reading Practice
        </p>

        <h1>{passage.title}</h1>

        <p>
          CEFR Level: {passage.cefr_level}
        </p>
      </section>

      <section className="reading-level-content">

        <h2>Reading Passage</h2>

        <p className="reading-passage">
          {passage.passage}
        </p>

        <h2>Vocabulary</h2>

        <div className="vocabulary-list">
          {vocabulary.map((item) => (
            <article
              className="vocabulary-card"
              key={item.id}
            >
              <h3>{item.word}</h3>

              <p>
                <strong>Meaning:</strong>{" "}
                {item.meaning}
              </p>

              <p>
                <strong>Example:</strong>{" "}
                {item.example}
              </p>
            </article>
          ))}
        </div>

        <h2>Comprehension Questions</h2>

        {questions.map((question, index) => (
          <QuestionCard
            key={`${question.question}-${index}`}
            question={question}
            questionIndex={index}
            selectedAnswer={answers[index]}
            onAnswerChange={handleAnswerChange}
            showResult={showResults}
          />
        ))}

        {questions.length > 0 && !showResults && (
          <button
            type="button"
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

            <h2>Reading Performance</h2>

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
                {passage.cefr_level}
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
                ? "🌟 Excellent Performance"
                : percentage >= 60
                ? "👍 Good Progress"
                : "📚 Keep Practising"}
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

export default ReadingLevel;