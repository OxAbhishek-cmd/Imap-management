require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const fetchUser = async (req, res, next) => {

  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }
  const data = jwt.verify(token, JWT_SECRET);

  const user_id = data.user_id;

  try {
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(401).json({ error: 'Access denied. User not found.' });
    }

    if (user.tokenInvalidatedAt !== null && user.tokenInvalidatedAt > user.tokenCreatedAt) {
      return res.status(401).json({ error: 'Access denied. Please reauthenticate.' });
    }

    // Pass the user to the next middleware
    req.user = { name: user.name, email: user.email, password: user.password, _id: user._id };
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

module.exports = fetchUser;
