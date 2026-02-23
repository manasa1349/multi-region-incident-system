const express = require("express");
const incidentModel = require("../models/incidentModel");
const vectorClock = require("../services/vectorClock");
const { disableReplication, enableReplication } = require("../services/replicationService");

const router = express.Router();

/* =========================
   INTERNAL REPLICATION
========================= */
router.post("/replicate", async (req, res) => {
  try {
    const incoming = req.body;

    const existing = await incidentModel.getIncidentById(incoming.id);

    // If incident does not exist locally → create it
    if (!existing) {
      await incidentModel.createIncident(incoming);
      return res.json({ message: "Replicated (created)" });
    }

    const comparison = vectorClock.compare(
      incoming.vector_clock,
      existing.vector_clock
    );

    // Case 1: Incoming AFTER local → overwrite
    if (comparison === vectorClock.Comparison.AFTER) {
      const mergedClock = vectorClock.merge(
        incoming.vector_clock,
        existing.vector_clock
      );

      await incidentModel.updateIncident(incoming.id, {
        ...incoming,
        vector_clock: mergedClock,
        version_conflict: false
      });

      return res.json({ message: "Replicated (updated)" });
    }

    // Case 2: Incoming BEFORE → ignore (idempotent)
    if (comparison === vectorClock.Comparison.BEFORE) {
      return res.json({ message: "Ignored (stale replication)" });
    }

    // Case 3: EQUAL → ignore (idempotent)
    if (comparison === vectorClock.Comparison.EQUAL) {
      return res.json({ message: "Ignored (duplicate replication)" });
    }

    // Case 4: CONCURRENT → mark conflict
    if (comparison === vectorClock.Comparison.CONCURRENT) {
      const mergedClock = vectorClock.merge(
        incoming.vector_clock,
        existing.vector_clock
      );

      await incidentModel.updateIncident(incoming.id, {
        ...existing,
        vector_clock: mergedClock,
        version_conflict: true
      });

      return res.json({ message: "Conflict detected" });
    }

    res.json({ message: "Replication processed" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Replication failed" });
  }
});


router.post("/disable-replication", (req, res) => {
  disableReplication();
  res.json({ message: "Replication disabled" });
});

router.post("/enable-replication", (req, res) => {
  enableReplication();
  res.json({ message: "Replication enabled" });
});

module.exports = router;