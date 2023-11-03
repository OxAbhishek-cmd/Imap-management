const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const user = ["Registered", "Login", "Change name", "Change Email", "Change name and Email", "Change Password", "Forget Password Request"];
const email = ["New Imap Added", "Bulk Imap added", "Imap password change", "Imap email change", "Imap deleted", "Bulk Imap Deleted"];
const Imap = ["mail check of ???", "mail deleted"];
const IP = ["Ip banned", "IP unbanned by ","banned ip trying to action","new whitelist added"]

const LogSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    email_id: {
        type: Schema.Types.ObjectId,
        ref: 'emails'
    },
    action: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    ipAddress:{
        type:String,
        required:true,
    }
});

module.exports = Log = mongoose.model('log', LogSchema);
