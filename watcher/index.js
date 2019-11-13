const Events = require("events");
const config = require("../config");
const Database = require("../database");
const Ethereum = require("./ethereum");
const events = new Events();
const Mailer = require("../mail/sendgrid");
const DappConfig = require("../config/dapps");

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
        eth.scan(address, dapps.ABI(dappId, address), blockNum);
      });
    });
  });
});

events.on("web3:event", event => {
  // TODO: process each event. See if the return values matches the indexed address field, and send email
  console.log(event);
});

// TODO: handle errors sending email
// TODO: handle web3js disconnects
