const app = require("./app");
const config = require("./config/config");
const migrate = require("./db/migrate");
const { startReplication } = require("./services/replicationService");

async function start() {
  try {
    await migrate();

    app.listen(config.port, () => {
      console.log(`Region ${config.region} running on port ${config.port}`);
    });

    startReplication(); // 🔥 Start background replication

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();