function QuestionCard({
  question,
  questionIndex,
  selectedAnswer,
  onAnswerChange,
  showResult,
}) {
  const isCorrect = selectedAnswer === question.answer;

  function getOptionClass(option) {
    if (!showResult) return "";

    if (option === question.answer) {
      return "option-correct";
    }

    if (option === selectedAnswer && option !== question.answer) {
      return "option-incorrect";
    }

    return "";
  }

  return (
    <article className="question-card">
      <h3>
        {questionIndex + 1}. {question.question}
      </h3>

      <div className="question-options">
        {question.options.map((option) => (
          <label
            key={option}
            className={getOptionClass(option)}
          >
            <input
              type="radio"
              name={`question-${questionIndex}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onAnswerChange(questionIndex, option)}
              disabled={showResult}
            />

            <span>{option}</span>
          </label>
        ))}
      </div>

      {showResult && (
        <div
          className={`question-feedback ${
            isCorrect ? "feedback-correct" : "feedback-incorrect"
          }`}
        >
          <h4>{isCorrect ? "✅ Correct" : "❌ Incorrect"}</h4>

          {!isCorrect && (
            <p>
              <strong>Correct Answer:</strong> {question.answer}
            </p>
          )}

          <p>
            <strong>Explanation:</strong> {question.explanation}
          </p>

          <p>
            <strong>Bloom's Level:</strong> {question.bloom}
          </p>
        </div>
      )}
    </article>
  );
}

export default QuestionCard;