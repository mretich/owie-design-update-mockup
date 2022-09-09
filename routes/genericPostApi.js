const express = require('express');
const router = express.Router();

router.post('/', function(req, res) {
  console.log(req);
  res.sendStatus(200);
});

module.exports = router;