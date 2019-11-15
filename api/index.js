const Events = require("events");
const { hexValidator } = require("./utils");
const express = require("express");
const { check } = require("express-validator");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("./rate-limit");
const config = require("../config");
const Database = require("../database");
const Mailer = require("../mail/sendgrid");
const DappConfig = require("../config/dapps");
const Controller = require("./controller");

const events = new Events();
const dappConfig = new DappConfig();
const mailer = new Mailer(config);
const db = new Database(events, config);

db.init();

events.on("db:connected", () => {
  const app = express();

  app.use(rateLimit());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet.expectCt({ enforce: true, maxAge: 60 }));
  app.use(helmet());

  app.post(
    "/:dappId/subscribe",
    [
      check("signature")
        .exists()
        .isLength({ min: 132, max: 132 })
        .custom(hexValidator),
      check("address")
        .exists()
        .isLength({ min: 42, max: 42 })
        .custom(hexValidator),
      check("email")
        .exists()
        .isEmail(),
      check("dappId").exists()
    ],
    Controller.subscribe(dappConfig, mailer)
  );

  app.post(
    "/:dappId/unsubscribe",
    [
      check("signature")
        .exists()
        .isLength({ min: 132, max: 132 })
        .custom(hexValidator),
      check("address")
        .exists()
        .isLength({ min: 42, max: 42 })
        .custom(hexValidator),
      check("dappId").exists()
    ],
    Controller.unsubscribe(dappConfig)
  );

  app.get("/confirm/:token", [check("token").exists()], Controller.confirm());

  app.get("/:dappId/user/:address", [check("address").exists().isLength({min:42,max:42}).custom(hexValidator), check("dappId").exists()], Controller.userExists());

  app.get("/", (req, res) => res.status(200).json({ ok: true }));

  app.listen(config.PORT, () => console.log(`App listening on port ${config.PORT}!`));
});

// MVP
// ====

// TODO: register DAPP and content
// TODO: handle errors sending email
