const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  count:{
    type:Number,
    required:true,
    default:0
  },
  tokenInvalidatedAt: {
    type: Date,
    default: null,
},
});

module.exports = User = mongoose.model('users', UserSchema);
