const path = require("path");

class DAppConfig {
  constructor(){
    this.configurations = {};
  }

  isDapp(dappId) {
    // TODO:
    if (dappId === "teller-network") return true;
    return false;
  }

  getDapps(){
    // TODO:
    return ['teller-network'];
  }

  config(dappId) {
    if(this.configurations[dappId]) {
      return this.configurations[dappId];
    }

    const templatePath = path.join("../dapps", dappId);
    this.configurations[dappId] = require(path.join(
      path.join("./", templatePath, "config.js")
    ));
    
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

  template(dappId, contract, eventName) {
    const dappConfig = this.config(dappId);
    return Object.values(dappConfig.templates.contracts[contract].events).filter(x => x.ABI.name === eventName && x.ABI.type === 'event');
  }

}

module.exports = DAppConfig;
