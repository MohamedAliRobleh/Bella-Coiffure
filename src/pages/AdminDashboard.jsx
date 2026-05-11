import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getAppointments, updateAppointmentStatus,
  getServices, insertService, updateService, deleteService,
} from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "dashboard", label: "Tableau de bord", icon: "📊" },
  { id: "appointments", label: "Rendez-vous", icon: "📅" },
  { id: "services", label: "Services", icon: "✂️" },
];

function StatusBadge({ status }) {
  const map = {
    confirmed: { label: "Confirmé", cls: "badge-confirmed" },
    pending:   { label: "En attente", cls: "badge-pending" },
    cancelled: { label: "Annulé", cls: "badge-cancelled" },
  };
  const { label, cls } = map[status] || map.pending;
  return <span className={cls}>{label}</span>;
}

function ServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState(service || { nom: "", description: "", duree: "", prix: "", is_active: true });
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
        background: "rgba(0,0,0,.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: .95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: .95 }}
        style={{
          background: "var(--white)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <h5 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: "1.5rem" }}>
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

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGenre, setFilterGenre] = useState("all");

  // Services state
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

  // Stats
  const today = new Date().toISOString().slice(0, 10);
  const startOfWeek = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const todayAppts = appointments.filter((a) => a.appointment_date === today && a.status !== "cancelled");
  const weekAppts = appointments.filter((a) => a.appointment_date >= startOfWeek && a.status !== "cancelled");
  const revenueToday = todayAppts.reduce((sum, a) => sum + a.service_price, 0);
  const revenueWeek = weekAppts.reduce((sum, a) => sum + a.service_price, 0);

  // Filtered appointments
  const filtered = appointments.filter((a) => {
    const matchSearch = !search ||
      `${a.client_firstname} ${a.client_lastname}`.toLowerCase().includes(search.toLowerCase()) ||
      a.appointment_date.includes(search);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchGenre = filterGenre === "all" || a.coiffeur_genre === filterGenre;
    return matchSearch && matchStatus && matchGenre;
  });

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          ✦ Bella Coiffure
          <small>Administration</small>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`sidebar-link ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 0" }}>
          <button className="sidebar-link logout" onClick={handleLogout}>
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .25 }}
          >
            {/* ── Dashboard tab ── */}
            {tab === "dashboard" && (
              <div>
                <div className="admin-header">
                  <h1 className="admin-title">Tableau de bord</h1>
                  <p className="admin-subtitle">Bienvenue sur votre espace de gestion, Bella Coiffure.</p>
                </div>

                {/* Stats */}
                <div className="row g-3 mb-4">
                  {[
                    { label: "RDV aujourd'hui", value: todayAppts.length, accent: false },
                    { label: "RDV cette semaine", value: weekAppts.length, accent: false },
                    { label: "Revenu aujourd'hui", value: `${revenueToday.toLocaleString("fr-FR")} DJF`, accent: true },
                    { label: "Revenu cette semaine", value: `${revenueWeek.toLocaleString("fr-FR")} DJF`, accent: true },
                  ].map((s, i) => (
                    <div className="col-sm-6 col-xl-3" key={i}>
                      <motion.div
                        className={`stat-card ${s.accent ? "primary" : ""}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * .08 }}
                      >
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </motion.div>
                    </div>
                  ))}
                </div>

                {/* Today's appointments */}
                <div className="admin-header">
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.25rem", fontWeight: 700 }}>
                    Rendez-vous d'aujourd'hui
                  </h2>
                </div>

                {loadingAppts ? (
                  <div className="py-5 text-center"><div className="spinner-gold" /></div>
                ) : todayAppts.length === 0 ? (
                  <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun rendez-vous aujourd'hui.
                  </div>
                ) : (
                  <div className="admin-table">
                    <div style={{ overflowX: "auto" }}>
                      <table className="table table-borderless mb-0">
                        <thead>
                          <tr>
                            <th>Heure</th>
                            <th>Client</th>
                            <th>Téléphone</th>
                            <th>Service</th>
                            <th>Coiffeur(se)</th>
                            <th>Genre</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todayAppts.map((a) => (
                            <tr key={a.id}>
                              <td><strong>{a.appointment_time}</strong></td>
                              <td>{a.client_firstname} {a.client_lastname}</td>
                              <td>{a.client_phone}</td>
                              <td>{a.service_name}</td>
                              <td>{a.coiffeur_nom}</td>
                              <td><span className={a.coiffeur_genre === "femme" ? "badge-femme" : "badge-homme"}>{a.coiffeur_genre === "femme" ? "♀" : "♂"}</span></td>
                              <td><StatusBadge status={a.status} /></td>
                              <td>
                                {a.status !== "cancelled" && (
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", fontSize: ".78rem", fontWeight: 700 }}
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
                  </div>
                )}
              </div>
            )}

            {/* ── Appointments tab ── */}
            {tab === "appointments" && (
              <div>
                <div className="admin-header">
                  <h1 className="admin-title">Rendez-vous</h1>
                  <p className="admin-subtitle">Gérez tous vos rendez-vous.</p>
                </div>

                {/* Filters */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control-bc"
                      placeholder="🔍 Rechercher par nom ou date..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-4 col-md-3">
                    <select
                      className="form-select-bc"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="pending">En attente</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                  <div className="col-sm-4 col-md-3">
                    <select
                      className="form-select-bc"
                      value={filterGenre}
                      onChange={(e) => setFilterGenre(e.target.value)}
                    >
                      <option value="all">Tous genres</option>
                      <option value="femme">Coiffeuse</option>
                      <option value="homme">Coiffeur</option>
                    </select>
                  </div>
                </div>

                {loadingAppts ? (
                  <div className="py-5 text-center"><div className="spinner-gold" /></div>
                ) : filtered.length === 0 ? (
                  <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun rendez-vous trouvé.
                  </div>
                ) : (
                  <div className="admin-table">
                    <div style={{ overflowX: "auto" }}>
                      <table className="table table-borderless mb-0">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Heure</th>
                            <th>Client</th>
                            <th>Téléphone</th>
                            <th>Email</th>
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
                              <td style={{ whiteSpace: "nowrap" }}>
                                {new Date(a.appointment_date + "T00:00:00").toLocaleDateString("fr-FR")}
                              </td>
                              <td><strong>{a.appointment_time}</strong></td>
                              <td style={{ whiteSpace: "nowrap" }}>{a.client_firstname} {a.client_lastname}</td>
                              <td>{a.client_phone}</td>
                              <td style={{ fontSize: ".8rem" }}>{a.client_email}</td>
                              <td>{a.service_name}</td>
                              <td style={{ whiteSpace: "nowrap" }}>
                                {a.coiffeur_nom}
                                <span style={{ marginLeft: "4px" }}>{a.coiffeur_genre === "femme" ? "♀" : "♂"}</span>
                              </td>
                              <td style={{ whiteSpace: "nowrap", fontWeight: 700 }}>{a.service_price.toLocaleString("fr-FR")} DJF</td>
                              <td><StatusBadge status={a.status} /></td>
                              <td>
                                {a.status !== "cancelled" && (
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", fontSize: ".78rem", fontWeight: 700 }}
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
                    <div style={{ padding: ".75rem 1rem", fontSize: ".82rem", color: "var(--text-muted)", borderTop: "1px solid rgba(0,0,0,.04)" }}>
                      {filtered.length} rendez-vous affiché{filtered.length > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Services tab ── */}
            {tab === "services" && (
              <div>
                <div className="admin-header d-flex align-items-start justify-content-between flex-wrap gap-2">
                  <div>
                    <h1 className="admin-title">Services</h1>
                    <p className="admin-subtitle">Gérez le catalogue de services du salon.</p>
                  </div>
                  <button
                    className="btn-gold"
                    onClick={() => { setEditingService(null); setModalOpen(true); }}
                  >
                    + Ajouter un service
                  </button>
                </div>

                {loadingServices ? (
                  <div className="py-5 text-center"><div className="spinner-gold" /></div>
                ) : dbServices.length === 0 ? (
                  <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun service. Commencez par en ajouter un.
                  </div>
                ) : (
                  <div className="admin-table">
                    <div style={{ overflowX: "auto" }}>
                      <table className="table table-borderless mb-0">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Description</th>
                            <th>Durée</th>
                            <th>Prix (DJF)</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbServices.map((s) => (
                            <tr key={s.id}>
                              <td style={{ fontWeight: 700 }}>{s.nom}</td>
                              <td style={{ maxWidth: "200px", fontSize: ".83rem", color: "var(--text-muted)" }}>{s.description}</td>
                              <td>{s.duree}</td>
                              <td style={{ fontWeight: 700 }}>{s.prix.toLocaleString("fr-FR")}</td>
                              <td>
                                <span style={{
                                  background: s.is_active ? "#d1fae5" : "#fee2e2",
                                  color: s.is_active ? "#065f46" : "#991b1b",
                                  padding: ".25rem .65rem",
                                  borderRadius: "50px",
                                  fontSize: ".75rem",
                                  fontWeight: 700,
                                }}>
                                  {s.is_active ? "Actif" : "Inactif"}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "rgba(212,168,83,.15)", color: "var(--primary)", border: "none", borderRadius: "6px", fontSize: ".78rem", fontWeight: 700 }}
                                    onClick={() => { setEditingService(s); setModalOpen(true); }}
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", fontSize: ".78rem", fontWeight: 700 }}
                                    onClick={() => handleDeleteService(s.id)}
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

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
