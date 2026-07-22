import LevelCard from "../components/cards/LevelCard.jsx";
import readingLevels from "../data/readingLevels.js";

function Reading() {
  return (
    <main className="reading-page">
      <section className="reading-header">
        <p className="reading-label">CEFR Reading Practice</p>

        <h1>Develop Your Reading Skills</h1>

        <p>
          Choose your CEFR level and practise reading comprehension through
          interactive activities and guided feedback.
        </p>
      </section>

      <section className="levels-section">
        <div className="section-title">
          <p>Reading Levels</p>

          <h2>Choose Your CEFR Level</h2>

          <span>
            Start with the level that matches your current reading ability.
          </span>
        </div>

        <div className="levels-grid">
          {readingLevels.map((item) => (
            <LevelCard
              key={item.level}
              level={item.level}
              description={item.description}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Reading;