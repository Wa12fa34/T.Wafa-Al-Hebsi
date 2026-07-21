import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">E</div>

        <div>
          <h2>English Learning Hub</h2>
          <p>Zayed Educational Complex – Al Kharran</p>
        </div>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/reading">Reading</Link>

        <Link to="/writing">Writing</Link>

        <Link to="/vocabulary">Vocabulary</Link>

        <Link to="/grammar">Grammar</Link>

        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;