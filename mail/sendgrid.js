const sgMail = require("@sendgrid/mail");
const Handlebars = require("handlebars");

class SendGridMailer {
  constructor(config) {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
  }

  send(template, from, data) {
    const tplText = Handlebars.compile(template.text);
    const tplHtml = Handlebars.compile(template.html);

    const msg = {
      to: data.email,
      from,
      ...template,
      text: tplText(data),
      html: tplHtml(data)
    };

    sgMail.send(msg);
  }
}

module.exports = SendGridMailer;
