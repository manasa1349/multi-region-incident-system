const express = require("express");
const incidentRoutes = require("./routes/incidents");
const internalRoutes = require("./routes/internal");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/incidents", incidentRoutes);
app.use("/internal", internalRoutes);

module.exports = app;