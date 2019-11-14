const Events = require("events");
const config = require("../config");
const Database = require("../database");
const Ethereum = require("./ethereum");
const { addressCompare } = require("./utils");
const Mailer = require("../mail/sendgrid");
const DappConfig = require("../config/dapps");
const Subscribers = require("../models/subscriber");

const events = new Events();
const dappConfig = new DappConfig();
const mailer = new Mailer(config);
const db = new Database(events, config);
const eth = new Ethereum(events, config);

db.init();
eth.init();

events.on("db:connected", () => {
  events.on("web3:connected", () => {
    const blockNum =
      process.argv.length >= 3 ? parseInt(process.argv[2], 10) : 0;

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
    const users = await Subscribers.findActiveUsersByDapp(dappId);
    users.forEach(user => {
      if (addressCompare(returnValues[eventConfig.index], user.address)) {
        console.log("Sending email...");
        mailer.send(
          dappConfig.getEmailTemplate(dappId, eventConfig.template),
          dappConfig.config(dappId).from,
          {
            email: user.email,
            ...returnValues
          }
        );
      }
    });
  });
});

// TODO: handle errors sending email
// TODO: handle web3js disconnects
// TODO: support templates
