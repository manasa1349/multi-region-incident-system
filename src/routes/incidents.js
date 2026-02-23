const express = require("express");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/config");
const incidentModel = require("../models/incidentModel");
const vectorClock = require("../services/vectorClock");

const router = express.Router();

/* =========================
   CREATE INCIDENT
========================= */
router.post("/", async (req, res) => {
  try {
    const { title, description, severity } = req.body;

    if (!title || !severity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const incident = {
      id: uuidv4(),
      title,
      description: description || null,
      status: "OPEN",
      severity,
      assigned_team: null,
      vector_clock: vectorClock.createInitialClock(config.region),
      version_conflict: false
    };

    const saved = await incidentModel.createIncident(incident);

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to create incident" });
  }
});

/* =========================
   GET INCIDENT
========================= */
router.get("/:id", async (req, res) => {
  const incident = await incidentModel.getIncidentById(req.params.id);

  if (!incident) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(incident);
});

/* =========================
   UPDATE INCIDENT
========================= */
router.put("/:id", async (req, res) => {
  try {
    const { vector_clock: clientClock, ...updates } = req.body;
    const existing = await incidentModel.getIncidentById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    const comparison = vectorClock.compare(
      clientClock,
      existing.vector_clock
    );

    if (comparison === vectorClock.Comparison.BEFORE) {
      return res.status(409).json({
        error: "Stale update rejected",
        current_vector_clock: existing.vector_clock
      });
    }

    const newClock = vectorClock.increment(
      existing.vector_clock,
      config.region
    );

    const updated = await incidentModel.updateIncident(req.params.id, {
      title: updates.title || existing.title,
      description: updates.description || existing.description,
      status: updates.status || existing.status,
      severity: updates.severity || existing.severity,
      assigned_team: updates.assigned_team || existing.assigned_team,
      vector_clock: newClock,
      version_conflict: existing.version_conflict
    });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

/* =========================
   RESOLVE CONFLICT
========================= */
router.post("/:id/resolve", async (req, res) => {
  try {
    const existing = await incidentModel.getIncidentById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    if (!existing.version_conflict) {
      return res.status(400).json({ error: "No conflict to resolve" });
    }

    const updatedClock = vectorClock.increment(
      existing.vector_clock,
      config.region
    );

    const resolved = await incidentModel.updateIncident(req.params.id, {
      ...existing,
      status: req.body.status || existing.status,
      assigned_team: req.body.assigned_team || existing.assigned_team,
      vector_clock: updatedClock,
      version_conflict: false
    });

    res.json(resolved);

  } catch (err) {
    res.status(500).json({ error: "Resolve failed" });
  }
});

module.exports = router;