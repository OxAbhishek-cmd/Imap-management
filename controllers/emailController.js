const { validationResult } = require('express-validator');
const Email = require('../models/Email');
const Log = require('../models/Log');
const Imap = require('imap');
async function logDetails(action, ipAddress, user_id, email_id) {
    const log = new Log({ user_id, action, ipAddress, email_id });
    log.save();
}

const checkImap = (email, password, port , host)=>{
    const imap = new Imap({
    user:email,password,host,port,tls: true,authTimeout: 30000
    });
    imap.once('ready', () => {
        imap.end();
        callback(null, true); // Connection is correct
    });

    imap.once('error', (err) => {
        callback(err, false); // Connection is invalid
    });

    imap.connect();
}


exports.checkemail = async(req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logDetails('Validation failed during registration', req.ip);
        return res.status(400).json({ errors: errors.array() });
    }
    const {name ,email, password, port , host }= req.body;
    try {
        const check = checkImap({email, password,port , host});
    } catch (error) {
        
    }
} 
// exports. = async(req,res) =>{} 



function checkIMAPConnection(imapConfig, callback) {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
        imap.end();
        callback(null, true); // Connection is correct
    });

    imap.once('error', (err) => {
        callback(err, false); // Connection is invalid
    });

    imap.connect();

    // Additional event handlers to log connection-related errors
    imap.on('end', () => {
        console.log('IMAP connection ended');
    });

    imap.on('close', (hasError) => {
        if (hasError) {
            console.log('IMAP connection closed with an error');
        }
    });

    imap.on('end', () => {
        console.log('IMAP connection ended');
    });
}

// Example usage
const imapConfig = {
    user: 'your_email@example.com',
    password: 'your_password',
    host: 'imap.example.com',
    port: 993, // IMAPS port
    tls: true,
};

checkIMAPConnection(imapConfig, (err, isConnected) => {
    if (err) {
        console.error('IMAP Connection Error:', err.message);
        if (err.source) {
            console.error('Error Source:', err.source);
        }
    } else {
        if (isConnected) {
            console.log('IMAP Connection is correct');
        } else {
            console.log('IMAP Connection is invalid');
        }
    }
});
