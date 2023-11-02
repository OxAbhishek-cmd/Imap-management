const mongoose = require("mongoose");
require('dotenv').config();

const Connection = async () => {
    const URL = `mongodb://127.0.0.1:27017/mailadda`
    try {
        await mongoose.connect(URL);
        console.log('Database Connected Successfully');
    } catch (error) {
        console.log('Error: ', error.message);
    }
}

module.exports= Connection;
