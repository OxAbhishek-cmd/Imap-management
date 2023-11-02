const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const fetchuser = require('../middleware/fetchUser');

// Route for user registration
router.post('/register',UserController.registerUser);

// Route for user login
router.post('/login', UserController.loginUser);

//Routr for get User
router.post('/getUser', fetchuser,UserController.getUser);

module.exports = router;