const Events = require("events");
const config = require("../config");
const Database = require("../database");
const Ethereum = require("./ethereum");
const { addressCompare } = require("./utils");
const Mailer = require("../mail/sendgrid");
const DappConfig = require("../config/dapps");
const Subscribers = require("../models/subscribers");

const events = new Events();
const dappConfig = new DappConfig();
const mailer = new Mailer(config);
const db = new Database(events, config);
const eth = new Ethereum(events, config);

db.init();
eth.init();

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
      if (addressCompare(returnValues[eventConfig.index], user.address)) {
        console.log("Sending email...");

        let data = {
          email: user.email,
          ...returnValues
        };

        if (eventConfig.template.data) {
          try {
            data = Object.assign(data, await eventConfig.template.data(eth.web3, returnValues));
          } catch (err) {
            console.err("Error using data function", err);
          }
        }

        mailer.send(dappConfig.getEmailTemplate(dappId, eventConfig.template), dappConfig.config(dappId).from, data);
      }
    });
  });
});

// TODO: handle errors sending email
// TODO: handle web3js disconnects
// TODO: support templates
