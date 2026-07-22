function LevelCard({ level, description }) {
  return (
    <article className="level-card">
      <div className="level-badge">{level}</div>

      <h3>CEFR Level {level}</h3>

      <p>{description}</p>

      <button type="button">Start Level</button>
    </article>
  );
}

export default LevelCard;