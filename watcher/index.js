const Events = require("events");
const config = require("../config");
const Database = require("../database");
const Ethereum = require("./ethereum");
const { addressCompare } = require("./utils");
const events = new Events();
const Mailer = require("../mail/sendgrid");
const DappConfig = require("../config/dapps");
const Subscribers = require("../models/subscriber");
const dapps = new DappConfig();
const mailer = new Mailer(config);
const db = new Database(events, config);
const eth = new Ethereum(events, config);

db.init();
eth.init();

events.on("db:connected", () => {
  events.on("web3:connected", () => {
    const blockNum =
      process.argv.length >= 3 ? parseInt(process.argv[2], 10) : 0;

    dapps.getDapps().forEach(dappId => {
      const contracts = dapps.contracts(dappId);
      contracts.forEach(address => {
        eth.scan(dappId, address, dapps.ABI(dappId, address), blockNum);
      });
    });
  });
});

events.on("web3:event", ({ dappId, address, event, returnValues }) => {
  dapps.template(dappId, address, event).forEach(async template => {
    const users = await Subscribers.findActiveUsersByDapp(dappId);
    users.forEach(user => {
      if (addressCompare(returnValues[template.index], user.address)) {
        console.log("//TODO: Send email!");
      }
    });
  });
});

// TODO: handle errors sending email
// TODO: handle web3js disconnects
