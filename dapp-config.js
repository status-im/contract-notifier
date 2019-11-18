const path = require("path");
const fs = require("fs");
class DAppConfig {
  constructor(config){
    this.configurations = {};
    this.appConfig = config;
  }

  isDapp(dappId) {
    return this.appConfig.VALID_DAPPS.indexOf(dappId) > -1;
  }

  getDapps(){
    return this.appConfig.VALID_DAPPS;
  }

  config(dappId) {
    if(this.configurations[dappId]) {
      return this.configurations[dappId];
    }

    this.configurations[dappId] = require('./' + path.join('./dapps/', dappId, "config.js"));
    
    return this.configurations[dappId];
  }

  contracts(dappId){
    const dappConfig = this.config(dappId);
    return Object.keys(dappConfig.templates.contracts);
  }

  ABI(dappId, contract){
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
    return Object.values(dappConfig.templates.contracts[contract].events).filter(x => x.ABI.name === eventName && x.ABI.type === 'event');
  }

  getEmailTemplate(dappId, template){
    const templatePath = path.join("./dapps", dappId);
    const subject = template.subject;

    // TODO: avoid reading this on each user/email
    const text = fs.readFileSync(path.join(templatePath, template.text)).toString();
    const html = fs.readFileSync(path.join(templatePath, template.html)).toString();
    return {text, html, subject};
  }

}

module.exports = DAppConfig;
