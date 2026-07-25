import { useEffect, useState } from "react";
import SkillCard from "../components/cards/SkillCard.jsx";

function Home() {
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("studentProfile");

    if (savedProfile) {
      try {
        setStudentProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Unable to read student profile:", error);
      }
    }
  }, []);

  const skills = [
    {
      title: "Reading",
      description:
        "Build comprehension, inference, vocabulary-in-context, and critical reading skills through CEFR-based passages.",
      link: "/reading",
      icon: "📖",
    },
    {
      title: "Writing",
      description:
        "Develop structured writing through guided tasks, feedback, reflection, and CEFR-aligned practice.",
      link: "/writing",
      icon: "✍️",
    },
    {
      title: "Vocabulary",
      description:
        "Expand academic and everyday vocabulary through context, examples, practice, and personalised review.",
      link: "/vocabulary",
      icon: "🔤",
    },
    {
      title: "Grammar",
      description:
        "Strengthen grammar accuracy through interactive practice, feedback, and progressive language challenges.",
      link: "/grammar",
      icon: "🧩",
    },
  ];

  const cefrLevels = [
    {
      level: "A1",
      name: "Beginner",
    },
    {
      level: "A2",
      name: "Elementary",
    },
    {
      level: "B1",
      name: "Intermediate",
    },
    {
      level: "B2",
      name: "Upper Intermediate",
    },
    {
      level: "C1",
      name: "Advanced",
    },
    {
      level: "C2",
      name: "Proficient",
    },
  ];

  return (
    <main className="home-page">

      {studentProfile && (
        <section className="student-welcome-card">
          <div>
            <p className="welcome-label">
              Welcome back 👋
            </p>

            <h2>
              {studentProfile.student_name}
            </h2>
          </div>

          <div className="student-welcome-details">
            <p>
              <strong>Class:</strong>{" "}
              {studentProfile.class_name || "Not assigned"}
            </p>

            <p>
              <strong>CEFR:</strong>{" "}
              {studentProfile.cefr_level || "Not assigned"}
            </p>
          </div>
        </section>
      )}

      <section className="home-hero">

        <div className="hero-badge">
          AI-Supported English Learning
        </div>

        <p className="home-school-name">
          Zayed Educational Complex-Al Kharran
        </p>

        <h1>
          Learn English with confidence.
        </h1>

        <p className="home-hero-subtitle">
          An interactive learning platform for developing
          Reading, Writing, Vocabulary, and Grammar through
          CEFR levels, meaningful feedback, and personalised
          learning progress.
        </p>

        <div className="home-hero-actions">
          <a
            href="/reading"
            className="hero-primary-button"
          >
            Start Learning
          </a>

          <a
            href="/progress"
            className="hero-secondary-button"
          >
            View My Progress
          </a>
        </div>

        <p className="home-teacher-name">
          Designed by T. Wafa Al Hebsi
        </p>

      </section>

      <section className="home-skills-section">

        <div className="home-section-heading">
          <p>Core English Skills</p>

          <h2>
            Choose your learning pathway
          </h2>

          <span>
            Each skill is designed to support measurable
            progress and personalised learning.
          </span>
        </div>

        <div className="skills-grid">
          {skills.map((skill) => (
            <article
              className="home-skill-card"
              key={skill.title}
            >
              <div className="home-skill-icon">
                {skill.icon}
              </div>

              <SkillCard
                title={skill.title}
                description={skill.description}
                link={skill.link}
              />
            </article>
          ))}
        </div>

      </section>

      <section className="home-cefr-section">

        <div className="home-section-heading">
          <p>CEFR Learning Pathway</p>

          <h2>
            Progress through all six CEFR levels
          </h2>

          <span>
            Develop your English from A1 foundation level
            to C2 proficiency through structured,
            measurable learning.
          </span>
        </div>

        <div className="cefr-level-grid">
          {cefrLevels.map((item) => (
            <div
              className="cefr-home-card"
              key={item.level}
            >
              <span>CEFR</span>

              <strong>{item.level}</strong>

              <p>{item.name}</p>
            </div>
          ))}
        </div>

      </section>

      <section className="learning-journey-section">

        <div className="learning-journey-content">

          <div>
            <p className="journey-label">
              Your Learning Journey
            </p>

            <h2>
              Learn. Practise. Receive feedback. Improve.
            </h2>

            <p>
              Your performance is recorded after each activity,
              helping you track your progress across English skills
              and all six CEFR levels.
            </p>
          </div>

          <div className="journey-steps">

            <div>
              <strong>01</strong>
              <span>Choose a skill</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Complete an activity</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Receive feedback</span>
            </div>

            <div>
              <strong>04</strong>
              <span>Track your progress</span>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;