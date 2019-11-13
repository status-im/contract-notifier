const sgMail = require("@sendgrid/mail");
const path = require("path");
const fs = require('fs');

class SendGridMailer {
  constructor(config) {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
  }

  send(dappId, template, data) {
    // TODO: extract this logic. Mailer only needs to worry about sending emails
    const templatePath = path.join("dapps", dappId);
    const config = require(path.join(path.join('../', templatePath, 'config.js')));
    const t = config.templates[template];
    
    // TODO: do not read these files constantly. Keep it on a cache or something. Also, don't use Sync.
    const text = fs.readFileSync(path.join(templatePath, t.text)).toString();
    const html = fs.readFileSync(path.join(templatePath, t.html)).toString();

    const msg = {
      to: data.email,
      from: config.from,
      subject: t.subject,
      text,
      html
    };

    sgMail.send(msg);
  }
}

module.exports = SendGridMailer;
