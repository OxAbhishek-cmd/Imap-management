const { createTransport } = require("nodemailer");
require("dotenv").config();

const nodemail = async (email, subject, body) => {
    const transporter = createTransport({
        host: "smtp.mxcody.in",
        port: 465,
        secure: true,
        auth: {
            user: process.env.HOST_EMAIL,
            pass: process.env.HOST_PASSWORD,
        },
    });


    const info = await transporter.sendMail({
        from: 'no-reply@mxcody.in',
        to: email,
        subject: subject,
        html: body,
    });
    { info }
    return info;

};

module.exports = nodemail;