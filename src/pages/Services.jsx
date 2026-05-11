import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SERVICES, SERVICE_ICONS } from "../constants/services";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: .55, delay: i * .1, ease: [.4, 0, .2, 1] },
  }),
};

export default function Services() {
  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ paddingTop: "7rem" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
          >
            <p className="section-eyebrow" style={{ color: "var(--accent-lt)" }}>Ce que nous proposons</p>
            <h1>Nos Services</h1>
            <p className="mt-2">Des prestations capillaires d'exception pour sublimer votre beauté.</p>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <section className="py-5" style={{ background: "var(--cream)" }}>
        <div className="container py-4">
          <div className="row g-4">
            {SERVICES.map((s, i) => (
              <div className="col-md-6 col-lg-4" key={s.id}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: .2 }}
                  custom={i % 3}
                  variants={fadeUp}
                  style={{ height: "100%" }}
                >
                  <div
                    className="service-card d-flex flex-column h-100"
                    style={{ position: "relative", overflow: "hidden" }}
                  >
                    {/* Decorative corner accent */}
                    <div
                      style={{
                        position: "absolute", top: 0, right: 0,
                        width: 80, height: 80,
                        background: "radial-gradient(circle at top right, rgba(212,168,83,.1) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />

                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <span className="service-icon" style={{ fontSize: "2.8rem", marginBottom: 0 }}>
                        {SERVICE_ICONS[s.id]}
                      </span>
                      <span className="service-duration">⏱ {s.duree}</span>
                    </div>

                    <h4 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.2rem", marginBottom: ".6rem" }}>
                      {s.nom}
                    </h4>
                    <p style={{ color: "var(--text-muted)", fontSize: ".9rem", lineHeight: 1.7, flex: 1 }}>
                      {s.description}
                    </p>

                    <div
                      style={{
                        borderTop: "1px solid var(--cream-dk)",
                        marginTop: "1.25rem",
                        paddingTop: "1.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: ".72rem", fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: ".2rem" }}>
                          Prix
                        </div>
                        <span className="service-price">{s.prix.toLocaleString("fr-FR")} DJF</span>
                      </div>
                      <Link
                        to={`/booking?service=${s.id}`}
                        className="btn-gold"
                        style={{ fontSize: ".88rem" }}
                      >
                        Réserver ce service
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section style={{ background: "var(--cream-dk)", padding: "4rem 0" }}>
        <div className="container">
          <div className="row g-4 text-center">
            {[
              { icon: "📍", title: "Adresse", text: "Avenue 13, Quartier Arhiba\nDjibouti-Ville" },
              { icon: "📞", title: "Téléphone", text: "+253 77 00 00 00" },
              { icon: "🕐", title: "Horaires", text: "Lundi – Samedi\n8h00 – 19h00" },
            ].map((item, i) => (
              <motion.div
                className="col-md-4"
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * .12 }}
              >
                <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: "2rem", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>{item.icon}</div>
                  <h6 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: ".4rem" }}>{item.title}</h6>
                  <p style={{ color: "var(--text-muted)", fontSize: ".9rem", whiteSpace: "pre-line", margin: 0 }}>{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
