const axios = require("axios");
const config = require("../config/config");
const incidentModel = require("../models/incidentModel");

let replicationEnabled = true;

async function replicate() {
  if (!replicationEnabled) return;

  try {
    const incidents = await incidentModel.getIncidentsUpdatedAfter(new Date(0));

    const targetRegions = ["us", "eu", "apac"].filter(
      region => region !== config.region
    );

    for (const incident of incidents) {
      for (const region of targetRegions) {
        try {
          const url = `${config.serviceUrls[region]}/internal/replicate`;
          await axios.post(url, incident);
        } catch (err) {
          console.log(`Replication to ${region} failed`);
        }
      }
    }
  } catch (err) {
    console.error("Replication error:", err.message);
  }
}

function startReplication() {
  setInterval(replicate, 5000);
}

function disableReplication() {
  replicationEnabled = false;
  console.log("Replication DISABLED");
}

function enableReplication() {
  replicationEnabled = true;
  console.log("Replication ENABLED");
}

module.exports = {
  startReplication,
  disableReplication,
  enableReplication
};