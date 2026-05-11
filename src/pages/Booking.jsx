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
    desc: "Entrez vos coordonnées pour finaliser la réservation. Une confirmation vous sera envoyée par email.",
  },
];

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
  enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.2 } }),
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
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        service: selectedService,
        staff: selectedStaff,
        date,
        time,
      }).catch(() => {});
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
    <div className="booking-layout">
      {/* ── LEFT ATMOSPHERIC PANEL ── */}
      <div className="booking-panel-left" style={{ paddingTop: "calc(80px + 1.5rem)" }}>
        <div className="booking-brand">
          <span className="booking-brand-logo">✦ Bella Coiffure</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="booking-step-info"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <span className="booking-step-number">{String(step).padStart(2, "0")}</span>
              <div className="booking-step-title">{STEP_INFO[step - 1].title}</div>
              <p className="booking-step-desc">{STEP_INFO[step - 1].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

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

      {/* ── RIGHT FORM PANEL ── */}
      <div className="booking-panel-right">
        <div className="row g-4">
          {/* Main form */}
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
                    <p className="form-section-label">A — Service</p>
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
                              <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--primary)", fontSize: ".92rem" }}>
                                {s.prix.toLocaleString("fr-FR")} DJF
                              </span>
                            </div>
                          </div>
                          <div className="svc-check">✓</div>
                        </div>
                      ))}
                    </div>

                    <p className="form-section-label">B — Type de coiffeur(se)</p>
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
                      C — {gender === "femme" ? "Votre coiffeuse" : "Votre coiffeur"}
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={gender}
                        initial={{ opacity: 0, y: 8 }}
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

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <div>
                    <p className="form-section-label">Date du rendez-vous</p>
                    <div className="mb-4">
                      <input
                        type="date"
                        className={`form-control-bc ${dateError && !date ? "is-invalid" : ""}`}
                        value={date}
                        min={todayMin()}
                        onChange={(e) => { setDate(e.target.value); setDateError(""); }}
                        style={{ maxWidth: "240px" }}
                      />
                      {date && isSunday(date) && (
                        <div className="invalid-feedback-bc mt-2">Le salon est fermé le dimanche.</div>
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

                    {dateError && !date && <div className="invalid-feedback-bc mt-2">{dateError}</div>}
                    {dateError && !time && date && !isSunday(date) && (
                      <div className="invalid-feedback-bc mt-2">{dateError}</div>
                    )}

                    <div className="booking-nav">
                      <button className="btn-back-v2" onClick={handleBack}>← Retour</button>
                      <button className="btn-next" onClick={handleNext}>Continuer →</button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 ── */}
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

                    <div className="booking-nav">
                      <button type="button" className="btn-back-v2" onClick={handleBack}>
                        ← Retour
                      </button>
                      <button
                        type="submit"
                        className="btn-next"
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1 }}
                      >
                        {loading ? (
                          <span className="d-flex align-items-center gap-2">
                            <span
                              className="spinner-border spinner-border-sm"
                              style={{ width: 16, height: 16, borderWidth: 2 }}
                            />
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
              className="summary-v2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="summary-v2-title">Récapitulatif</div>

              <div className="summary-v2-row">
                <span className="summary-v2-key">Service</span>
                <span className="summary-v2-val">
                  {selectedService
                    ? selectedService.nom
                    : <span style={{ opacity: 0.3, fontStyle: "italic", fontWeight: 400 }}>Non sélectionné</span>}
                </span>
              </div>
              <div className="summary-v2-row">
                <span className="summary-v2-key">Coiffeur(se)</span>
                <span className="summary-v2-val">
                  {selectedStaff
                    ? `${selectedStaff.nom} (${selectedStaff.genre === "femme" ? "♀" : "♂"})`
                    : <span style={{ opacity: 0.3, fontStyle: "italic", fontWeight: 400 }}>Non sélectionné(e)</span>}
                </span>
              </div>
              <div className="summary-v2-row">
                <span className="summary-v2-key">Date</span>
                <span className="summary-v2-val">
                  {date
                    ? formatDate(date)
                    : <span style={{ opacity: 0.3, fontStyle: "italic", fontWeight: 400 }}>Non choisie</span>}
                </span>
              </div>
              <div className="summary-v2-row">
                <span className="summary-v2-key">Heure</span>
                <span className="summary-v2-val">
                  {time || <span style={{ opacity: 0.3, fontStyle: "italic", fontWeight: 400 }}>Non choisi</span>}
                </span>
              </div>

              {selectedService && (
                <div className="summary-v2-total">
                  <span className="summary-v2-total-label">Prix total</span>
                  <span className="summary-v2-total-price">
                    {selectedService.prix.toLocaleString("fr-FR")} DJF
                  </span>
                </div>
              )}

              <div className="summary-v2-trust">
                {["🔒 Réservation sécurisée", "📧 Email de confirmation", "✓ Annulation gratuite"].map((t, i) => (
                  <div key={i} className="summary-v2-trust-item">{t}</div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
