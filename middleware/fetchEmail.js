const Email = require('../models/Email.js');
const fetchEmail = async (req, res, next) => {
    // Get the user from the JWT token and add it to the req object
    const id = req.query.id;
    const emailConfig = await Email.findById(id).select(['email', 'password', 'host', 'port']);
    req.emailConfig = emailConfig;
    next();
    
};
module.exports = fetchEmail;