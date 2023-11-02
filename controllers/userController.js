const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
// Register a new user
exports.registerUser = async (req, res) => {
    const { email, password ,name} = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ error: 'Email already exists' });
        } else {
            const newUser = new User({ email, password ,name});

            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(newUser.password, salt);

            await newUser.save();
            const authtoken = jwt.sign({ user_id: newUser.id }, JWT_SECRET);
            res.json({ authtoken, error: null });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// User login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const payload = { user_id: user.id };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            res.json({ error: null, authtoken: token ,name : user.name});
        } else {
            res.status(400).json({ error: 'Incorrect password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// get user
exports.getUser = async (req, res) => {
    const user_id = req.user.user_id; 
    try {
        const user = await User.findById(user_id);

        if (user) {
            return res.status(200).json({ error: null,name : user.name});
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

