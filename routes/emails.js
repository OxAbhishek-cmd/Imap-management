const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/emailController');
const fetchuser = require('../middleware/fetchUser');
const { body } = require('express-validator');

router.post("/checkemail",[body("email","Invalid Email Address").isEmail(),body("password","Password must be correct").isAscii(),body("host","Invalid Host address").isAscii(),body("port","Invalid Port Number").isAlphanumeric()],fetchuser,EmailController.checkemail)

// Route to set emails
router.post('/setemail',[body("email","Invalid Email Address").isEmail(),body("password","Password must be correct").isAscii(),body("host","Invalid Host address").isAscii(),body("port","Invalid Port Number").isAlphanumeric()], fetchuser,EmailController.setEmail);

// Route to get email
router.get('/getemail', fetchuser, EmailController.getEmail);

// Route to delete email
router.delete('/deleteemail', fetchuser, EmailController.deleteEmail);

// Route to put email
router.put('/updateemail', fetchuser, EmailController.updateEmail);


module.exports = router;
