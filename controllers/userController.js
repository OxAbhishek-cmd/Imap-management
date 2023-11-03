const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { nodemail } = require('./nodemailer');
const JWT_SECRET = process.env.JWT_SECRET;
const { validationResult } = require('express-validator');
const Log = require('../models/Log');
//generate a JWT token
function generateToken(payload, expiresIn = undefined) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

//generate hashpassword
async function generateHashPassword(password) {
    const salt = process.env.SALT
    return await bcrypt.hash(password, salt);
}

//check password
async function isMatch(byUser, byDatabase) {
    return await bcrypt.compare(byUser, byDatabase)
}

// To send password reset email
async function sendPasswordResetEmail(email, resetLink) {
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
}

async function logDetails(action, ipAddress, user_id = undefined) {
    const log = new Log({ user_id, action, ipAddress });
    log.save();
}

// Register a new user
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logDetails('Validation failed during registration', req.ip);
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            logDetails(`${email} trying to create an account, but the account already exists.`, req.ip);
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await generateHashPassword(password);
        const newUser = new User({ email, password: hashedPassword, name });

        newUser.save();
        logDetails(`${email},${name} Created a new Account.`, req.ip, newUser.id);
        const authtoken = generateToken({ user_id: newUser.id }, "7d");
        return res.status(200).json({ authtoken, error: null });
    } catch (error) {
        console.error(error);
        logDetails('Registration failed', req.ip);
        return res.status(500).json({ error: 'Registration failed' });
    }
};

// User login
exports.loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logDetails('Validation failed during login', req.ip); // Log validation failure
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            logDetails(`Trying to unauthorized access using invalid credentials`, req.ip);
            return res.status(404).json({ error: 'User not found' });
        }

        if (isMatch(password, user.password)) {
            const token = generateToken({ user_id: user.id }, "7d");
            logDetails(`${email} user Logged in`, req.ip, user.id);
            return res.status(201).json({ error: null, authtoken: token, name: user.name });
        } else {
            logDetails(`${email} trying to unauthorized access using an invalid password`, req.ip);
            return res.status(400).json({ error: 'Incorrect password' });
        }
    } catch (error) {
        console.error(error);
        logDetails('Login failed', req.ip);
        return res.status(500).json({ error: 'Login failed' });
    }
};

// Get user
exports.getUser = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const user = await User.findById(user_id);
        if (user) {
            logDetails('User accessed their profile', req.ip, user.id); // Log user profile access
            return res.status(200).json({ error: null, name: user.name });
        } else {
            logDetails('Invalid Credentials when accessing profile', req.ip, user_id); // Log invalid profile access
            return res.status(404).json({ error: 'Invalid Credentials' });
        }
    } catch (error) {
        console.error(error);
        logDetails('Something went wrong when accessing profile', req.ip, user_id); // Log error
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Update Credentials
exports.updateUser = async (req, res) => {
    const user_id = req.user.user_id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logDetails('Validation failed on credentials update', req.ip, user_id); // validation failure
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
        const user = await User.findById(user_id);
        if (!user) {
            logDetails('Trying to Change Credentials using invalid Credentials', req.ip, user_id); // Log unauthorized access
            return res.status(404).json({ error: 'Invalid Credentials' });
        }
        if (isMatch(password, user.password)) {
            await User.findByIdAndUpdate(user_id, { $set: { name: name || user.name, email: email || user.email } });
            logDetails('Credentials Updated', req.ip, user_id); // Log successful update
            return res.status(200).json({ error: null, status: 'success' });
        } else {
            logDetails('Trying to Change Credentials using invalid password', req.ip, user_id); // Log unauthorized access
            return res.status(400).json({ error: 'Incorrect password' });
        }
    } catch (error) {
        console.error(error);
        logDetails('Something went wrong when updating profile', req.ip, user_id); // Log error
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Update Password
exports.updatePassword = async (req, res) => {
    const user_id = req.user.user_id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logDetails('Validation failed on Password update', req.ip, user_id); // validation failure
        return res.status(400).json({ errors: errors.array() });
    }
    const { password, newPassword } = req.body;
    try {
        const user = await User.findById(user_id);
        if (!user) {
            logDetails('Invalid Credentials when updating password', req.ip, user_id); // Log invalid password update
            return res.status(404).json({ error: 'Invalid Credentials' });
        }
        if (isMatch(password, user.password)) {
            await User.findByIdAndUpdate(user_id, { $set: { password: await generateHashPassword(newPassword) } });
            logDetails('Password Updated', req.ip, user_id); // Log successful password update
            res.status(202).json({ error: null, status: 'success' });
        } else {
            logDetails('Incorrect password when updating password', req.ip, user_id); // Log incorrect password update
            res.status(400).json({ error: 'Incorrect password' });
        }
    } catch (error) {
        console.error(error);
        logDetails('Something went wrong when updating password', req.ip, user_id); // Log error
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Forget password request
exports.forgetPasswordApproval = async (req, res) => {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logDetails('Trying unapperopriate way to Reset Password', req.ip); // validation failure
        return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findOne({ email });
    try {
        if (!user) {
            logDetails('Forget password request failed - Invalid Credentials', req.ip, user.id); // Log invalid forget password request
            return res.status(404).json({ error: 'Invalid Credentials' });
        }

        const resetToken = generateToken({ user_id: user.id, reason: 'forget password request' }, '30m');
        const resetLink = `${process.env.DOMAIN}/reset-password/${resetToken}`;
        logDetails('Forget password email sent', req.ip, user.id); // Log forget password email sent
        const message = await sendPasswordResetEmail(user.email, resetLink);
        res.status(200).json({ message });
    } catch (error) {
        console.error(error);
        logDetails('Something went wrong with forget password request', req.ip, user.id); // Log error
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.forgetPasswordSuccess = async (req, res) => {
    const { newPassword } = req.body;
    const { user_id, reason } = req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logDetails('Invalid Response on Reset', req.ip); // validation failure
        return res.status(400).json({ errors: errors.array() });
    }
    if (reason !== 'forget password request') {
        return res.status(403).json({ error: 'Unauthorized Action' });
    }
    try {
        const user = await User.findById(user_id);

        if (!user) return res.status(404).json({ error: 'Invalid User' });

        const isTokenExpired = (decodedToken) => {
            const now = Math.floor(Date.now() / 1000);
            return decodedToken.payload.exp && decodedToken.payload.exp < now;
        };

        const decodedToken = jwt.decode(req.header('auth-token'), { complete: true });

        if (isTokenExpired(decodedToken)) {
            return res.status(400).json({ error: 'Token has expired' });
        }

        const hashedPassword = await generateHashPassword(newPassword);
        await User.findByIdAndUpdate(user_id, { $set: { password: hashedPassword } });
        logDetails('Password reset successful', req.ip, user_id); // Log password reset success
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        logDetails('Something went wrong with forget password success', req.ip, user_id); // Log error
        res.status(500).json({ error: 'Something went wrong' });
    }
};