const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const Connection = require('./database/config.js');

const app = express();

dotenv.config();

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/', Router);
// Routes (you'll create these later)
app.use('/api/users', require('./routes/users'));
//  http://localhost:5000/api/users/register          POST
//  http://localhost:5000/api/users/login             POST
//  http://localhost:5000/api/users/getUser           POST

app.use('/api/emails', require('./routes/emails'));
// http://localhost:5000/api/emails/getemail          POST
// http://localhost:5000/api/emails/postEmailList     GET

app.use("/api/inbox",require("./routes/imap.js"))
// http://localhost:5000/api/inbox/inbox-emails       GET
// http://localhost:5000/api/inbox/email-content/     GET

Connection();
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
