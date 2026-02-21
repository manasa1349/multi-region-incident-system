const pool = require("./db");

async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS incidents (
      id UUID PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL,
      severity VARCHAR(50) NOT NULL,
      assigned_team VARCHAR(100),
      vector_clock JSONB NOT NULL,
      version_conflict BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await pool.query(query);
  console.log("Incidents table ready");
}

module.exports = migrate;