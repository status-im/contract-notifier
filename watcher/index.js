const Events = require("events");
const config = require("../config");
const Database = require("../database");
const Ethereum = require("./ethereum");
const events = new Events();
const Mailer = require("../mail/sendgrid");

const mailer = new Mailer(config);
const db = new Database(events, config);
const eth = new Ethereum(events, config);

db.init();
eth.init();

events.on("db:connected", () => {
  events.on("web3:connected", () => {
    const procArgs = process.argv;
    eth.scan(procArgs.length >= 3 ? parseInt(procArgs[2], 10) : 0);
  });
});

events.on("web3:event", event => {
  // TODO: process each event. See if the return values matches the indexed address field, and send email
  console.log(event);
});

// TODO: handle errors sending email
// TODO: handle web3js disconnects
