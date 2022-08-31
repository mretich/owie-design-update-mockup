const express = require('express');
const router = express.Router();


router.post('/', function(req, res) {
  console.log(req.files.firmware); // the uploaded file object
  res.sendStatus(200);
});

module.exports = router;