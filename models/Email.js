const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmailSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    name:{
        type:String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    host: {
        type: String,
        required: true,
    },
    port: {
        type: Number,
        required: true,
    },

});

module.exports = Email = mongoose.model('emails', EmailSchema); 
