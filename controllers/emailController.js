const { validationResult } = require('express-validator');
const Email = require('../models/Email');
const Imap = require('imap');

// Function to check IMAP connection
async function checkIMAPConnection(email, password, host) {
    return new Promise((resolve, reject) => {
        const imap = new Imap({
            user: email,
            password,
            host,
            port: 993,
            tls: true,
            authTimeout: 30000
        });

        // Handle any errors
        imap.once('error', (err) => reject(err));

        // When the connection is ready, fetch mailbox information
        imap.once('ready', () => {
            imap.getBoxes((err, mailboxTree) => {
                if (err) {
                    reject(err);
                } else {
                    imap.end();
                    resolve(mailboxTree);
                }
            });
        });

        // Connect to the IMAP server
        imap.connect();
    });
}

// Route to set email
exports.setEmail = async (req, res) => {
    const user_id = req.user.user_id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", error: errors.array() });
    }

    try {
        const { name, email, password, host, shouldVerify } = req.body;
        const mailboxTree = shouldVerify ? await checkIMAPConnection(email, password, host) : [];

        const existingEmail = await Email.findOne({ email, user_id });

        if (existingEmail) {
            return res.status(400).json({ status: "error", error: "Email already exists" });
        }

        const cred = new Email({ name, email, password, host, user_id, action: shouldVerify, mailboxTree });
        await cred.save();

        return res.status(200).json({ status: "success", error: null });
    } catch (error) {
        return res.status(500).json({ status: "error", error: "An error occurred while processing your request. Please try again later." });
    }
}

// Route to get email
exports.getEmail = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const emails = await Email.find({ user_id }).select(["_id", "email"]);
        return res.status(200).json({ status: "success", error: null, emails, count: emails.length });
    } catch (error) {
        return res.status(500).json({ status: "error", error: "An error occurred while processing your request. Please try again later." });
    }
}

// Route to delete email
exports.deleteEmail = async (req, res) => {
    const user_id = req.user.user_id;
    const email_id = req.params.email_id;

    try {
        const del = await Email.findOneAndDelete({ user_id, _id: email_id });

        if (del) {
            return res.status(200).json({ status: "success", error: null });
        } else {
            return res.status(404).json({ status: "error", error: "Email not found" });
        }
    } catch (error) {
        return res.status(500).json({ status: "error", error: "An error occurred while processing your request. Please try again later." });
    }
}

// Route to sync email data
exports.syncData = async (req, res) => {
    const user_id = req.user.user_id;
    const email_id = req.params.email_id;

    try {
        const result = await Email.findById(email_id);
        const { email, password, host } = result;
        const mailboxTree = await checkIMAPConnection(email, password, host);

        await Email.findOneAndUpdate({ user_id, _id: email_id }, { $set: { action: true, mailboxTree } });

        return res.status(200).json({ status: "success", error: null });
    } catch (error) {
        return res.status(500).json({ status: "error", error: "An error occurred while processing your request. Please try again later." });
    }
}

// Route to update email
exports.updateEmail = async (req, res) => {
    const user_id = req.user.user_id;
    const email_id = req.params.email_id;
    const { name, newPassword, newHost } = req.body;

    try {
        const email = await Email.findOne({ _id: email_id, user_id });

        if (!email) {
            return res.status(404).json({ status: 'error', error: 'Email not found' });
        }

        email.name = name || email.name;
        email.password = newPassword || email.password;
        email.host = newHost || email.host;

        const mailboxTree = await checkIMAPConnection(email.email, email.password, email.host);
        email.action = true;
        email.mailboxTree = mailboxTree;

        await email.save();

        return res.status(200).json({ status: 'success', error: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', error: 'An error occurred while processing your request. Please try again later.' });
    }
}

// Route to change the order of an email
exports.changeOrder = async (req, res) => {
    const user_id = req.user.user_id;
    const email_id = req.params.email_id;
    const newOrder = req.body.newOrder;

    try {
        const email = await Email.findOne({ _id: email_id, user_id });

        if (!email) {
            return res.status(404).json({ status: 'error', error: 'Email not found' });
        }

        const emailsToReorder = await Email.find({ user_id }).sort({ order: 1 });
        const filteredEmails = emailsToReorder.filter((e) => e._id.toString() !== email_id);

        if (newOrder < 1 || newOrder > filteredEmails.length + 1) {
            return res.status(400).json({ status: 'error', error: 'Invalid new order' });
        }

        email.order = newOrder;
        let updatedOrder = 1;
        const updatedEmails = filteredEmails.map((e) => {
            e.order = updatedOrder;
            updatedOrder++;
            return e;
        });

        updatedEmails.push(email);

        await Email.bulkWrite(
            updatedEmails.map((e) => ({
                updateOne: {
                    filter: { _id: e._id },
                    update: { $set: { order: e.order } },
                },
            }))
        );

        return res.status(200).json({ status: 'success', error: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', error: 'An error occurred while processing your request. Please try again later.' });
    }
}
