const Email = require('../models/Email');


// Get a list of inbox emails
exports.getEmails = async (req, res) => {
    const { email, password, host, port, name } = req.body;
    const user_id = req.user.user_id;

    try {
        const existingEmail = await Email.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        } else {
            const newEmail = new Email({ email, password, host, port, user_id, name });
            await newEmail.save();
            res.json({ status: 'success', error: null });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Email account creation failed' });
    }
};

// Get the list of emails associated with a specific user
exports.getEmailList = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const emails = await Email.find({ user_id }).select(['email', 'name']);

        if (emails.length > 0) {
            return res.status(200).json({ emails, error: null, count: emails.length });
        } else {
            return res.status(201).json({ error: 'No emails found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Email list retrieval failed' });
    }
};

