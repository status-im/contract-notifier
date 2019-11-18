const sgMail = require("@sendgrid/mail");
const Handlebars = require("handlebars");

class SendGridMailer {
  constructor(config, logger) {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
    this.logger = logger;
  }

  send(template, from, data) {
    const logger = this.logger;
    return new Promise((resolve, reject) => {
      const tplText = Handlebars.compile(template.text);
      const tplHtml = Handlebars.compile(template.html);

      const msg = {
        to: data.email,
        from,
        ...template,
        text: tplText(data),
        html: tplHtml(data)
      };

      sgMail.send(msg, (error, result) => {
        if (error) {
          if(logger){
            logger.error('Sendgrid', error);
          }
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = SendGridMailer;
