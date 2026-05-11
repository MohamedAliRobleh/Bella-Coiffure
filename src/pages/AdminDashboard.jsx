import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getAppointments, updateAppointmentStatus,
  getServices, insertService, updateService, deleteService,
} from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function toDateStr(val) {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function displayDate(val) {
  const s = toDateStr(val);
  if (!s) return "";
  return new Date(s + "T00:00:00").toLocaleDateString("fr-FR");
}

const TABS = [
  { id: "dashboard", label: "Tableau de bord", icon: "📊" },
  { id: "appointments", label: "Rendez-vous", icon: "📅" },
  { id: "services", label: "Services", icon: "✂️" },
];

const TAB_META = {
  dashboard:    { title: "Tableau de bord", sub: "Vue d'ensemble de votre activité" },
  appointments: { title: "Rendez-vous", sub: "Gérez et suivez tous vos rendez-vous" },
  services:     { title: "Services", sub: "Gérez le catalogue du salon" },
};

function StatusBadge({ status }) {
  const map = {
    confirmed: { label: "Confirmé",   cls: "badge-v2 confirmed" },
    pending:   { label: "En attente", cls: "badge-v2 pending" },
    cancelled: { label: "Annulé",     cls: "badge-v2 cancelled" },
  };
  const { label, cls } = map[status] || map.pending;
  return <span className={cls}>{label}</span>;
}

function ServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState(
    service || { nom: "", description: "", duree: "", prix: "", is_active: true }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ ...form, prix: parseInt(form.prix) || 0 });
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1050,
        background: "rgba(0,0,0,.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: "var(--white)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <h5 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: "1.5rem", color: "var(--dark)" }}>
          {service?.id ? "Modifier le service" : "Ajouter un service"}
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-bc">Nom du service *</label>
            <input type="text" className="form-control-bc" value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label-bc">Description</label>
            <textarea className="form-control-bc" rows={2} value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label-bc">Durée *</label>
              <input type="text" className="form-control-bc" placeholder="ex: 1h30"
                value={form.duree} onChange={(e) => setForm({ ...form, duree: e.target.value })} required />
            </div>
            <div className="col-6">
              <label className="form-label-bc">Prix (DJF) *</label>
              <input type="number" className="form-control-bc" placeholder="3500"
                value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} required />
            </div>
          </div>
          <div className="mb-4 d-flex align-items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
            <label htmlFor="is_active" style={{ fontWeight: 700, fontSize: ".9rem", cursor: "pointer" }}>
              Service actif
            </label>
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn-outline-gold" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGenre, setFilterGenre] = useState("all");

  const [dbServices, setDbServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoadingAppts(true);
    try {
      const data = await getAppointments();
      setAppointments(data || []);
    } catch { toast.error("Erreur chargement des rendez-vous."); }
    setLoadingAppts(false);
  }, []);

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const data = await getServices();
      setDbServices(data || []);
    } catch { toast.error("Erreur chargement des services."); }
    setLoadingServices(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchServices();
  }, [fetchAppointments, fetchServices]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const cancelAppointment = async (id) => {
    try {
      await updateAppointmentStatus(id, "cancelled");
      toast.success("Rendez-vous annulé.");
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch { toast.error("Erreur lors de l'annulation."); }
  };

  const saveService = async (formData) => {
    try {
      if (formData.id) {
        await updateService(formData.id, formData);
        toast.success("Service modifié.");
      } else {
        await insertService(formData);
        toast.success("Service ajouté.");
      }
      setModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch { toast.error("Erreur lors de la sauvegarde."); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce service ?")) return;
    try {
      await deleteService(id);
      toast.success("Service supprimé.");
      setDbServices((prev) => prev.filter((s) => s.id !== id));
    } catch { toast.error("Erreur lors de la suppression."); }
  };

  const today = new Date().toISOString().slice(0, 10);
  const startOfWeek = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const todayAppts = appointments.filter((a) => toDateStr(a.appointment_date) === today && a.status !== "cancelled");
  const weekAppts = appointments.filter((a) => toDateStr(a.appointment_date) >= startOfWeek && a.status !== "cancelled");
  const revenueToday = todayAppts.reduce((sum, a) => sum + a.service_price, 0);
  const revenueWeek = weekAppts.reduce((sum, a) => sum + a.service_price, 0);

  const filtered = appointments.filter((a) => {
    const dateStr = toDateStr(a.appointment_date);
    const matchSearch = !search ||
      `${a.client_firstname} ${a.client_lastname}`.toLowerCase().includes(search.toLowerCase()) ||
      dateStr.includes(search);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchGenre = filterGenre === "all" || a.coiffeur_genre === filterGenre;
    return matchSearch && matchStatus && matchGenre;
  });

  const todayFr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="admin-layout">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar-v2">
        <div className="sidebar-logo-v2">
          <div className="logo-text">✦ Bella Coiffure</div>
          <div className="logo-sub">Administration</div>
        </div>

        <div className="sidebar-section" style={{ flex: 1 }}>
          <div className="sidebar-section-label">Navigation</div>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`sidebar-link-v2 ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="link-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="sidebar-logout-v2">
          <button
            className="sidebar-link-v2"
            onClick={handleLogout}
            style={{ color: "rgba(255,80,80,.6)" }}
          >
            <span className="link-icon" style={{ background: "rgba(255,80,80,.08)" }}>🚪</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="admin-main-v2" style={{ display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div className="admin-topbar">
          <div>
            <div className="admin-topbar-title">{TAB_META[tab].title}</div>
            <div className="admin-topbar-sub">{TAB_META[tab].sub}</div>
          </div>
          <div style={{ fontSize: ".8rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {todayFr}
          </div>
        </div>

        {/* Tab content */}
        <div className="admin-content-v2" style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {/* ── DASHBOARD TAB ── */}
              {tab === "dashboard" && (
                <div>
                  {/* Stat cards */}
                  <div className="row g-3 mb-4">
                    {[
                      { eyebrow: "RDV aujourd'hui", value: todayAppts.length, indicator: "rendez-vous actifs", icon: "📅", gold: false },
                      { eyebrow: "RDV cette semaine", value: weekAppts.length, indicator: "depuis lundi", icon: "📆", gold: false },
                      { eyebrow: "Revenu aujourd'hui", value: `${revenueToday.toLocaleString("fr-FR")}`, indicator: "DJF encaissés", icon: "💰", gold: true },
                      { eyebrow: "Revenu cette semaine", value: `${revenueWeek.toLocaleString("fr-FR")}`, indicator: "DJF cette semaine", icon: "📈", gold: true },
                    ].map((s, i) => (
                      <div className="col-sm-6 col-xl-3" key={i}>
                        <motion.div
                          className={`stat-card-v2 ${s.gold ? "accent-primary" : ""}`}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                        >
                          <span className="stat-icon-bg">{s.icon}</span>
                          <div className="stat-eyebrow">{s.eyebrow}</div>
                          <div className={`stat-number ${s.gold ? "gold" : ""}`}>{s.value}</div>
                          <div className="stat-indicator">{s.indicator}</div>
                        </motion.div>
                      </div>
                    ))}
                  </div>

                  {/* Today's appointments */}
                  <div className="table-card-v2">
                    <div className="table-card-header">
                      <div className="table-card-title">Rendez-vous d'aujourd'hui</div>
                      <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
                        {todayAppts.length} rendez-vous
                      </span>
                    </div>

                    {loadingAppts ? (
                      <div className="py-5 text-center"><div className="spinner-gold" /></div>
                    ) : todayAppts.length === 0 ? (
                      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: ".9rem" }}>
                        Aucun rendez-vous aujourd'hui.
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="table-v2">
                          <thead>
                            <tr>
                              <th>Heure</th>
                              <th>Client</th>
                              <th>Service</th>
                              <th>Coiffeur(se)</th>
                              <th>Statut</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todayAppts.map((a) => (
                              <tr key={a.id}>
                                <td><strong style={{ fontFamily: "'Playfair Display',serif" }}>{a.appointment_time}</strong></td>
                                <td>
                                  <div className="client-name">{a.client_firstname} {a.client_lastname}</div>
                                  <div className="client-phone">{a.client_phone}</div>
                                </td>
                                <td>{a.service_name}</td>
                                <td>
                                  {a.coiffeur_nom}
                                  <span style={{ marginLeft: "4px", opacity: 0.6 }}>
                                    {a.coiffeur_genre === "femme" ? "♀" : "♂"}
                                  </span>
                                </td>
                                <td><StatusBadge status={a.status} /></td>
                                <td>
                                  {a.status !== "cancelled" && (
                                    <button
                                      className="btn-cancel-v2"
                                      onClick={() => cancelAppointment(a.id)}
                                    >
                                      Annuler
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── APPOINTMENTS TAB ── */}
              {tab === "appointments" && (
                <div>
                  {/* Filter bar */}
                  <div className="filter-bar mb-4">
                    <div className="filter-input-wrap">
                      <input
                        type="text"
                        className="filter-input-v2"
                        placeholder="Rechercher par nom ou date..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="filter-select-v2"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="pending">En attente</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                    <select
                      className="filter-select-v2"
                      value={filterGenre}
                      onChange={(e) => setFilterGenre(e.target.value)}
                    >
                      <option value="all">Tous genres</option>
                      <option value="femme">Coiffeuse</option>
                      <option value="homme">Coiffeur</option>
                    </select>
                  </div>

                  <div className="table-card-v2">
                    <div className="table-card-header">
                      <div className="table-card-title">Tous les rendez-vous</div>
                      <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
                        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    {loadingAppts ? (
                      <div className="py-5 text-center"><div className="spinner-gold" /></div>
                    ) : filtered.length === 0 ? (
                      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: ".9rem" }}>
                        Aucun rendez-vous trouvé.
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="table-v2">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Heure</th>
                              <th>Client</th>
                              <th>Service</th>
                              <th>Coiffeur(se)</th>
                              <th>Prix</th>
                              <th>Statut</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((a) => (
                              <tr key={a.id}>
                                <td style={{ whiteSpace: "nowrap" }}>{displayDate(a.appointment_date)}</td>
                                <td>
                                  <strong style={{ fontFamily: "'Playfair Display',serif" }}>
                                    {a.appointment_time}
                                  </strong>
                                </td>
                                <td style={{ whiteSpace: "nowrap" }}>
                                  <div className="client-name">{a.client_firstname} {a.client_lastname}</div>
                                  <div className="client-phone">{a.client_email}</div>
                                </td>
                                <td>{a.service_name}</td>
                                <td style={{ whiteSpace: "nowrap" }}>
                                  {a.coiffeur_nom}
                                  <span style={{ marginLeft: "4px", opacity: 0.6 }}>
                                    {a.coiffeur_genre === "femme" ? "♀" : "♂"}
                                  </span>
                                </td>
                                <td style={{ whiteSpace: "nowrap", fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>
                                  {a.service_price.toLocaleString("fr-FR")} DJF
                                </td>
                                <td><StatusBadge status={a.status} /></td>
                                <td>
                                  {a.status !== "cancelled" && (
                                    <button
                                      className="btn-cancel-v2"
                                      onClick={() => cancelAppointment(a.id)}
                                    >
                                      Annuler
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SERVICES TAB ── */}
              {tab === "services" && (
                <div>
                  <div className="table-card-v2">
                    <div className="table-card-header">
                      <div className="table-card-title">Catalogue des services</div>
                      <button
                        className="btn-gold"
                        style={{ fontSize: ".85rem", padding: ".55rem 1.25rem" }}
                        onClick={() => { setEditingService(null); setModalOpen(true); }}
                      >
                        + Ajouter
                      </button>
                    </div>

                    {loadingServices ? (
                      <div className="py-5 text-center"><div className="spinner-gold" /></div>
                    ) : dbServices.length === 0 ? (
                      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: ".9rem" }}>
                        Aucun service. Commencez par en ajouter un.
                      </div>
                    ) : (
                      dbServices.map((s) => (
                        <div key={s.id} className="service-item-v2">
                          <div className="service-item-body">
                            <div className="service-item-name">{s.nom}</div>
                            {s.description && (
                              <div className="service-item-desc">{s.description}</div>
                            )}
                          </div>
                          <div className="service-item-meta">
                            <span style={{ fontSize: ".8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                              {s.duree}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: ".92rem", whiteSpace: "nowrap", fontFamily: "'Playfair Display',serif" }}>
                              {s.prix.toLocaleString("fr-FR")} DJF
                            </span>
                            <span className={`badge-v2 ${s.is_active ? "confirmed" : "cancelled"}`}>
                              {s.is_active ? "Actif" : "Inactif"}
                            </span>
                            <div className="d-flex gap-2">
                              <button
                                className="btn-edit-v2"
                                onClick={() => { setEditingService(s); setModalOpen(true); }}
                              >
                                Modifier
                              </button>
                              <button
                                className="btn-cancel-v2"
                                onClick={() => handleDeleteService(s.id)}
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Service modal */}
      <AnimatePresence>
        {modalOpen && (
          <ServiceModal
            service={editingService}
            onClose={() => { setModalOpen(false); setEditingService(null); }}
            onSave={saveService}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
