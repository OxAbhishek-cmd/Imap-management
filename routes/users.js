const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const fetchuser = require('../middleware/fetchUser');
const { body } = require('express-validator');

// Route for user registration
router.post('/register', [body("name").isLength({ min: 5 }), body("email").isEmail().normalizeEmail(), body("password").isStrongPassword().isLength({ min: 8 })], UserController.registerUser);

// Route for user login
router.post('/login', [body("email").isEmail().normalizeEmail(), body("password").isStrongPassword().isLength({ min: 8 }),], UserController.loginUser);

//Routr for get User
router.get('/getuser', fetchuser, UserController.getUser);

//Route for update credentials
router.put('/updateuser', [body("name").isLength({ min: 5 }), body("newPassword").isStrongPassword().isLength({ min: 8 })], fetchuser, UserController.updateUser);

//Route for update password
router.put("/changepassword", [body("password").isStrongPassword().isLength({ min: 8 }), body("newPassword").isStrongPassword().isLength({ min: 8 })], fetchuser, UserController.updatePassword);

//Route for forget password request
router.post("/forgetpassword", [body("email").isEmail().normalizeEmail()], UserController.forgetPasswordApproval);

//Route for change password approval
router.put("/forgetpassword", [body("newPassword").isStrongPassword().isLength({ min: 8 })], fetchuser, UserController.forgetPasswordSuccess)

module.exports = router;