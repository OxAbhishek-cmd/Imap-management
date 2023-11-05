const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const fetchuser = require('../middleware/fetchUser');
const { body } = require('express-validator');

// Route for user registration
router.post('/register', [
    body("name").isLength({ min: 5 }).withMessage('Name must be at least 5 characters long'),
    body("email").isEmail().normalizeEmail().withMessage('Invalid email address'),
    body("password").isStrongPassword().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long and contain a combination of uppercase, lowercase, number, and special characters')
], UserController.registerUser);

// Route for user login
router.post('/login', [
    body("email").isEmail().normalizeEmail().withMessage('Invalid email address'),
    body("password").isStrongPassword().isLength({ min: 8 }).withMessage('Invalid password')
], UserController.loginUser);

// Route for get User
router.get('/getuser', fetchuser, UserController.getUser);

// Route for update credentials
router.put('/updateuser', [
    body("name").isLength({ min: 5 }).withMessage('Name must be at least 5 characters long'),
    body("email").isEmail().normalizeEmail().withMessage('Invalid email address')
], fetchuser, UserController.updateUser);

// Route for update password
router.put("/changepassword", [
    body("password").isStrongPassword().isLength({ min: 8 }).withMessage('Invalid password'),
    body("newPassword").isStrongPassword().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long and contain a combination of uppercase, lowercase, number, and special characters')
], fetchuser, UserController.updatePassword);

// Route for forget password request
router.post("/forgetpassword", [
    body("email").isEmail().normalizeEmail().withMessage('Invalid email address')
], UserController.forgetPasswordApproval);

// Route for change password approval
router.put("/forgetpassword", [
    body("newPassword").isStrongPassword().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long and contain a combination of uppercase, lowercase, number, and special characters')
], fetchuser, UserController.forgetPasswordSuccess);

module.exports = router;