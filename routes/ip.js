const express = require('express');
const router = express.Router();
router.post('/ban-ip', (req, res) => {
  const { ip } = req.body;
  if (ip) {
    bannedIPs.add(ip);
    res.send(`IP address ${ip} is now banned.`);
  } else {
    res.status(400).send('Invalid IP address.');
  }
});

router.post('/unban-ip', (req, res) => {
  const { ip } = req.body;

  if (ip) {
    bannedIPs.delete(ip);
    res.send(`IP address ${ip} is now unbanned.`);
  } else {
    res.status(400).send('Invalid IP address.');
  }
});

module.exports = router;