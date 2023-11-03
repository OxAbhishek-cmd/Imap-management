const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WhitelistIPsSchema = new Schema({
    ipAddress: {
        type: String,
        required: true,
        unique: true
    },

});

module.exports = WhitelistIps= mongoose.model('WhitelistIPs', WhitelistIPsSchema);
