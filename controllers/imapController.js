const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const { JSDOM } = require('jsdom');
const fs= require("fs");
const cleanHTMLString = (input) => {

  let data = input.replace(/<!doctype html>([\s\S]*?)<\/head>/, "")
  data = data.replace(/<\/html>/, "");
  data= data.replace(/\\n/,"")
  fs.writeFileSync("newlyyy.html",data);
  return data;
}

const config = (emailConfig) => new Imap({
  user: emailConfig.email,
  password: emailConfig.password,
  host: emailConfig.host,
  port: emailConfig.port,
  tls: true,
  authTimeout: 30000
});

exports.fetchInboxEmails = async (req, res) => {
  const imap = config(req.emailConfig);
  const mail = { emails: [], error: null };
  imap.once("ready", () => {
    imap.openBox("INBOX", true, (err, box) => {
      if (err) {
        mail.error = err;
        console.log(err);
      }
      else {
        const fetch = imap.seq.fetch('1:*', { bodies: ['HEADER.FIELDS (FROM CC BCC DATE SUBJECT)'], struct: true, });
        fetch.on("message", (message, sequence) => {
          const email = { id: sequence };
          message.on("body", (stream, info) => {
            let data = '';
            stream.on("data", (chunk) => {

              data += chunk.toString("utf8");
            })
            stream.once("end", () => {
              const parsedData = Imap.parseHeader(data);
              email.from = parsedData.from;
              email.cc = parsedData.cc;
              email.bcc = parsedData.bcc;
              email.date = parsedData.date;
              email.subject = parsedData.subject;
            });
          })
          message.on("end", () => {
            mail.emails.push(email);
          })
        });
        fetch.once("end", () => {
          imap.end();
          return res.status(200).json({ count: mail.emails.length, mail });
        })
      }
    })
  });
  imap.once("error", (err) => {
    mail.error = err;
    res.status(500).json({ error: 'Failed to fetch email content', details: err.message });
  });
  imap.once("end", () => {
    console.log("connection ended")
  })
  imap.connect();
}

exports.fetchEmailContent = async (req, res) => {
  const seqno = Number(req.params.seqno);
  const imap = config(req.emailConfig);
  const mail = { emails: [], error: null };

  imap.once('ready', () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) {
        mail.error = err;
        console.log(err);
      } else {
        const fetch = imap.fetch(seqno, {
          bodies: '',
          markSeen: true,
        });
        let data = '';
        const email = { id: seqno };
        fetch.on('message', (message, seqno) => {

          message.on("body", (stream, info) => {

            stream.on('data', (chunk) => {

              data += chunk.toString('utf8');
            });
            stream.once('end', () => {

              const parsedData = Imap.parseHeader(data);
              email.from = parsedData.from;
              email.cc = parsedData.cc;
              email.bcc = parsedData.bcc;
              email.date = parsedData.date;
              email.subject = parsedData.subject;

            });
          });
          message.on("attributes", (attrs) => {
            const attachments = attrs.struct;
            email.attachment = attachments;
          });
        });
        fetch.once('end', () => {
          simpleParser(data, async (err, parsed) => {
            if (err) {
              console.error('Error parsing email:', err);
              mail.error = err;
            } else {
              email.mailContent = cleanHTMLString(parsed.html || parsed.textAsHtml || parsed.text);
            }
            mail.emails.push(email);
            res.status(200).json({ mail });
          });
          imap.end();
        });
      }
    });
  });
  imap.once('error', (err) => {
    mail.error = err;
    res.status(500).json({ error: 'Failed to fetch email content', details: err.message });
  });
  imap.once("end", () => {
    console.log("connection ended");
  });
  imap.connect();
};





