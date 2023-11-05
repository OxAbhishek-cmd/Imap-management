const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/emailController');
const fetchUser = require('../middleware/fetchUser');
const { body } = require('express-validator');

// Route to set email
router.post('/setemail',
    [
        body('email', 'Invalid Email Address').isEmail(),
        body('password', 'Password must be correct').isAscii(),
        body('host', 'Invalid Host address').isAscii(),
        body('shouldVerify', 'Action not mentioned').isBoolean(),
    ],
    fetchUser,
    EmailController.setEmail
);

// Route to get email
router.get('/getemail', fetchUser, EmailController.getEmail);

// Route to delete email
router.delete('/deleteemail/:email_id', fetchUser, EmailController.deleteEmail);

// Route to update email
router.put('/updateemail/:email_id', fetchUser, EmailController.updateEmail);

// Route to sync email
router.post('/syncemail/:email_id', fetchUser, EmailController.syncData);

// Route to change email order
router.put('/changeorder/:email_id', fetchUser, EmailController.changeOrder);

module.exports = router;
