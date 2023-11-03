const BannedIPs = require("../models/BannedIPs");
const WhitelistIps = require("../models/WhitelistIps");

const rateLimits = async (req, res, next) => {
    if (req.rateLimit.remaining <= 0) {
        const checkWhiteList = await WhitelistIps.findOne({ ipAddress: req.ip });
        if (!checkWhiteList) {
            const bannedIp = new BannedIPs({ ipAddress: req.ip })
            bannedIp.save();
            return res.status(429).json({ error: "warning", warining: 'Rate limit exceeded. Please try again later.' });
        }
    }
    next();
}
module.exports = rateLimits;