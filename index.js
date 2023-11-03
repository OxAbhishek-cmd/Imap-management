const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const Connection = require('./database/config.js');
const rateLimit = require('express-rate-limit');
const BannedIPs = require('./models/BannedIPs.js');
const rateLimits = require('./middleware/rateLimits.js');
const trackbannedIP = require('./middleware/trackbannedip.js');
const app = express();
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per IP
});
dotenv.config();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(apiLimiter, rateLimits, trackbannedIP)
app.get('/', async (req, res) => {
    const userIP = req.ip;
    const bannedRecord = await BannedIPs.findOne({ ipAddress: userIP });
    if (bannedRecord) {
        // Check if the ban has expired
        if (bannedRecord.bannedUntil > new Date()) {
            return res.status(403).send('IP address is banned.');

        } else {
            await BannedIP.deleteOne({ ipAddress: userIP });
        }
        res.render("index.js");
    }
});
// Routes (you'll create these later)
app.use('/api/users', require('./routes/users'));
//  http://localhost:5000/api/users/register                POST
//  http://localhost:5000/api/users/login                   POST
//  http://localhost:5000/api/users/getUser                 GET
//  http://localhost:5000/api/users/updateuser              PUT
//  http://localhost:5000/api/users/changepassword          PUT
//  http://localhost:5000/api/users/forgetpassword          POST
//  http://localhost:5000/api/users/forgetpassword          PUT

app.use('/api/emails', require('./routes/emails'));
// http://localhost:5000/api/emails/setemail          POST
// http://localhost:5000/api/emails/getemail          GET
// http://localhost:5000/api/emails/deleteemail       DELETE
// http://localhost:5000/api/emails/updateemail         PUT

app.use("/api/inbox", require("./routes/imap.js"))
// http://localhost:5000/api/inbox/inbox-emails       GET
// http://localhost:5000/api/inbox/email-content/     GET

app.use("/ip", require("./routes/ip.js"));


Connection();
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
