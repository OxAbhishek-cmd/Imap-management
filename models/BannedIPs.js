const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BannedIpSchema = new Schema({
    ipAddress: {
        type: String,
        required: true,
        unique: true
    },
    bannedUntil:{
        type:Date,
        required:true
    }
});

module.exports = BannedIp= mongoose.model('BannedIp', BannedIpSchema);
