import { Link } from "react-router-dom";

function Reading() {
  const levels = [
    {
      level: "A1",
      name: "Beginner",
      description:
        "Read short, simple texts about familiar topics and practise understanding basic information.",
      available: true,
    },
    {
      level: "A2",
      name: "Elementary",
      description:
        "Develop comprehension of simple texts about daily life, school, routines, and familiar situations.",
      available: false,
    },
    {
      level: "B1",
      name: "Intermediate",
      description:
        "Read longer texts and practise main ideas, details, inference, vocabulary in context, and opinions.",
      available: false,
    },
    {
      level: "B2",
      name: "Upper Intermediate",
      description:
        "Strengthen critical reading through complex texts, inference, author's purpose, tone, and analysis.",
      available: false,
    },
    {
      level: "C1",
      name: "Advanced",
      description:
        "Analyse sophisticated academic texts, implicit meaning, argument, evidence, and nuanced language.",
      available: false,
    },
    {
      level: "C2",
      name: "Proficient",
      description:
        "Interpret highly complex texts with precision, evaluate arguments, and understand subtle meanings and style.",
      available: false,
    },
  ];

  return (
    <main className="reading-page">
      <section className="vocabulary-page-hero">
        <div className="hero-badge">
          Reading Learning Pathway
        </div>

        <p className="vocabulary-page-school">
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>Develop Your Reading Skills</h1>

        <p className="vocabulary-page-description">
          Progress through all six CEFR levels using
          interactive reading passages, vocabulary support,
          comprehension questions, Bloom's Taxonomy,
          immediate feedback, and measurable learning progress.
        </p>

        <p className="vocabulary-page-teacher">
          T. Wafa Al Hebsi
        </p>
      </section>

      <section className="vocabulary-levels-section">
        <div className="home-section-heading">
          <p>CEFR Reading Levels</p>

          <h2>Choose your reading level</h2>

          <span>
            Progress from A1 to C2 and track your reading
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
                  to={`/reading/${item.level}`}
                  className="vocabulary-start-button"
                >
                  Start Reading →
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

export default Reading;