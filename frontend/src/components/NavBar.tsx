const NavBar = () => {
  return (
    <nav className="landing-nav" aria-label="Primary">
      <div className="landing-nav__links">
        <a className="landing-nav__link" href="/admin">
          Admin Login
        </a>
        <a className="landing-nav__link" href="/login/">
          Customer Login
        </a>
      </div>
    </nav>
  );
};

export default NavBar;
