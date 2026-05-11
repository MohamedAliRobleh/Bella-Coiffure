import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PHOTOS } from "../constants/photos";
import { SERVICES, SERVICE_ICONS } from "../constants/services";
import { STAFF } from "../constants/staff";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: .6, delay: i * .12, ease: [.4, 0, .2, 1] } }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: .8 } },
};

const GALLERY = [
  PHOTOS.GALLERY_1,
  PHOTOS.GALLERY_2,
  PHOTOS.GALLERY_3,
  PHOTOS.GALLERY_4,
  PHOTOS.GALLERY_5,
  PHOTOS.GALLERY_6,
];

const TESTIMONIALS = [
  { stars: 5, text: "Le meilleur salon de Djibouti ! Amina a réalisé mes tresses africaines avec une précision remarquable. Je reviens chaque mois sans hésitation.", author: "Fatouma I." },
  { stars: 5, text: "Service impeccable, ambiance chaleureuse et résultat époustouflant. Ma coloration est exactement ce que j'avais en tête. Merci Hawa !", author: "Hodan A." },
  { stars: 5, text: "Accueil très professionnel et prix raisonnables. Mon brushing a duré toute la semaine. Je recommande vivement Bella Coiffure à toutes mes amies.", author: "Zahra M." },
];

const ALL_STAFF = [...STAFF.femme, ...STAFF.homme];

