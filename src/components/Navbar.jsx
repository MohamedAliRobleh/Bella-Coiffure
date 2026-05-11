import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/services", label: "Services" },
  ];

  return (
    <nav className={`bc-navbar navbar navbar-expand-lg fixed-top ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Link to="/" className="navbar-brand">
          ✦ Bella Coiffure
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          style={{ color: "var(--primary)" }}
        >
          <span style={{ fontSize: "1.4rem" }}>{open ? "✕" : "☰"}</span>
        </button>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  to={l.to}
                  end
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="nav-item ms-2">
              <Link to="/booking" className="btn-gold" style={{ fontSize: ".9rem" }}>
                Réserver
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "rgba(253,246,238,.98)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(212,168,83,.2)",
              padding: "1rem 1.5rem",
              boxShadow: "0 8px 32px rgba(44,24,16,.12)",
            }}
            className="d-lg-none"
          >
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) => `d-block py-2 fw-bold ${isActive ? "text-accent" : "text-dark-bc"}`}
                style={{ fontSize: ".95rem", letterSpacing: ".06em", textTransform: "uppercase" }}
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/booking"
              onClick={() => setOpen(false)}
              className="btn-gold d-inline-block mt-3"
            >
              Réserver maintenant
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
