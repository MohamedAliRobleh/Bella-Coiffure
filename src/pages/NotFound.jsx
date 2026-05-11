import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .6 }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(5rem, 15vw, 10rem)",
            fontWeight: 900,
            color: "transparent",
            WebkitTextStroke: "2px var(--accent)",
            lineHeight: 1,
            marginBottom: ".5rem",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 700,
            color: "var(--dark)",
            marginBottom: "1rem",
          }}
        >
          Page introuvable
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "380px", margin: "0 auto 2rem", fontSize: "1.05rem" }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <Link to="/" className="btn-gold" style={{ fontSize: "1rem", padding: ".75rem 2rem" }}>
            Retour à l'accueil
          </Link>
          <Link to="/booking" className="btn-outline-gold" style={{ fontSize: "1rem" }}>
            Réserver un RDV
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
