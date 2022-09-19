const express = require('express');
const router = express.Router();
const startTime = Date.now();
const fakeUsage = {};

router.get('/', function(req, res, next) {
  //TODO: move demo to backend
  //      Every call we need to recalculate the values
  //TODO: check how the values are delivered by OWIE.
  //      (or define them the way we need it)
  res.json({
    voltage: 40.23,
    current: -2.03,
    owie_percentage: 20,
    bms_percentage: 22,
    battery_cells: [
      "4.10",
      "4.11",
      "4.10",
      "4.10",
      "4.12",
      "4.10",
      "4.10",
      "4.09",
      "4.10",
      "4.10",
      "4.10",
      "4.10",
    ],
    temperatures: [
      30,
      23,
      23,
      34,
      50
    ],
    uptime: 1663620232970,
    usage: 203,
    regen: 23
  })
});

module.exports = router;