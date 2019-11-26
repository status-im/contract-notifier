const path = require("path");
const fs = require("fs");
const dappSchema = require('./dapp-schema');

class DAppConfig {
  constructor(config, logger) {
    this.configurations = {};
    this.appConfig = config;
    this.logger = logger;

    this.validate();
  }

  validate() {
    const exitError = msg => {
      this.logger.error(msg);
      process.exit(1);
    };

    this.appConfig.VALID_DAPPS.forEach(dapp => {
      if (!fs.existsSync(`./dapps/${dapp}`)) exitError(`Folder ./dapps/${dapp} does not exist`);
      if (!fs.existsSync(`./dapps/${dapp}/config.js`)) exitError(`Config ./dapps/${dapp}/config.js does not exist`);

      const dappConfig = require(`./dapps/${dapp}/config.js`);
      
      const result = dappSchema.validate(dappConfig);
      if (result.error) exitError(result.error);

      // TODO: validate templates exists
    });
  }

  isDapp(dappId) {
    return this.appConfig.VALID_DAPPS.indexOf(dappId) > -1;
  }

  getDapps() {
    return this.appConfig.VALID_DAPPS;
  }

  config(dappId) {
    if (this.configurations[dappId]) {
      return this.configurations[dappId];
    }

    this.configurations[dappId] = require("./" + path.join("./dapps/", dappId, "config.js"));

    return this.configurations[dappId];
  }

  contracts(dappId) {
    const dappConfig = this.config(dappId);
    return Object.keys(dappConfig.templates.contracts);
  }

  ABI(dappId, contract) {
    const dappConfig = this.config(dappId);
    const ABI = Object.values(dappConfig.templates.contracts[contract].events)
      .map(x => x.ABI)
      .reduce((accum, curr) => {
        if (accum.find(x => x.name === curr.name)) return accum;
        return [...accum, curr];
      }, []);
    return ABI;
  }

  template(dappId, templateName) {
    const dappConfig = this.config(dappId);
    return dappConfig.templates[templateName];
  }

  eventConfig(dappId, contract, eventName) {
    const dappConfig = this.config(dappId);
    return Object.values(dappConfig.templates.contracts[contract].events).filter(
      x => x.ABI.name === eventName && x.ABI.type === "event"
    );
  }

  getEmailTemplate(dappId, template) {
    const templatePath = path.join("./dapps", dappId);
    const subject = template.subject;

    // TODO: avoid reading this on each user/email
    const text = fs.readFileSync(path.join(templatePath, template.text)).toString();
    const html = fs.readFileSync(path.join(templatePath, template.html)).toString();
    return { text, html, subject };
  }
}

module.exports = DAppConfig;
