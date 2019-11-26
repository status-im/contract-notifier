const sgMail = require("@sendgrid/mail");
const Handlebars = require("handlebars");
const { markdownToTxt } = require('markdown-to-txt');
const marked = require('marked');

class SendGridMailer {
  constructor(config, logger) {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
    this.logger = logger;
  }

  send(template, from, data) {
    const logger = this.logger;
    return new Promise((resolve, reject) => {
      const body = Handlebars.compile(template.body)(data);
    
      const msg = {
        to: data.email,
        from,
        subject: template.subject,
        text: markdownToTxt(body)
      }

      if(template.html){
        msg.html = marked(body);
      }

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
