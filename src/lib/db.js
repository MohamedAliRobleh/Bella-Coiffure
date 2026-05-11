import { neon } from "@neondatabase/serverless";

const sql = neon(import.meta.env.VITE_DATABASE_URL);

// ── Appointments ────────────────────────────────────────────
export async function insertAppointment(data) {
  const result = await sql`
    INSERT INTO appointments (
      client_firstname, client_lastname, client_phone, client_email,
      service_name, service_price, coiffeur_nom, coiffeur_genre,
      appointment_date, appointment_time, note, status
    ) VALUES (
      ${data.client_firstname}, ${data.client_lastname},
      ${data.client_phone},    ${data.client_email},
      ${data.service_name},    ${data.service_price},
      ${data.coiffeur_nom},    ${data.coiffeur_genre},
      ${data.appointment_date},${data.appointment_time},
      ${data.note ?? null},    ${data.status}
    ) RETURNING *
  `;
  return result[0];
}

export async function getAppointments() {
  return await sql`SELECT * FROM appointments ORDER BY created_at DESC`;
}

export async function updateAppointmentStatus(id, status) {
  const result = await sql`
    UPDATE appointments SET status = ${status} WHERE id = ${id} RETURNING *
  `;
  return result[0];
}

// ── Services ────────────────────────────────────────────────
export async function getServices() {
  return await sql`SELECT * FROM services ORDER BY created_at ASC`;
}

export async function insertService(data) {
  const result = await sql`
    INSERT INTO services (nom, description, duree, prix, is_active)
    VALUES (${data.nom}, ${data.description ?? null}, ${data.duree}, ${data.prix}, ${data.is_active})
    RETURNING *
  `;
  return result[0];
}

export async function updateService(id, data) {
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
  await sql`DELETE FROM services WHERE id = ${id}`;
}
