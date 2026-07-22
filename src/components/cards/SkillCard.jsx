import { Link } from "react-router-dom";

function SkillCard({ icon, title, description, buttonText, link }) {
  return (
    <div className="skill-card">
      <div className="skill-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{description}</p>

      <Link to={link} className="skill-card-link">
        {buttonText}
      </Link>
    </div>
  );
}

export default SkillCard;