import Navbar from "./Navbar.jsx";import "./App.css";
function App() {
  return (
    <div>
      <Navbar />

      <main id="home">
        <section className="hero-section">
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
      </main>
    </div>
  );
}

export default App;