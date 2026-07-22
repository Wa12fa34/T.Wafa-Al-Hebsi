import { Link } from "react-router-dom";

function LevelCard({ level, description }) {
  return (
    <article className="level-card">
      <div className="level-badge">{level}</div>

      <h3>CEFR Level {level}</h3>

      <p>{description}</p>

      <Link to={`/reading/${level}`} className="level-button">
        Start Level
      </Link>
    </article>
  );
}

export default LevelCard;