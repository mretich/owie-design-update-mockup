const express = require('express');
const router = express.Router();
let isArmed = false;
router.get('/', function(req, res) {
  console.log(req.query.toggleArm, !!req.query.toggleArm);
  res.status(200);
  let resptext = '';
  if (req.query.toggleArm === "") {
      isArmed = !isArmed;
      resptext = (isArmed)? "1":"";
  }
  res.send(resptext);
});

module.exports = router;