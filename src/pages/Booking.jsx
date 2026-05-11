import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import emailjs from "emailjs-com";
import { insertAppointment } from "../lib/db";
import { SERVICES, SERVICE_ICONS, TIME_SLOTS } from "../constants/services";
import { STAFF } from "../constants/staff";

const STEPS = ["Service & Coiffeur", "Date & Heure", "Vos informations"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function todayMin() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isSunday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + "T00:00:00").getDay() === 0;
}

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: .35, ease: [.4, 0, .2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: .25 } }),
};

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1
  const [selectedService, setSelectedService] = useState(null);
  const [gender, setGender] = useState("femme");
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Step 2
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [dateError, setDateError] = useState("");

  // Step 3
  const [form, setForm] = useState({ prenom: "", nom: "", telephone: "", email: "", note: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-select service from query param
  useEffect(() => {
    const sid = parseInt(searchParams.get("service"));
    if (sid) {
      const svc = SERVICES.find((s) => s.id === sid);
      if (svc) setSelectedService(svc);
    }
  }, [searchParams]);

  // Reset staff when gender changes
  useEffect(() => { setSelectedStaff(null); }, [gender]);

  const goTo = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const validateStep1 = () => selectedService && selectedStaff;

  const validateStep2 = () => {
    if (!date) { setDateError("Veuillez choisir une date."); return false; }
    if (isSunday(date)) { setDateError("Le salon est fermé le dimanche."); return false; }
    if (!time) { setDateError("Veuillez choisir un créneau horaire."); return false; }
    setDateError("");
    return true;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = "Le prénom est requis.";
    if (!form.nom.trim()) e.nom = "Le nom est requis.";
    if (!form.telephone.trim()) e.telephone = "Le téléphone est requis.";
    if (!form.email.trim()) e.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) goTo(2);
    else if (step === 2 && validateStep2()) goTo(3);
  };

  const handleBack = () => goTo(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);

    const appointmentData = {
      client_firstname: form.prenom.trim(),
      client_lastname: form.nom.trim(),
      client_phone: form.telephone.trim(),
      client_email: form.email.trim(),
      service_name: selectedService.nom,
      service_price: selectedService.prix,
      coiffeur_nom: selectedStaff.nom,
      coiffeur_genre: selectedStaff.genre,
      appointment_date: date,
      appointment_time: time,
      note: form.note.trim() || null,
      status: "confirmed",
    };

    try {
      await insertAppointment(appointmentData);

      // Send email via EmailJS
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            to_name: `${form.prenom} ${form.nom}`,
            to_email: form.email,
            service_name: selectedService.nom,
            coiffeur_nom: selectedStaff.nom,
            appointment_date: formatDate(date),
            appointment_time: time,
            service_price: `${selectedService.prix.toLocaleString("fr-FR")} DJF`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch {
        // Email failure is non-blocking
      }

      toast.success("Rendez-vous confirmé !");
      navigate("/booking/success", {
        state: {
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          service: selectedService,
          staff: selectedStaff,
          date,
          time,
        },
      });
    } catch (err) {
      toast.error("Erreur lors de la réservation. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const staffList = STAFF[gender] || [];

  return (
    <div style={{ paddingTop: "80px", minHeight: "100vh", background: "var(--cream)" }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <p className="section-eyebrow" style={{ color: "var(--accent-lt)" }}>En ligne, 24h/24</p>
          <h1>Réserver un Rendez-vous</h1>
          <p className="mt-2">Choisissez votre service, votre coiffeur(se) et votre créneau.</p>
        </div>
      </div>

      <div className="container py-5">
        {/* Progress Steps */}
        <div className="booking-steps mb-5">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const isDone = step > n;
            const isActive = step === n;
            return (
              <div key={n} className="d-flex align-items-center" style={{ flex: n < STEPS.length ? 1 : "none" }}>
                <div className={`step-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                  <div className="step-circle">{isDone ? "✓" : n}</div>
                  <div className="step-label">{label}</div>
                </div>
                {n < STEPS.length && (
                  <div className={`step-connector ${isDone ? "done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="row g-4">
          {/* Main form area */}
          <div className="col-lg-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <div>
                    <div
                      style={{
                        background: "var(--white)",
                        borderRadius: "var(--radius-lg)",
                        padding: "2rem",
                        boxShadow: "var(--shadow-sm)",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h5 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: "1.25rem", color: "var(--dark)" }}>
                        A. Choisissez un service
                      </h5>
                      <div className="row g-3">
                        {SERVICES.map((s) => (
                          <div className="col-sm-6" key={s.id}>
                            <div
                              className={`service-card ${selectedService?.id === s.id ? "selected" : ""}`}
                              onClick={() => setSelectedService(s)}
                              style={{ padding: "1.25rem" }}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <span style={{ fontSize: "1.75rem" }}>{SERVICE_ICONS[s.id]}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: ".2rem" }}>{s.nom}</div>
                                  <div className="d-flex gap-2 align-items-center">
                                    <span className="service-duration" style={{ fontSize: ".68rem" }}>{s.duree}</span>
                                    <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--primary)", fontSize: ".95rem" }}>
                                      {s.prix.toLocaleString("fr-FR")} DJF
                                    </span>
                                  </div>
                                </div>
                                {selectedService?.id === s.id && (
                                  <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gender toggle */}
                    <div
                      style={{
                        background: "var(--white)",
                        borderRadius: "var(--radius-lg)",
                        padding: "2rem",
                        boxShadow: "var(--shadow-sm)",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h5 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: "1.25rem", color: "var(--dark)" }}>
                        B. Type de coiffeur(se)
                      </h5>
                      <div className="gender-toggle">
                        <button
                          className={`gender-btn ${gender === "femme" ? "active" : ""}`}
                          onClick={() => setGender("femme")}
                          type="button"
                        >
                          ♀ Coiffeuse
                        </button>
                        <button
                          className={`gender-btn ${gender === "homme" ? "active" : ""}`}
                          onClick={() => setGender("homme")}
                          type="button"
                        >
                          ♂ Coiffeur
                        </button>
                      </div>
                    </div>

                    {/* Staff selection */}
                    <div
                      style={{
                        background: "var(--white)",
                        borderRadius: "var(--radius-lg)",
                        padding: "2rem",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <h5 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: "1.25rem", color: "var(--dark)" }}>
                        C. Choisissez votre {gender === "femme" ? "coiffeuse" : "coiffeur"}
                      </h5>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={gender}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: .25 }}
                          className="row g-3"
                        >
                          {staffList.map((member) => (
                            <div className="col-sm-6 col-md-4" key={member.id}>
                              <div
                                className={`staff-card ${selectedStaff?.id === member.id ? "selected" : ""}`}
                                onClick={() => setSelectedStaff(member)}
                              >
                                <img src={member.photo} alt={member.nom} className="staff-avatar-sm" />
                                <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{member.nom}</div>
                                <div style={{ fontSize: ".78rem", color: "var(--text-muted)", marginTop: ".25rem" }}>{member.specialite}</div>
                                {selectedStaff?.id === member.id && (
                                  <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: ".8rem", marginTop: ".5rem" }}>✓ Sélectionné(e)</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                      <button
                        className="btn-gold"
                        onClick={handleNext}
                        disabled={!validateStep1()}
                        style={{ opacity: validateStep1() ? 1 : .5, cursor: validateStep1() ? "pointer" : "not-allowed", fontSize: "1rem", padding: ".75rem 2rem" }}
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <div
                    style={{
                      background: "var(--white)",
                      borderRadius: "var(--radius-lg)",
                      padding: "2rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <h5 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: "1.5rem", color: "var(--dark)" }}>
                      Choisissez une date & heure
                    </h5>

                    <div className="mb-4">
                      <label className="form-label-bc">Date du rendez-vous *</label>
                      <input
                        type="date"
                        className={`form-control-bc ${dateError ? "is-invalid" : ""}`}
                        value={date}
                        min={todayMin()}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setDateError("");
                        }}
                        style={{ maxWidth: "280px" }}
                      />
                      {date && isSunday(date) && (
                        <div className="invalid-feedback-bc">Le salon est fermé le dimanche.</div>
                      )}
                    </div>

                    <div>
                      <label className="form-label-bc">Créneau horaire *</label>
                      <div className="row g-2" style={{ maxWidth: "500px" }}>
                        {TIME_SLOTS.map((slot) => (
                          <div className="col-4 col-sm-3" key={slot}>
                            <div
                              className={`time-slot ${time === slot ? "selected" : ""}`}
                              onClick={() => setTime(slot)}
                            >
                              {slot}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {dateError && !date && (
                      <div className="invalid-feedback-bc mt-2">{dateError}</div>
                    )}
                    {dateError && !time && date && !isSunday(date) && (
                      <div className="invalid-feedback-bc mt-2">{dateError}</div>
                    )}

                    <div className="d-flex justify-content-between mt-4">
                      <button className="btn-outline-gold" onClick={handleBack}>
                        ← Retour
                      </button>
                      <button
                        className="btn-gold"
                        onClick={handleNext}
                        style={{ fontSize: "1rem", padding: ".75rem 2rem" }}
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && (
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      background: "var(--white)",
                      borderRadius: "var(--radius-lg)",
                      padding: "2rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                    noValidate
                  >
                    <h5 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: "1.5rem", color: "var(--dark)" }}>
                      Vos informations
                    </h5>

                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label-bc">Prénom *</label>
                        <input
                          type="text"
                          className={`form-control-bc ${errors.prenom ? "is-invalid" : ""}`}
                          placeholder="Votre prénom"
                          value={form.prenom}
                          onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                        />
                        {errors.prenom && <div className="invalid-feedback-bc">{errors.prenom}</div>}
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label-bc">Nom *</label>
                        <input
                          type="text"
                          className={`form-control-bc ${errors.nom ? "is-invalid" : ""}`}
                          placeholder="Votre nom"
                          value={form.nom}
                          onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        />
                        {errors.nom && <div className="invalid-feedback-bc">{errors.nom}</div>}
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label-bc">Téléphone *</label>
                        <input
                          type="tel"
                          className={`form-control-bc ${errors.telephone ? "is-invalid" : ""}`}
                          placeholder="+253 77 00 00 00"
                          value={form.telephone}
                          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                        />
                        {errors.telephone && <div className="invalid-feedback-bc">{errors.telephone}</div>}
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label-bc">Email *</label>
                        <input
                          type="email"
                          className={`form-control-bc ${errors.email ? "is-invalid" : ""}`}
                          placeholder="votre@email.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        {errors.email && <div className="invalid-feedback-bc">{errors.email}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label-bc">Note optionnelle</label>
                        <textarea
                          className="form-control-bc"
                          rows={3}
                          placeholder="Ex: allergie à certains produits, demande spéciale..."
                          value={form.note}
                          onChange={(e) => setForm({ ...form, note: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                      <button type="button" className="btn-outline-gold" onClick={handleBack}>
                        ← Retour
                      </button>
                      <button
                        type="submit"
                        className="btn-gold"
                        disabled={loading}
                        style={{ fontSize: "1rem", padding: ".75rem 2rem", opacity: loading ? .7 : 1 }}
                      >
                        {loading ? (
                          <span className="d-flex align-items-center gap-2">
                            <span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16, borderWidth: 2 }} />
                            Confirmation...
                          </span>
                        ) : (
                          "Confirmer le rendez-vous ✓"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Summary sidebar */}
          <div className="col-lg-4">
            <motion.div
              className="summary-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: .5, delay: .2 }}
            >
              <h5>📋 Récapitulatif</h5>

              <div className="summary-row">
                <span className="summary-label">Service</span>
                <span className="summary-value">
                  {selectedService ? selectedService.nom : <span style={{ opacity: .4, fontStyle: "italic" }}>Non sélectionné</span>}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Coiffeur(se)</span>
                <span className="summary-value">
                  {selectedStaff
                    ? `${selectedStaff.nom} (${selectedStaff.genre === "femme" ? "Coiffeuse ♀" : "Coiffeur ♂"})`
                    : <span style={{ opacity: .4, fontStyle: "italic" }}>Non sélectionné(e)</span>
                  }
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date</span>
                <span className="summary-value">
                  {date ? formatDate(date) : <span style={{ opacity: .4, fontStyle: "italic" }}>Non choisie</span>}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Heure</span>
                <span className="summary-value">
                  {time || <span style={{ opacity: .4, fontStyle: "italic" }}>Non choisi</span>}
                </span>
              </div>
              {selectedService && (
                <div className="summary-row summary-total">
                  <span className="summary-label" style={{ opacity: 1, fontWeight: 700 }}>Prix total</span>
                  <span className="summary-value">{selectedService.prix.toLocaleString("fr-FR")} DJF</span>
                </div>
              )}

              {/* Trust badges */}
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid rgba(212,168,83,.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: ".5rem",
                }}
              >
                {["🔒 Réservation sécurisée", "📧 Email de confirmation", "✓ Annulation gratuite"].map((t, i) => (
                  <div key={i} style={{ fontSize: ".78rem", opacity: .65, display: "flex", alignItems: "center", gap: ".5rem" }}>
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
