const pool = require("../db/db");

async function createIncident(incident) {
  const query = `
    INSERT INTO incidents
    (id, title, description, status, severity, assigned_team, vector_clock, version_conflict)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;

  const values = [
    incident.id,
    incident.title,
    incident.description,
    incident.status,
    incident.severity,
    incident.assigned_team,
    incident.vector_clock,
    incident.version_conflict
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getIncidentById(id) {
  const result = await pool.query(
    "SELECT * FROM incidents WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

async function updateIncident(id, fields) {
  const query = `
    UPDATE incidents
    SET
      title = $1,
      description = $2,
      status = $3,
      severity = $4,
      assigned_team = $5,
      vector_clock = $6,
      version_conflict = $7,
      updated_at = NOW()
    WHERE id = $8
    RETURNING *;
  `;

  const values = [
    fields.title,
    fields.description,
    fields.status,
    fields.severity,
    fields.assigned_team,
    fields.vector_clock,
    fields.version_conflict,
    id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getIncidentsUpdatedAfter(timestamp) {
  const result = await pool.query(
    "SELECT * FROM incidents WHERE updated_at > $1",
    [timestamp]
  );
  return result.rows;
}
module.exports = {
  createIncident,
  getIncidentById,
  updateIncident,
  getIncidentsUpdatedAfter
};