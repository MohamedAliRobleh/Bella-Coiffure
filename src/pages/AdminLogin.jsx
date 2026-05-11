import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      toast.error("Connexion échouée.");
    } else {
      toast.success("Connexion réussie !");
      navigate("/admin/dashboard");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, var(--dark) 0%, var(--dark-mid) 60%, var(--primary) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .5, ease: [.4, 0, .2, 1] }}
        style={{ width: "100%", maxWidth: "420px" }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
              marginBottom: ".25rem",
            }}
          >
            ✦ Bella Coiffure
          </div>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".8rem", letterSpacing: ".12em", textTransform: "uppercase" }}>
            Espace Administration
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212,168,83,.2)",
            borderRadius: "var(--radius-lg)",
            padding: "2.5rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--white)",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "1.75rem",
            }}
          >
            Se connecter
          </h4>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label
                className="form-label-bc"
                style={{ color: "rgba(255,255,255,.75)" }}
              >
                Email
              </label>
              <input
                type="email"
                className="form-control-bc"
                placeholder="admin@bellacoiffure.dj"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(212,168,83,.2)", color: "var(--white)" }}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label-bc"
                style={{ color: "rgba(255,255,255,.75)" }}
              >
                Mot de passe
              </label>
              <input
                type="password"
                className="form-control-bc"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(212,168,83,.2)", color: "var(--white)" }}
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "rgba(220,53,69,.15)",
                  border: "1px solid rgba(220,53,69,.3)",
                  borderRadius: "var(--radius)",
                  padding: ".75rem 1rem",
                  color: "#fca5a5",
                  fontSize: ".88rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="btn-gold w-100"
              disabled={loading}
              style={{ fontSize: "1rem", padding: ".8rem", width: "100%", textAlign: "center" }}
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
