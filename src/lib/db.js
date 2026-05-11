import { neon } from "@neondatabase/serverless";

// Lazy init — évite un crash au chargement si la variable est absente
function getDb() {
  const url = import.meta.env.VITE_DATABASE_URL;
  if (!url) throw new Error("VITE_DATABASE_URL manquant dans les variables d'environnement.");
  return neon(url);
}

// ── Appointments ────────────────────────────────────────────
export async function insertAppointment(data) {
  const sql = getDb();
  const result = await sql`
    INSERT INTO appointments (
      client_firstname, client_lastname, client_phone, client_email,
      service_name, service_price, coiffeur_nom, coiffeur_genre,
      appointment_date, appointment_time, note, status
    ) VALUES (
      ${data.client_firstname}, ${data.client_lastname},
      ${data.client_phone},     ${data.client_email},
      ${data.service_name},     ${data.service_price},
      ${data.coiffeur_nom},     ${data.coiffeur_genre},
      ${data.appointment_date}, ${data.appointment_time},
      ${data.note ?? null},     ${data.status}
    ) RETURNING *
  `;
  return result[0];
}

export async function getAppointments() {
  const sql = getDb();
  return await sql`SELECT * FROM appointments ORDER BY created_at DESC`;
}

export async function updateAppointmentStatus(id, status) {
  const sql = getDb();
  const result = await sql`
    UPDATE appointments SET status = ${status} WHERE id = ${id} RETURNING *
  `;
  return result[0];
}

// ── Services ────────────────────────────────────────────────
export async function getServices() {
  const sql = getDb();
  return await sql`SELECT * FROM services ORDER BY created_at ASC`;
}

export async function insertService(data) {
  const sql = getDb();
  const result = await sql`
    INSERT INTO services (nom, description, duree, prix, is_active)
    VALUES (${data.nom}, ${data.description ?? null}, ${data.duree}, ${data.prix}, ${data.is_active})
    RETURNING *
  `;
  return result[0];
}

export async function updateService(id, data) {
  const sql = getDb();
  const result = await sql`
    UPDATE services
    SET nom         = ${data.nom},
        description = ${data.description ?? null},
        duree       = ${data.duree},
        prix        = ${data.prix},
        is_active   = ${data.is_active}
    WHERE id = ${id} RETURNING *
  `;
  return result[0];
}

export async function deleteService(id) {
  const sql = getDb();
  await sql`DELETE FROM services WHERE id = ${id}`;
}
