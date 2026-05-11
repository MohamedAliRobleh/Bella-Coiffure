import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function BookingSuccess() {
  const { state } = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "80px",
        padding: "6rem 1rem 4rem",
      }}
    >
      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: .1 }}
          className="success-checkmark"
        >
          ✓
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, delay: .3 }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              fontWeight: 800,
              color: "var(--dark)",
              marginBottom: ".75rem",
            }}
          >
            Rendez-vous confirmé !
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "2rem" }}>
            {state?.email
              ? `Un email de confirmation a été envoyé à ${state.email}`
              : "Votre rendez-vous a bien été enregistré."}
          </p>

          {/* Recap card */}
          {state && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .45 }}
              style={{
                background: "linear-gradient(135deg, var(--dark) 0%, var(--dark-mid) 100%)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                textAlign: "left",
                marginBottom: "2rem",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h5
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--accent)",
                  marginBottom: "1.25rem",
                  paddingBottom: ".75rem",
                  borderBottom: "1px solid rgba(212,168,83,.2)",
                }}
              >
                📋 Détails du rendez-vous
              </h5>

              {[
                { label: "Client(e)", value: `${state.prenom} ${state.nom}` },
                { label: "Service", value: state.service?.nom },
                { label: "Coiffeur(se)", value: `${state.staff?.nom} (${state.staff?.genre === "femme" ? "Coiffeuse ♀" : "Coiffeur ♂"})` },
                { label: "Date", value: formatDate(state.date) },
                { label: "Heure", value: state.time },
                { label: "Prix", value: state.service ? `${state.service.prix.toLocaleString("fr-FR")} DJF` : "" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: ".65rem",
                    fontSize: ".9rem",
                    color: "var(--white)",
                  }}
                >
                  <span style={{ opacity: .6, minWidth: "100px" }}>{row.label}</span>
                  <span style={{ fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{row.value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .6 }}
            style={{
              background: "rgba(212,168,83,.1)",
              border: "1px solid rgba(212,168,83,.3)",
              borderRadius: "var(--radius)",
              padding: "1rem 1.25rem",
              marginBottom: "2rem",
              textAlign: "left",
              fontSize: ".88rem",
              color: "var(--dark-mid)",
            }}
          >
            <strong style={{ color: "var(--primary)" }}>📍 Nous vous attendons au salon :</strong>
            <br />Avenue 13, Quartier Arhiba, Djibouti-Ville · <strong>+253 77 00 00 00</strong>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .7 }}
            className="d-flex flex-wrap gap-3 justify-content-center"
          >
            <Link to="/" className="btn-gold" style={{ fontSize: "1rem", padding: ".75rem 2rem" }}>
              Retour à l'accueil
            </Link>
            <Link to="/booking" className="btn-outline-gold" style={{ fontSize: "1rem" }}>
              Nouveau rendez-vous
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
