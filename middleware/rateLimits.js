const BannedIPs = require("../models/BannedIPs");

const rateLimits = async (req, res, next) => {
    const userIP = req.ip;
    const bannedRecord = await BannedIPs.findOne({ ipAddress: userIP });
    if (bannedRecord) {
        if (bannedRecord.bannedUntil <= new Date()) {
            await BannedIP.deleteOne({ ip: userIP });
        } else {
            return res.status(403).send('IP address is banned.');
        }
    }

    if (req.rateLimit.remaining <= 0) {
        const bannedIp = new BannedIPs({ ipAddress: userIP })
        bannedIp.save();
        return res.status(429).json({ status:"error",error: "Rate limit exceeded. Please try again later." });
    }
    next();
}


module.exports = rateLimits;