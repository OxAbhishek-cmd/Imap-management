const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/emailController');
const fetchuser = require('../middleware/fetchUser');


// Route to get a list of inbox emails
router.post('/setemail', fetchuser,EmailController.getEmails);

// Route to get the content of a specific email
router.get('/getList', fetchuser, EmailController.getEmailList);

module.exports = router;