export default function Home() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-section">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(${PHOTOS.HERO})` }}
        />
        <div className="hero-overlay" />

        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: .15 } } }}
        >
          <motion.div variants={fadeUp} className="hero-badge">
            ✦ Salon Professionnel — Djibouti
          </motion.div>
          <motion.h1 className="hero-title" variants={fadeUp}>
            Votre beauté,<br />
            <span>notre passion</span>
          </motion.h1>
          <motion.p className="hero-subtitle" variants={fadeUp}>
            Salon de coiffure professionnel pour femmes et hommes à Djibouti.
            L'excellence capillaire au cœur de l'Afrique.
          </motion.p>
          <motion.div variants={fadeUp} className="d-flex flex-wrap gap-3 justify-content-center">
            <Link to="/booking" className="btn-gold" style={{ fontSize: "1.05rem", padding: ".8rem 2rem" }}>
              Prendre Rendez-vous
            </Link>
            <Link to="/services" className="btn-outline-gold" style={{ fontSize: "1.05rem", padding: ".75rem 1.75rem" }}>
              Nos Services
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} className="d-flex flex-wrap gap-4 justify-content-center mt-4" style={{ color: "rgba(255,255,255,.7)", fontSize: ".85rem" }}>
            {["5★ sur Google", "500+ clientes satisfaites", "Ouvert 6j/7"].map((t, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                <span style={{ color: "var(--accent)" }}>✓</span> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <div className="hero-scroll-indicator">↓</div>
      </section>

      {/* ── Services ─────────────────────────────────────── */}
      <section className="py-5" style={{ background: "var(--cream)" }} id="services">
        <div className="container py-4">
          <motion.div
            className="text-center mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: .3 }}
            variants={fadeUp}
          >
            <p className="section-eyebrow">Ce que nous faisons</p>
            <h2 className="section-title">Nos Services</h2>
            <div className="section-divider mx-auto" />
            <p className="mt-3" style={{ color: "var(--text-muted)", maxWidth: "520px", margin: "1rem auto 0" }}>
              Des prestations capillaires d'exception, adaptées à toutes les textures de cheveux.
            </p>
          </motion.div>

          <div className="row g-4">
            {SERVICES.map((s, i) => (
              <div className="col-sm-6 col-lg-4" key={s.id}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: .2 }}
                  custom={i % 3}
                  variants={fadeUp}
                >
                  <div className="service-card d-flex flex-column">
                    <span className="service-icon">{SERVICE_ICONS[s.id]}</span>
                    <h5 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: ".4rem" }}>{s.nom}</h5>
                    <p style={{ color: "var(--text-muted)", fontSize: ".9rem", flex: 1 }}>{s.description}</p>
                    <div className="d-flex align-items-center justify-content-between mt-3 mb-3">
                      <span className="service-price">{s.prix.toLocaleString("fr-FR")} DJF</span>
                      <span className="service-duration">⏱ {s.duree}</span>
                    </div>
                    <Link to={`/booking?service=${s.id}`} className="btn-gold text-center w-100">
                      Réserver
                    </Link>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <Link to="/services" className="btn-outline-gold">
              Voir tous les services →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────── */}
      <section className="py-5" style={{ background: "var(--cream-dk)" }}>
        <div className="container py-4">
          <motion.div
            className="text-center mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: .3 }}
            variants={fadeUp}
          >
            <p className="section-eyebrow">Nos réalisations</p>
            <h2 className="section-title">Notre Galerie</h2>
            <div className="section-divider mx-auto" />
          </motion.div>

          <motion.div
            className="gallery-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: .15 }}
            variants={fadeIn}
          >
            {GALLERY.map((url, i) => (
              <div className="gallery-item" key={i}>
                <img src={url} alt={`Réalisation ${i + 1}`} loading="lazy" />
                <div className="gallery-overlay">🔍</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────── */}
      <section className="py-5" style={{ background: "var(--cream)" }}>
        <div className="container py-4">
          <motion.div
            className="text-center mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: .3 }}
            variants={fadeUp}
          >
            <p className="section-eyebrow">Nos experts</p>
            <h2 className="section-title">Notre Équipe</h2>
            <div className="section-divider mx-auto" />
            <p className="mt-3" style={{ color: "var(--text-muted)", maxWidth: "460px", margin: "1rem auto 0" }}>
              Des professionnels passionnés, formés aux dernières tendances capillaires.
            </p>
          </motion.div>

          <div className="row g-4 justify-content-center">
            {ALL_STAFF.map((member, i) => (
              <div className="col-sm-6 col-md-4 col-lg" key={member.id} style={{ minWidth: "180px" }}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: .2 }}
                  custom={i}
                  variants={fadeUp}
                  className="team-card"
                >
                  <img src={member.photo} alt={member.nom} className="team-avatar" />
                  <h6 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: ".3rem" }}>
                    {member.nom}
                  </h6>
                  <p style={{ fontSize: ".82rem", color: "var(--text-muted)", marginBottom: ".75rem" }}>
                    {member.specialite}
                  </p>
                  <span className={member.genre === "femme" ? "badge-femme" : "badge-homme"}>
                    {member.genre === "femme" ? "♀ Coiffeuse" : "♂ Coiffeur"}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-5" style={{ background: "linear-gradient(135deg, var(--cream-dk) 0%, var(--cream) 100%)" }}>
        <div className="container py-4">
          <motion.div
            className="text-center mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: .3 }}
            variants={fadeUp}
          >
            <p className="section-eyebrow">Elles nous font confiance</p>
            <h2 className="section-title">Témoignages</h2>
            <div className="section-divider mx-auto" />
          </motion.div>

          <div className="row g-4">
            {TESTIMONIALS.map((t, i) => (
              <div className="col-md-4" key={i}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: .2 }}
                  custom={i}
                  variants={fadeUp}
                  className="testimonial-card"
                >
                  <div className="testimonial-stars mb-2">
                    {"⭐".repeat(t.stars)}
                  </div>
                  <p className="testimonial-text mb-3">"{t.text}"</p>
                  <div className="testimonial-author">— {t.author}</div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, var(--primary) 100%)", padding: "5rem 0", textAlign: "center" }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: .4 }}
            variants={fadeUp}
          >
            <p className="section-eyebrow" style={{ color: "var(--accent-lt)" }}>Prêt(e) à vous transformer ?</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--white)", fontWeight: 800, marginBottom: "1rem" }}>
              Réservez votre rendez-vous
            </h2>
            <p style={{ color: "rgba(255,255,255,.75)", marginBottom: "2rem", maxWidth: "440px", margin: "0 auto 2rem" }}>
              Offrez-vous une expérience capillaire unique. Notre équipe vous attend.
            </p>
            <Link to="/booking" className="btn-gold" style={{ fontSize: "1.1rem", padding: ".9rem 2.5rem" }}>
              Prendre Rendez-vous
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
