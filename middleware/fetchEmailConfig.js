require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const Email = require('../models/Email.js');

// Middleware to fetch email configuration
const fetchEmailConfig = async (req, res, next) => {
    const token = req.header("auth-token");

    // Check for authentication token
    if (!token) {
        return res.status(401).json({ error: "Access denied" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user_id = data.user_id; // Extract user_id from the token
    } catch (error) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }

    // Extract email_id from route parameters
    const email_id = req.params.email_id;

    // Find email configuration based on user_id and email_id
    const emailConfig = await Email.findOne({ _id: email_id, action: true, user_id: req.user_id })
        .select(['email', 'password', 'host', 'port']);

    if (!emailConfig) {
        return res.status(404).json({ status: "error", error: "Email configuration not found" });
    }

    // Store the email configuration in the request object
    req.emailConfig = emailConfig;
    next();
};

module.exports = fetchEmailConfig;
