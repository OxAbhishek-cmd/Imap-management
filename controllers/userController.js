const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { nodemail } = require('./nodemailer');
const JWT_SECRET = process.env.JWT_SECRET;
const { validationResult } = require('express-validator');

// Generate a JWT token
const generateToken = (payload, expiresIn = undefined) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn });

// Generate hash password
const generateHashPassword = async (password) => {
    const salt = process.env.SALT;
    return await bcrypt.hash(password, salt);
};

// Check if the password matches
const isMatch = async (byUser, byDatabase) => bcrypt.compare(byUser, byDatabase);

// Send password reset email
const sendPasswordResetEmail = async (email, resetLink) => {
    const response = await nodemail(email, 'Verify Forget Password', `
        <div style="font-family: Arial, sans-serif;">
            <style>p { font-size: 16px; line-height: 1.5; }</style>
            <h1 style="color: #0073e6;">Password Reset</h1>
            <p>Hello,</p>
            <p>You have requested a password reset for your account. To reset your password, please click the link below:</p>
            <p><a href="${resetLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #0073e6; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>Link will expire in 30 minutes</p>
            <p>If you did not request a password reset, you can ignore this email.</p>
            <p>Thank you!</p>
        </div>
    `);

    return response.response ? 'Password reset email sent successfully' : 'Unable to send mail';
};

// Handle errors in a uniform way
const handleError = (res, statusCode, errorMessage) => {
    return res.status(statusCode).json({ status: 'error', error: errorMessage });
};

// Register a new user
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleError(res, 400, errors.array());
    }
    const { email, password, name } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            return handleError(res, 409, 'Email already exists');
        }

        const hashedPassword = await generateHashPassword(password);
        const newUser = new User({ email, password: hashedPassword, name });

        newUser.save();
        const authtoken = generateToken({ user_id: newUser.id }, "7d");
        return res.status(201).json({ status: 'success', authtoken, error: null });
    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Registration failed');
    }
};

// User login
exports.loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleError(res, 400, errors.array());
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return handleError(res, 404, 'User not found');
        }
        if (await isMatch(password, user.password)) {
            const token = generateToken({ user_id: user.id }, "7d");
            return res.status(200).json({ status: 'success', error: null, authtoken: token, name: user.name });
        } else {
            return handleError(res, 401, 'Incorrect password');
        }
    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Login failed');
    }
};

// Get user
exports.getUser = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const user = await User.findById(user_id);
        if (user) {
            return res.status(200).json({ status: 'success', error: null, name: user.name });
        } else {
            return handleError(res, 404, 'Invalid Credentials');
        }
    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Something went wrong');
    }
};
// Update Credentials
exports.updateUser = async (req, res) => {
    const user_id = req.user.user_id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleError(res, 400, errors.array());
    }
    const { name, email, password } = req.body;
    try {
        const user = await User.findById(user_id);
        if (!user) {
            return handleError(res, 404, 'Invalid Credentials');
        }
        // Verify the old password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            await User.findByIdAndUpdate(user_id, { $set: { name: name || user.name, email: email || user.email,tokenInvalidatedAt:new Date() } });
            return res.status(200).json({ status: 'success', error: null });
        } else {
            return handleError(res, 401, 'Incorrect password');
        }
    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Something went wrong');
    }
};


// Update Password
exports.updatePassword = async (req, res) => {
    const user_id = req.user.user_id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleError(res, 400, errors.array());
    }
    const { password, newPassword } = req.body;
    try {
        const user = await User.findById(user_id);
        if (!user) {
            return handleError(res, 404, 'Invalid Credentials');
        }
        if (await !isMatch(password, user.password)) {
            return handleError(res, 401, 'Incorrect password');
        }
        user.tokenInvalidatedAt = new Date(); // Set the current timestamp
        await user.save();
        const User = User.findByIdAndUpdate(user_id, { $set: { password: await generateHashPassword(newPassword) } });
        const authtoken = generateToken({ user_id: newUser.id }, "7d");
        return res.status(202).json({ status: 'success', error: null ,authtoken});
    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Something went wrong');
    }
};

// Forget password request
exports.forgetPasswordApproval = async (req, res) => {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleError(res, 400, errors.array());
    }
    const user = await User.findOne({ email });
    try {
        if (!user) {
            return handleError(res, 404, 'Invalid Credentials');
        }

        const resetToken = generateToken({ user_id: user.id, reason: 'forget password request' }, '30m');
        const resetLink = `${process.env.DOMAIN}/reset-password/${resetToken}`;
        const message = await sendPasswordResetEmail(user.email, resetLink);
        return res.status(200).json({ status: 'success', message });
    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Something went wrong');
    }
};

exports.forgetPasswordSuccess = async (req, res) => {
    const { newPassword } = req.body;
    const { user_id, reason } = req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleError(res, 400, errors.array());
    }
    if (reason !== 'forget password request') {
        return handleError(res, 403, 'Unauthorized Action');
    }
    try {
        const user = await User.findById(user_id);

        if (!user) return handleError(res, 404, 'Invalid User');

        const isTokenExpired = (decodedToken) => {
            const now = Math.floor(Date.now() / 1000);
            return decodedToken.payload.exp && decodedToken.payload.exp < now;
        };

        const decodedToken = jwt.decode(req.header('auth-token'), { complete: true });

        if (isTokenExpired(decodedToken)) {
            return handleError(res, 400, 'Token has expired');
        }

        const hashedPassword = await generateHashPassword(newPassword);
        await User.findByIdAndUpdate(user_id, { $set: { password: hashedPassword,tokenInvalidatedAt:new Date() } });
        const authtoken = generateToken({ user_id: newUser.id }, "7d");
        res.status(200).json({ status: 'success', message: 'Password reset successful', authtoken});
    } catch (error) {
        console.error(error);
        handleError(res, 500, 'Something went wrong');
    }
};