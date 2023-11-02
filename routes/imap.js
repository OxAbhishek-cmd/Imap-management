const express = require('express');
const router = express.Router();
const ImapController = require('../controllers/imapController');
const fetchEmail = require('../middleware/fetchEmail');

// Route to fetch inbox emails
router.get('/inbox-emails',fetchEmail, ImapController.fetchInboxEmails);

// Route to fetch email content
router.get('/email-content/:seqno',fetchEmail, ImapController.fetchEmailContent);

module.exports = router;
