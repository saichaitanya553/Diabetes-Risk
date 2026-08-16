import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">🩺</span>
        <span>Gluco<span>Sense</span></span>
      </Link>

      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/predict"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Predict Risk
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          History
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          About
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;