import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { sendBookingConfirmation } from "../lib/email";
import { insertAppointment } from "../lib/db";
import { SERVICES, SERVICE_ICONS, TIME_SLOTS } from "../constants/services";
import { STAFF } from "../constants/staff";

const STEPS = ["Service & Coiffeur", "Date & Heure", "Vos informations"];

const STEP_INFO = [
  {
    title: "Service & Coiffeur(se)",
    desc: "Choisissez le soin qui vous convient et le professionnel qui vous accompagnera.",
  },
  {
    title: "Date & Heure",
    desc: "Sélectionnez un créneau dans notre calendrier. Nous sommes ouverts du lundi au samedi.",
  },
  {
    title: "Vos informations",
    desc: "Entrez vos coordonnées pour finaliser. Une confirmation email vous sera envoyée.",
  },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function todayMin() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSunday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + "T00:00:00").getDay() === 0;
}

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.18 } }),
};

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [selectedService, setSelectedService] = useState(null);
  const [gender, setGender] = useState("femme");
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [dateError, setDateError] = useState("");

  const [form, setForm] = useState({ prenom: "", nom: "", telephone: "", email: "", note: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sid = parseInt(searchParams.get("service"));
    if (sid) {
      const svc = SERVICES.find((s) => s.id === sid);
      if (svc) setSelectedService(svc);
    }
  }, [searchParams]);

  useEffect(() => { setSelectedStaff(null); }, [gender]);

  const goTo = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    document.querySelector(".booking-panel-right")?.scrollTo({ top: 0, behavior: "instant" });
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
      sendBookingConfirmation({
        prenom: form.prenom, nom: form.nom, email: form.email,
        service: selectedService, staff: selectedStaff, date, time,
      }).catch(() => {});
      toast.success("Rendez-vous confirmé !");
      navigate("/booking/success", {
        state: {
          prenom: form.prenom, nom: form.nom, email: form.email,
          service: selectedService, staff: selectedStaff, date, time,
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
    <div className="booking-layout">

      {/* ══════════════════════════════════════
          LEFT — Atmospheric panel
      ══════════════════════════════════════ */}
      <div className="booking-panel-left">
        {/* Brand */}
        <div className="booking-brand">
          <span className="booking-brand-logo">
            <span style={{ color: "var(--accent)", fontSize: "1.1rem" }}>✦</span>
            Bella Coiffure
          </span>

          {/* Animated step info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="booking-step-info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <span className="booking-step-number">{String(step).padStart(2, "0")}</span>
              <div className="booking-step-title">{STEP_INFO[step - 1].title}</div>
              <p className="booking-step-desc">{STEP_INFO[step - 1].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selection preview card */}
        <div className="booking-selection-card">
          <div className="booking-selection-eyebrow">Ma sélection</div>
          {[
            {
              key: "Service",
              val: selectedService?.nom,
            },
            {
              key: "Coiffeur(se)",
              val: selectedStaff?.nom
                ? `${selectedStaff.nom} ${selectedStaff.genre === "femme" ? "♀" : "♂"}`
                : null,
            },
            {
              key: "Date",
              val: date ? formatDate(date) : null,
            },
            { key: "Heure", val: time || null },
          ].map(({ key, val }) => (
            <div key={key} className="booking-selection-row">
              <span className="booking-selection-key">{key}</span>
              <span className="booking-selection-val">
                {val || <span style={{ opacity: 0.2 }}>—</span>}
              </span>
            </div>
          ))}
          {selectedService && (
            <div className="booking-selection-total">
              <span className="booking-selection-total-label">Total</span>
              <span className="booking-selection-total-price">
                {selectedService.prix.toLocaleString("fr-FR")} DJF
              </span>
            </div>
          )}
        </div>

        {/* Step dots */}
        <div className="booking-step-dots">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const isActive = step === n;
            const isDone = step > n;
            return (
              <div key={n} className={`booking-dot-row ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                <div className={`booking-dot ${isActive ? "active" : ""} ${isDone ? "done" : ""}`} />
                <span className="booking-dot-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — Form panel
      ══════════════════════════════════════ */}
      <div className="booking-panel-right">
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          {/* Progress bar */}
          <div className="booking-progress">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`booking-progress-seg ${step > n ? "done" : ""} ${step === n ? "active" : ""}`}
              />
            ))}
          </div>

          {/* Step heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`heading-${step}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="booking-step-heading"
            >
              <span className="booking-step-heading-label">Étape {step} sur 3</span>
              <h2>{STEP_INFO[step - 1].title}</h2>
            </motion.div>
          </AnimatePresence>

          {/* Step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >

              {/* ── STEP 1 — Service & Staff ── */}
              {step === 1 && (
                <div>
                  <p className="form-section-label">Service</p>
                  <div className="d-flex flex-column gap-2 mb-4">
                    {SERVICES.map((s) => (
                      <div
                        key={s.id}
                        className={`svc-card-v2 ${selectedService?.id === s.id ? "selected" : ""}`}
                        onClick={() => setSelectedService(s)}
                      >
                        <span className="svc-icon-v2">{SERVICE_ICONS[s.id]}</span>
                        <div style={{ flex: 1 }}>
                          <div className="svc-name">{s.nom}</div>
                          <div className="svc-meta">
                            <span className="service-duration" style={{ fontSize: ".7rem" }}>{s.duree}</span>
                            <span style={{
                              fontFamily: "'Playfair Display',serif",
                              fontWeight: 700,
                              color: "var(--primary)",
                              fontSize: ".9rem",
                            }}>
                              {s.prix.toLocaleString("fr-FR")} DJF
                            </span>
                          </div>
                        </div>
                        <div className="svc-check">✓</div>
                      </div>
                    ))}
                  </div>

                  <p className="form-section-label">Type de coiffeur(se)</p>
                  <div className="mb-4">
                    <div className="gender-toggle-v2">
                      <button
                        className={`gender-btn-v2 ${gender === "femme" ? "active" : ""}`}
                        onClick={() => setGender("femme")}
                        type="button"
                      >
                        ♀ Coiffeuse
                      </button>
                      <button
                        className={`gender-btn-v2 ${gender === "homme" ? "active" : ""}`}
                        onClick={() => setGender("homme")}
                        type="button"
                      >
                        ♂ Coiffeur
                      </button>
                    </div>
                  </div>

                  <p className="form-section-label">
                    {gender === "femme" ? "Votre coiffeuse" : "Votre coiffeur"}
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={gender}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="row g-3 mb-2"
                    >
                      {staffList.map((member) => (
                        <div className="col-6 col-md-4" key={member.id}>
                          <div
                            className={`staff-card-v2 ${selectedStaff?.id === member.id ? "selected" : ""}`}
                            onClick={() => setSelectedStaff(member)}
                          >
                            <div className="staff-ring">
                              <img src={member.photo} alt={member.nom} />
                            </div>
                            <div className="staff-name-v2">{member.nom}</div>
                            <div className="staff-spec-v2">{member.specialite}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

                  <div className="booking-nav" style={{ justifyContent: "flex-end" }}>
                    <button className="btn-next" onClick={handleNext} disabled={!validateStep1()}>
                      Continuer <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2 — Date & Time ── */}
              {step === 2 && (
                <div>
                  <p className="form-section-label">Date du rendez-vous</p>
                  <div className="mb-5">
                    <input
                      type="date"
                      className={`form-control-bc ${dateError && !date ? "is-invalid" : ""}`}
                      value={date}
                      min={todayMin()}
                      onChange={(e) => { setDate(e.target.value); setDateError(""); }}
                      style={{ maxWidth: "230px" }}
                    />
                    {date && isSunday(date) && (
                      <div className="invalid-feedback-bc mt-2">Le salon est fermé le dimanche.</div>
                    )}
                    {dateError && !date && (
                      <div className="invalid-feedback-bc mt-2">{dateError}</div>
                    )}
                  </div>

                  <p className="form-section-label">Créneau horaire</p>
                  <div className="time-grid mb-2">
                    {TIME_SLOTS.map((slot) => (
                      <div
                        key={slot}
                        className={`time-pill ${time === slot ? "selected" : ""}`}
                        onClick={() => setTime(slot)}
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                  {dateError && !time && date && !isSunday(date) && (
                    <div className="invalid-feedback-bc mt-2">{dateError}</div>
                  )}

                  <div className="booking-nav">
                    <button className="btn-back-v2" onClick={handleBack}>← Retour</button>
                    <button className="btn-next" onClick={handleNext}>Continuer →</button>
                  </div>
                </div>
              )}

              {/* ── STEP 3 — Info client ── */}
              {step === 3 && (
                <form onSubmit={handleSubmit} noValidate>
                  <p className="form-section-label">Vos coordonnées</p>
                  <div className="row g-4 mb-1">
                    <div className="col-sm-6">
                      <div className="field-wrap">
                        <input
                          type="text"
                          className={`field-input ${errors.prenom ? "is-invalid" : ""}`}
                          placeholder=" "
                          value={form.prenom}
                          onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                        />
                        <label className="field-label">Prénom *</label>
                      </div>
                      {errors.prenom && <div className="invalid-feedback-bc">{errors.prenom}</div>}
                    </div>
                    <div className="col-sm-6">
                      <div className="field-wrap">
                        <input
                          type="text"
                          className={`field-input ${errors.nom ? "is-invalid" : ""}`}
                          placeholder=" "
                          value={form.nom}
                          onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        />
                        <label className="field-label">Nom *</label>
                      </div>
                      {errors.nom && <div className="invalid-feedback-bc">{errors.nom}</div>}
                    </div>
                    <div className="col-sm-6">
                      <div className="field-wrap">
                        <input
                          type="tel"
                          className={`field-input ${errors.telephone ? "is-invalid" : ""}`}
                          placeholder=" "
                          value={form.telephone}
                          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                        />
                        <label className="field-label">Téléphone *</label>
                      </div>
                      {errors.telephone && <div className="invalid-feedback-bc">{errors.telephone}</div>}
                    </div>
                    <div className="col-sm-6">
                      <div className="field-wrap">
                        <input
                          type="email"
                          className={`field-input ${errors.email ? "is-invalid" : ""}`}
                          placeholder=" "
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <label className="field-label">Email *</label>
                      </div>
                      {errors.email && <div className="invalid-feedback-bc">{errors.email}</div>}
                    </div>
                    <div className="col-12">
                      <div className="field-wrap">
                        <textarea
                          className="field-input"
                          rows={3}
                          placeholder=" "
                          value={form.note}
                          onChange={(e) => setForm({ ...form, note: e.target.value })}
                          style={{ resize: "none" }}
                        />
                        <label className="field-label">Note optionnelle</label>
                      </div>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div style={{
                    display: "flex",
                    gap: "1.25rem",
                    marginTop: "1.25rem",
                    marginBottom: "0",
                    padding: ".85rem 1rem",
                    background: "rgba(212,168,83,.06)",
                    border: "1px solid rgba(212,168,83,.15)",
                    borderRadius: "10px",
                  }}>
                    {["🔒 Réservation sécurisée", "📧 Confirmation email", "✓ Annulation gratuite"].map((t, i) => (
                      <div key={i} style={{ fontSize: ".72rem", color: "var(--text-muted)", fontWeight: 600 }}>{t}</div>
                    ))}
                  </div>

                  <div className="booking-nav">
                    <button type="button" className="btn-back-v2" onClick={handleBack}>← Retour</button>
                    <button
                      type="submit"
                      className="btn-next"
                      disabled={loading}
                      style={{ opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? (
                        <span className="d-flex align-items-center gap-2">
                          <span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16, borderWidth: 2 }} />
                          Confirmation...
                        </span>
                      ) : "Confirmer le rendez-vous ✓"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
