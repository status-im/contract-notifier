const Events = require("events");
const config = require("../config");
const Database = require("../database");
const Ethereum = require("./ethereum");
const { addressCompare } = require("./utils");
const Mailer = require("../mail/sendgrid");
const DappConfig = require("../dapp-config");
const Subscribers = require("../models/subscribers");
const logger = require("../logger")('watcher');

const events = new Events();
const dappConfig = new DappConfig(config, logger);
const mailer = new Mailer(config);
const db = new Database(events, config);
const eth = new Ethereum(events, config);

try {
  db.init(logger);
  eth.init(logger);
} catch (err) {
  logger.error("error", err);
  process.exit(1);
}

events.on("db:connected", () => {
  events.on("web3:connected", () => {
    const blockNum = process.argv.length >= 3 ? parseInt(process.argv[2], 10) : 0;

    dappConfig.getDapps().forEach(dappId => {
      const contracts = dappConfig.contracts(dappId);
      contracts.forEach(address => {
        eth.scan(dappId, address, dappConfig.ABI(dappId, address), blockNum);
      });
    });
  });
});

events.on("web3:event", ({ dappId, address, event, returnValues }) => {
  dappConfig.eventConfig(dappId, address, event).forEach(async eventConfig => {
    const users = await Subscribers.findVerifiedUsersByDapp(dappId);
    users.forEach(async user => {
      if ((typeof eventConfig.index === "function" && eventConfig.index(eth.web3, returnValues, user.address)) || addressCompare(returnValues[eventConfig.index], user.address)) {
        if(eventConfig.filter && await !eventConfig.filter(eth.web3, returnValues)) return;

        logger.info("Sending email...");

        let data = dappConfig.getVariables(dappId, {
          email: user.email,
          ...returnValues
        });

        if (eventConfig.template.data) {
          try {
            data = Object.assign(data, await eventConfig.template.data(eth.web3, returnValues));
          } catch (err) {
            logger.log("error", "Error using data function: ", err);
          }
        }

        mailer.send(dappConfig.getEmailTemplate(dappId, eventConfig.template), dappConfig.config(dappId).from, data);
      }
    });
  });
});

