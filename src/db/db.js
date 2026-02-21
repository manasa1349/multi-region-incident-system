const { Pool } = require("pg");
const config = require("../config/config");

const pool = new Pool(config.db);

pool.on("connect", () => {
  console.log(`Connected to DB for region ${config.region}`);
});

module.exports = pool;