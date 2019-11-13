const sgMail = require("@sendgrid/mail");
const path = require("path");
const fs = require("fs");

class SendGridMailer {
  constructor(config) {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
  }

  send(template, from, data) {
    // TODO: data should be used for templating

    const msg = {
      to: data.email,
      from,
      ...template
    };

    sgMail.send(msg);
  }
}

module.exports = SendGridMailer;
