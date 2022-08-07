const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.json({
    cells: [
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
    ]
  })
});

module.exports = router;