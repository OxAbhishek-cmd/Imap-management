const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const Connection = require('./database/config.js');
const rateLimit = require('express-rate-limit');
const rateLimits = require('./middleware/rateLimits.js');

const app = express();
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per IP
});
dotenv.config();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(apiLimiter);
app.use(rateLimits);
app.get('/', async (req, res) => {

    res.render("index.js");
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

app.use('/api/configs', require('./routes/emails'));
// http://localhost:5000/api/configs/setemail          POST
// http://localhost:5000/api/configs/getemail          GET
// http://localhost:5000/api/configs/deleteemail/:_id       DELETE
// http://localhost:5000/api/configs/updateemail/:_id         PUT
// http://localhost:5000/api/configs/syncemail/:_id         POST
// http://localhost:5000/api/configs/changeorder/:_id         PUT

app.use("/api/email", require("./routes/imap.js"))
// http://localhost:5000/api/email/inbox-emails       GET
// http://localhost:5000/api/email/email-content/:email_id/:seqno     GET
// http://localhost:5000/api/email/flag:email_id/:seqno     GET

app.use("/ip", require("./routes/ip.js"));


Connection();
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
