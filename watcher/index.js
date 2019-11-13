
const Events = require("events");
const config = require("../config");
const Database = require("../database");
const Ethereum = require("./ethereum");
const events = new Events();
const Mailer = require('../mail/sendgrid');

const mailer = new Mailer(config);
const db = new Database(events, config);
const eth = new Ethereum(events, config);

db.init();
eth.init();



events.on("db:connected", () => {
    events.on('web3:connected', () => {
        eth.scan();
    })
});

// TODO: handle errors sending email
// TODO: handle web3js disconnects
