import { Link } from "react-router-dom";

function Vocabulary() {
  const levels = [
    {
      level: "A1",
      name: "Beginner",
      description:
        "Build essential everyday vocabulary and understand common words in simple contexts.",
      available: true,
    },
    {
      level: "A2",
      name: "Elementary",
      description:
        "Develop vocabulary for familiar situations, school, daily routines, and communication.",
      available: false,
    },
    {
      level: "B1",
      name: "Intermediate",
      description:
        "Expand vocabulary for study, communication, opinions, and real-life situations.",
      available: false,
    },
    {
      level: "B2",
      name: "Upper Intermediate",
      description:
        "Strengthen academic vocabulary, context clues, collocations, and precise word choice.",
      available: false,
    },
    {
      level: "C1",
      name: "Advanced",
      description:
        "Master sophisticated vocabulary, nuanced meanings, and advanced academic language.",
      available: false,
    },
    {
      level: "C2",
      name: "Proficient",
      description:
        "Develop highly precise, sophisticated, and flexible vocabulary for complex academic and professional contexts.",
      available: false,
    },
  ];

  return (
    <main className="vocabulary-page">
      <section className="vocabulary-page-hero">
        <div className="hero-badge">
          Vocabulary Learning Pathway
        </div>

        <p className="vocabulary-page-school">
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>Build Your Vocabulary</h1>

        <p className="vocabulary-page-description">
          Develop your vocabulary step by step through
          CEFR-aligned interactive activities, immediate
          feedback, and measurable learning progress.
        </p>

        <p className="vocabulary-page-teacher">
          T. Wafa Al Hebsi
        </p>
      </section>

      <section className="vocabulary-levels-section">
        <div className="home-section-heading">
          <p>CEFR Vocabulary Levels</p>

          <h2>Choose your learning level</h2>

          <span>
            Progress through all six CEFR levels from A1
            to C2 and track your performance in My Progress.
          </span>
        </div>

        <div className="vocabulary-level-grid">
          {levels.map((item) => (
            <article
              className={`vocabulary-level-card ${
                !item.available
                  ? "vocabulary-level-locked"
                  : ""
              }`}
              key={item.level}
            >
              <div className="vocabulary-level-top">
                <span className="vocabulary-cefr-label">
                  CEFR
                </span>

                <span
                  className={`vocabulary-status ${
                    item.available
                      ? "status-available"
                      : "status-coming"
                  }`}
                >
                  {item.available
                    ? "Available"
                    : "Coming Soon"}
                </span>
              </div>

              <div className="vocabulary-level-number">
                {item.level}
              </div>

              <h3>{item.name}</h3>

              <p>{item.description}</p>

              {item.available ? (
                <Link
                  to={`/vocabulary/${item.level}`}
                  className="vocabulary-start-button"
                >
                  Start Practice →
                </Link>
              ) : (
                <span className="vocabulary-coming-button">
                  Coming Soon
                </span>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Vocabulary;