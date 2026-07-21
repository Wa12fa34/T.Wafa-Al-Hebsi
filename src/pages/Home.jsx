import Navbar from "../components/Navbar.jsx";

function Home() {
  const skills = [
    {
      title: "Reading",
      icon: "📖",
      description:
        "Improve reading comprehension, inference, vocabulary in context, and critical-thinking skills.",
      buttonText: "Explore Reading",
    },
    {
      title: "Writing",
      icon: "✍️",
      description:
        "Develop clear paragraphs, organized ideas, accurate language, and confident writing skills.",
      buttonText: "Explore Writing",
    },
    {
      title: "Vocabulary",
      icon: "📚",
      description:
        "Learn useful English words through context, interactive activities, and meaningful practice.",
      buttonText: "Explore Vocabulary",
    },
    {
      title: "Grammar",
      icon: "🧩",
      description:
        "Practise grammar rules through clear explanations, examples, and interactive exercises.",
      buttonText: "Explore Grammar",
    },
  ];

  return (
    <div className="website">
      <Navbar />

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <p className="hero-label">
              Interactive English Learning Platform
            </p>

            <h1>
              Learn English.
              <br />
              Build Confidence.
              <br />
              Achieve Success.
            </h1>

            <p className="hero-description">
              Develop your reading, writing, vocabulary, and grammar skills
              through interactive activities, accurate feedback, and
              personalized learning.
            </p>

            <div className="hero-buttons">
              <a href="#skills" className="primary-btn">
                Start Learning
              </a>

              <a href="#about" className="secondary-btn">
                Learn More
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-icon">📚</div>

            <h2>Your English Journey Starts Here</h2>

            <p>
              Explore interactive lessons, complete learning activities, and
              monitor your progress.
            </p>

            <div className="progress-area">
              <div className="progress-header">
                <span>Learning Progress</span>
                <strong>75%</strong>
              </div>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="skills-section" id="skills">
          <div className="section-title">
            <p>Core English Skills</p>

            <h2>Choose Your Learning Area</h2>

            <span>
              Develop your English through focused, engaging, and interactive
              learning activities.
            </span>
          </div>

          <div className="skills-grid">
            {skills.map((skill) => (
              <article className="skill-card" key={skill.title}>
                <div className="skill-icon">{skill.icon}</div>

                <h3>{skill.title}</h3>

                <p>{skill.description}</p>

                <button type="button">{skill.buttonText}</button>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-content">
            <p className="about-label">About the Platform</p>

            <h2>Smart Learning for English Students</h2>

            <p>
              This platform supports students in developing essential English
              language skills through interactive learning, continuous
              feedback, and purposeful digital practice.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 English Learning Hub | T. Wafa Al Hebsi</p>
        <p>Zayed Educational Complex – Al Kharran</p>
      </footer>
    </div>
  );
}

export default Home;