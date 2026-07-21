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
        <a href="#home">Home</a>
        <a href="#skills">Skills</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>

        <button className="login-btn">Login</button>
      </nav>
    </header>
  );
}

export default Navbar;