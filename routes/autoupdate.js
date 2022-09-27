const express = require('express');
const router = express.Router();
let startTime = Date.now();
let globalFakeUsage = {};
let percentageInt = 50;

router.get('/', function (req, res, next) {
  let uptime = Math.floor((Date.now() - startTime) / 1000),
    s = uptime % 60,
    m = (uptime % 3600 - s) / 60,
    h = Math.floor(uptime / 3600),
    prettyUptime = (h < 1 ? '' : h + ':') + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);

  let maxCurrent = 15;
  let minCurrent = -3;

  let oldPercent = percentageInt;
  let isRegen = (oldPercent == 0) || ((oldPercent < 100) && Math.random() >= 0.5);

  let current = 0.1 * Math.floor(10 * Math.random() * (isRegen ? minCurrent : maxCurrent));
  let owiePercentage = Math.max(0, Math.min(100, oldPercent - Math.sign(current) * (Math.floor(Math.random() * 16))));
  let bmsPercentage = Math.max(0, Math.min(100, Math.floor(owiePercentage * 0.9 + (Math.random() * 0.2 * owiePercentage))));

  percentageInt = owiePercentage;

  let voltage = (15 * 2.6) + (0.01 * owiePercentage * 15 * (4.14 - 2.6));

  let cellBase = (voltage / 15);
  let restVolt = voltage;
  let nCells = 0;

  // we have 15 cells, so loop them to set fake values
  let battery_cells = [];
  while (nCells <= 15) {
    nCells++;
    let cellVolt = (nCells == 15) ? restVolt : cellBase + (Math.random() > 0.95 ? 0.01 : 0.00);
    restVolt = restVolt - cellVolt;
    battery_cells.push(cellVolt.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}));
  }

  let battery_temps = [];
  let batSensors = 0;
  while (batSensors <= 4) {
    batSensors++;
    let temp = Math.floor(Math.random() * (50 - 25 + 1)) + 25;
    battery_temps.push(temp)
  }

  // fake mAh usage/regen, loosly based on fake current
  let fakeUsage = Math.abs(current / 3.6);
  let target = current < 0 ? "regen" : "usage";

  globalFakeUsage[target] =
    (globalFakeUsage[target] || 0) + fakeUsage;

  res.json({
    "voltage": {
      "value": voltage.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}),
      "unit": "V"
    },
    "current":
      {
        "value": current.toLocaleString(undefined, {maximumFractionDigits: 1, minimumFractionDigits: 1}),
        "unit": "mAh"
      }
    ,
    "owie_percentage":
      {
        "value": owiePercentage,
        "unit": "%"
      }
    ,
    "bms_percentage":
      {
        "value": bmsPercentage,
        "unit": "%"
      }
    ,
    "battery_cells":
      {
        "value": battery_cells,
        "unit": "V"
      }
    ,
    "temperatures":
      {
        "value": battery_temps,
        "unit": "&#8451;"
      }
    ,
    "uptime":
      {
        "value": prettyUptime,
        "unit": ""
      }
    ,
    "usage":
      {
        "value": Math.floor(globalFakeUsage["usage"]),
        "unit": "mAh"
      }
    ,
    "regen":
      {
        "value": Math.floor(globalFakeUsage["regen"]),
        "unit": "mAh"
      }
    ,
  })
});

module.exports = router;