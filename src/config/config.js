require("dotenv").config();

const REGION = process.env.REGION;

if (!["us", "eu", "apac"].includes(REGION)) {
  throw new Error("REGION must be us, eu, or apac");
}

module.exports = {
  region: REGION,
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  serviceUrls: {
    us: process.env.US_SERVICE_URL,
    eu: process.env.EU_SERVICE_URL,
    apac: process.env.APAC_SERVICE_URL
  }
};