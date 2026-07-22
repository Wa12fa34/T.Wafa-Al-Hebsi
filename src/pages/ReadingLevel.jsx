import { useParams } from "react-router-dom";

function ReadingLevel() {
  const { level } = useParams();

  return (
    <main className="reading-level-page">
      <section className="reading-level-header">
        <p className="reading-label">CEFR Reading Practice</p>

        <h1>{level} Reading Level</h1>

        <p>
          This page will include reading passages, comprehension questions,
          vocabulary activities, Bloom’s Taxonomy tasks, and guided feedback.
        </p>
      </section>

      <section className="reading-level-content">
        <h2>Reading Activities Coming Soon</h2>

        <p>
          We will add the first interactive reading passage for level {level} in
          the next step.
        </p>
      </section>
    </main>
  );
}

export default ReadingLevel;