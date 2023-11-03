const BannedIPs = require("../models/BannedIPs");


const trackbannedIP = async (req, res, next) => {

    const userIP = req.ip;
    const bannedRecord = await BannedIPs.findOne({ ipAddress: userIP });
    if (bannedRecord) {
        if (bannedRecord.bannedUntil <= new Date()) {
            await BannedIP.deleteOne({ ip: userIP });
        } else {
            return res.status(403).send('IP address is banned.');
        }
    }
    next();
}
module.exports = trackbannedIP;