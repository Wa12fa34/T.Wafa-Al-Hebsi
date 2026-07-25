import { Link } from "react-router-dom";

function Grammar() {
  const levels = [
    {
      level: "A1",
      name: "Beginner",
      description:
        "Practise essential grammar patterns such as present simple, basic sentence structure, and everyday language.",
      available: true,
    },
    {
      level: "A2",
      name: "Elementary",
      description:
        "Develop grammar for familiar communication using past, future, comparisons, and common structures.",
      available: false,
    },
    {
      level: "B1",
      name: "Intermediate",
      description:
        "Strengthen grammar accuracy through conditionals, modals, perfect forms, and more complex sentences.",
      available: false,
    },
    {
      level: "B2",
      name: "Upper Intermediate",
      description:
        "Practise advanced sentence structures, passive forms, reported speech, and complex grammatical choices.",
      available: false,
    },
    {
      level: "C1",
      name: "Advanced",
      description:
        "Master sophisticated grammar, nuanced structures, and accurate language for academic communication.",
      available: false,
    },
    {
      level: "C2",
      name: "Proficient",
      description:
        "Use highly complex grammatical structures with precision, flexibility, and stylistic control.",
      available: false,
    },
  ];

  return (
    <main className="vocabulary-page">
      <section className="vocabulary-page-hero">
        <div className="hero-badge">
          Grammar Learning Pathway
        </div>

        <p className="vocabulary-page-school">
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>Master English Grammar</h1>

        <p className="vocabulary-page-description">
          Develop grammar accuracy across all six CEFR levels
          through interactive activities, immediate feedback,
          Bloom's Taxonomy, and measurable learning progress.
        </p>

        <p className="vocabulary-page-teacher">
          T. Wafa Al Hebsi
        </p>
      </section>

      <section className="vocabulary-levels-section">
        <div className="home-section-heading">
          <p>CEFR Grammar Levels</p>

          <h2>Choose your grammar level</h2>

          <span>
            Progress from A1 to C2 and track your grammar
            performance in My Progress.
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
                  to={`/grammar/${item.level}`}
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

export default Grammar;