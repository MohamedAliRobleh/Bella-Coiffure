const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

async function sendEmail({ apiKey, senderEmail, to, subject, html }) {
  await fetch(BREVO_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      sender:      { name: "Bella Coiffure", email: senderEmail },
      to,
      subject,
      htmlContent: html,
    }),
  });
}

export async function sendBookingConfirmation({ prenom, nom, email, service, staff, date, time }) {
  const apiKey      = import.meta.env.VITE_BREVO_API_KEY;
  const senderEmail = import.meta.env.VITE_BREVO_SENDER_EMAIL;
  const adminEmail  = import.meta.env.VITE_ADMIN_EMAIL;

  if (!apiKey || !senderEmail) return;

  const rows = [
    ["Client",      `${prenom} ${nom}`],
    ["Service",     service.nom],
    ["Coiffeur(se)", `${staff.nom} (${staff.genre === "femme" ? "Coiffeuse ♀" : "Coiffeur ♂"})`],
    ["Date",        formatDate(date)],
    ["Heure",       time],
    ["Prix",        `${service.prix.toLocaleString("fr-FR")} DJF`],
  ];

  const tableRows = (data) => data.map(([label, value], i) => `
    <tr style="border-bottom:${i < data.length - 1 ? "1px solid #F5E8D6" : "none"}">
      <td style="padding:.6rem .5rem;color:#8B7355;width:40%;">${label}</td>
      <td style="padding:.6rem .5rem;color:#2C1810;font-weight:700;">${value}</td>
    </tr>
  `).join("");

  const baseLayout = (title, intro, bodyRows) => `
    <div style="font-family:'Georgia',serif;max-width:560px;margin:0 auto;background:#FDF6EE;border-radius:12px;overflow:hidden;border:1px solid #F5E8D6;">
      <div style="background:linear-gradient(135deg,#2C1810,#8B4513);padding:2rem;text-align:center;">
        <h1 style="color:#D4A853;font-size:1.8rem;margin:0;">✦ Bella Coiffure</h1>
        <p style="color:rgba(255,255,255,.7);font-size:.85rem;margin:.5rem 0 0;letter-spacing:.1em;text-transform:uppercase;">
          Salon de coiffure — Djibouti
        </p>
      </div>
      <div style="padding:2rem;">
        <h2 style="color:#2C1810;font-size:1.4rem;margin:0 0 .5rem;">${title}</h2>
        <p style="color:#8B7355;margin:0 0 1.5rem;">${intro}</p>
        <div style="background:#fff;border-radius:8px;border:1px solid #F5E8D6;padding:1.25rem;margin-bottom:1.5rem;">
          <table style="width:100%;border-collapse:collapse;font-size:.9rem;">${bodyRows}</table>
        </div>
        <div style="background:rgba(212,168,83,.1);border:1px solid rgba(212,168,83,.3);border-radius:8px;padding:1rem;font-size:.88rem;color:#4A2C1C;">
          <strong>📍 Avenue 13, Quartier Arhiba, Djibouti-Ville</strong><br/>
          <strong>📞 +253 77 00 00 00</strong> &nbsp;·&nbsp; Lun–Sam : 8h00–19h00
        </div>
      </div>
      <div style="background:#2C1810;padding:1.25rem;text-align:center;">
        <p style="color:rgba(255,255,255,.45);font-size:.78rem;margin:0;">© 2025 Bella Coiffure — Djibouti-Ville</p>
      </div>
    </div>
  `;

  // Email 1 — confirmation au client (sans la ligne "Client")
  const clientRows = rows.slice(1);
  const clientHtml = baseLayout(
    "Rendez-vous confirmé ✓",
    `Bonjour <strong>${prenom} ${nom}</strong>, votre rendez-vous est bien enregistré.`,
    tableRows(clientRows)
  );

  // Email 2 — notification au salon (avec toutes les infos + email client)
  const adminRows = [...rows, ["Email", email]];
  const adminHtml = baseLayout(
    "🔔 Nouveau rendez-vous reçu",
    `Un nouveau rendez-vous vient d'être réservé en ligne.`,
    tableRows(adminRows)
  );

  const dateLabel = formatDate(date);

  await Promise.all([
    sendEmail({
      apiKey, senderEmail,
      to:      [{ email, name: `${prenom} ${nom}` }],
      subject: `✓ Rendez-vous confirmé — ${service.nom} le ${dateLabel}`,
      html:    clientHtml,
    }),
    adminEmail && sendEmail({
      apiKey, senderEmail,
      to:      [{ email: adminEmail, name: "Bella Coiffure Admin" }],
      subject: `🔔 Nouveau RDV — ${prenom} ${nom} · ${service.nom} le ${dateLabel}`,
      html:    adminHtml,
    }),
  ]);
}
