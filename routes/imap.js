const express = require('express');
const router = express.Router();
const ImapController = require('../controllers/imapController');
const fetchEmailConfig = require('../middleware/fetchEmailConfig');

// Route to fetch inbox emails
router.get('/inbox/:email_id', fetchEmailConfig, ImapController.fetchInboxEmails);

// Route to fetch email content
router.get('/content/:email_id/:seqno', fetchEmailConfig, ImapController.fetchEmailContent);

// Route to Delete or Seen email
router.get('/flag/:email_id/:seqno', fetchEmailConfig, ImapController.deleteOrMarkSeenEmail);

module.exports = router;
