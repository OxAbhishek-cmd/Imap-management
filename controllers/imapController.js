const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;

const cleanHTMLString = (input) => {
  return input.replace(/<!doctype html>([\s\S]*?)<\/head>/, "").replace(/<\/html>/, "").replace(/\\n/, "");
}

const createImapClient = (emailConfig) => {
  return new Imap({
    user: emailConfig.email,
    password: emailConfig.password,
    host: emailConfig.host,
    port: emailConfig.port,
    tls: true,
    authTimeout: 30000,
  });
}

const fetchEmailData = (imap, boxName, query, processEmail) => {
  return new Promise((resolve, reject) => {
    imap.openBox(boxName, false, (err, box) => {
      if (err) {
        return reject(err);
      }

      const fetch = imap.seq.fetch(query, { bodies: '', markSeen: true });
      let emailData = '';

      fetch.on('message', (message, sequence) => {
        message.on("body", (stream, info) => {
          stream.on('data', (chunk) => {
            emailData += chunk.toString('utf8');
          });
          stream.once('end', () => {
            const parsedData = Imap.parseHeader(emailData);
            processEmail(parsedData, sequence);
          });
        });
      });

      fetch.once('end', () => {
        resolve();
      });
    });
  });
}

exports.fetchInboxEmails = async (req, res) => {
  const imap = createImapClient(req.emailConfig);
  const mail = { emails: [], error: null };

  imap.once("ready", async () => {
    try {
      await fetchEmailData(imap, req.body.mailbox, '1:*', (parsedData, sequence) => {
        mail.emails.push({ id: sequence, ...parsedData });
      });
      imap.end();
      res.status(200).json({ status: 'success', error: null, count: mail.emails.length, mail });
    } catch (err) {
      mail.error = err;
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  imap.once('error', (err) => {
    mail.error = err;
    res.status(500).json({ status: 'error', error: err.message });
  });

  imap.once("end", () => {
    console.log("connection ended");
  });

  imap.connect();
}

exports.fetchEmailContent = async (req, res) => {
  const seqno = Number(req.param.seqno);
  const imap = createImapClient(req.emailConfig);
  const mail = { emails: [], error: null };

  imap.once('ready', async () => {
    try {
      await fetchEmailData(imap, req.body.mailbox, seqno, (parsedData, sequence) => {
        const email = { id: sequence, ...parsedData };
        email.attachment = parsedData.struct;
        simpleParser(emailData, async (err, parsed) => {
          if (!err) {
            email.mailContent = cleanHTMLString(parsed.html || parsed.textAsHtml || parsed.text);
          }
          mail.emails.push(email);
        });
      });
      imap.end();
      res.status(200).json({ status: 'success', error: null, mail });
    } catch (err) {
      mail.error = err;
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  imap.once('error', (err) => {
    mail.error = err;
    res.status(500).json({ status: 'error', error: err.message });
  });

  imap.once("end", () => {
    console.log("connection ended");
  });

  imap.connect();
}

exports.deleteOrMarkSeenEmail = async (req, res) => {
  const seqno = Number(req.param.seqno);
  const { mailbox, action } = req.body.mailbox;
  const imap = createImapClient(req.emailConfig);

  imap.once('ready', () => {
    imap.openBox(mailbox, true, (err, box) => {
      if (err) {
        res.status(500).json({ status: 'error', error: `Failed to open mailbox: ${mailbox}`, details: err.message });
        return;
      }

      imap.addFlags(seqno, action, (err) => {
        if (err) {
          res.status(500).json({ status: 'error', error: `Failed to mark email as ${action}`, details: err.message });
          return;
        }

        imap.expunge(() => {
          const successMessage = action === 'DELETED' ? 'Email deleted successfully' : 'Email marked as seen successfully';
          res.status(200).json({ status: 'success', error: null, message: successMessage });
        });
      });
    });
  });

  imap.once('error', (err) => {
    res.status(500).json({ status: 'error', error: `Failed to ${action} email`, details: err.message });
  });

  imap.once('end', () => {
    console.log('Connection ended');
  });

  imap.connect();
}
