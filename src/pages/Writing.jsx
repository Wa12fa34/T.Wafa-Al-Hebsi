import { Link } from "react-router-dom";

function Writing() {
  const levels = [
    {
      level: "A1",
      name: "Beginner",
      description:
        "Write simple sentences and short paragraphs about familiar topics, daily routines, and personal experiences.",
      available: true,
    },
    {
      level: "A2",
      name: "Elementary",
      description:
        "Develop short connected texts about everyday situations, experiences, people, places, and events.",
      available: false,
    },
    {
      level: "B1",
      name: "Intermediate",
      description:
        "Write organized texts, descriptions, opinions, and explanations using clear supporting details.",
      available: false,
    },
    {
      level: "B2",
      name: "Upper Intermediate",
      description:
        "Produce detailed and well-structured writing with developed arguments, evidence, and appropriate language.",
      available: false,
    },
    {
      level: "C1",
      name: "Advanced",
      description:
        "Create sophisticated academic and professional texts with strong organization, precision, and flexibility.",
      available: false,
    },
    {
      level: "C2",
      name: "Proficient",
      description:
        "Produce highly sophisticated, precise, coherent, and stylistically appropriate writing for complex purposes.",
      available: false,
    },
  ];

  return (
    <main className="vocabulary-page">
      <section className="vocabulary-page-hero">
        <div className="hero-badge">
          Writing Learning Pathway
        </div>

        <p className="vocabulary-page-school">
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>Develop Your Writing Skills</h1>

        <p className="vocabulary-page-description">
          Develop your writing from A1 to C2 through
          CEFR-aligned tasks, structured practice, clear
          assessment criteria, and meaningful feedback.
        </p>

        <p className="vocabulary-page-teacher">
          T. Wafa Al Hebsi
        </p>
      </section>

      <section className="vocabulary-levels-section">
        <div className="home-section-heading">
          <p>CEFR Writing Levels</p>

          <h2>Choose your writing level</h2>

          <span>
            Progress through all six CEFR levels and develop
            accuracy, organization, vocabulary, and effective
            written communication.
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
                  to={`/writing/${item.level}`}
                  className="vocabulary-start-button"
                >
                  Start Writing →
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

export default Writing;