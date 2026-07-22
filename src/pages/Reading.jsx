import LevelCard from "../components/cards/LevelCard.jsx";

function Reading() {
  const levels = [
    {
      level: "A1",
      description:
        "Understand very simple texts, familiar words, and short everyday sentences.",
    },
    {
      level: "A2",
      description:
        "Read short texts about daily life, school, family, and familiar topics.",
    },
    {
      level: "B1",
      description:
        "Understand the main ideas of clear texts and identify important details.",
    },
    {
      level: "B2",
      description:
        "Read longer texts, understand viewpoints, and make logical inferences.",
    },
    {
      level: "C1",
      description:
        "Understand complex texts, implicit meanings, tone, and detailed arguments.",
    },
    {
      level: "C2",
      description:
        "Read advanced texts with precision and understand subtle ideas and meanings.",
    },
  ];

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
          {levels.map((item) => (
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