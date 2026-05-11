import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: "var(--dark)", color: "rgba(255,255,255,.75)", padding: "4rem 0 2rem" }}>
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand */}
          <div className="col-lg-4">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)", marginBottom: ".75rem" }}>
              ✦ Bella Coiffure
            </div>
            <p style={{ fontSize: ".9rem", opacity: .75, lineHeight: 1.7, maxWidth: "280px" }}>
              Votre salon de coiffure professionnel à Djibouti. Beauté, élégance et savoir-faire africain.
            </p>
            <div className="d-flex gap-3 mt-3">
              {["📘", "📸", "📱"].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 40, height: 40,
                    borderRadius: "50%",
                    background: "rgba(212,168,83,.12)",
                    border: "1px solid rgba(212,168,83,.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem",
                    transition: "all .3s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(212,168,83,.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(212,168,83,.12)"}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="col-sm-6 col-lg-2 offset-lg-1">
            <h6 style={{ color: "var(--accent)", fontFamily: "'Lato',sans-serif", fontSize: ".75rem", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Navigation
            </h6>
            {[
              { to: "/", label: "Accueil" },
              { to: "/services", label: "Services" },
              { to: "/booking", label: "Réserver" },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={{ display: "block", marginBottom: ".5rem", fontSize: ".9rem", opacity: .75, transition: "opacity .2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = .75}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="col-sm-6 col-lg-4 offset-lg-1">
            <h6 style={{ color: "var(--accent)", fontFamily: "'Lato',sans-serif", fontSize: ".75rem", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Contact
            </h6>
            {[
              { icon: "📍", text: "Avenue 13, Quartier Arhiba, Djibouti-Ville" },
              { icon: "📞", text: "+253 77 00 00 00" },
              { icon: "✉️", text: "contact@bellacoiffure.dj" },
              { icon: "🕐", text: "Lun-Sam : 8h00 – 19h00" },
            ].map((item, i) => (
              <div key={i} className="d-flex gap-2 mb-2" style={{ fontSize: ".88rem", opacity: .8 }}>
                <span style={{ fontSize: ".95rem", minWidth: "20px" }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(212,168,83,.15)", paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: ".5rem" }}>
          <p style={{ fontSize: ".8rem", opacity: .5, margin: 0 }}>
            © 2025 Bella Coiffure. Tous droits réservés.
          </p>
          <p style={{ fontSize: ".8rem", opacity: .5, margin: 0 }}>
            Djibouti-Ville, République de Djibouti
          </p>
        </div>
      </div>
    </footer>
  );
}
