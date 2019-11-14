const Events = require("events");
const stripHexPrefix = require("strip-hex-prefix");
const { isSignatureValid } = require("./utils");
const express = require("express");
const { check, validationResult } = require("express-validator");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("../middleware/rate-limit");
const config = require("../config");
const Database = require("../database");
const events = new Events();
const Subscriber = require("../models/subscriber");
const subscriberStatus = require("../models/subscriber-status");
const Mailer = require("../mail/sendgrid");
const DappConfig = require("../config/dapps");

const dappConfig = new DappConfig();
const mailer = new Mailer(config);
const db = new Database(events, config);

db.init();

const hexValidator = value => {
  const regex = /^[0-9A-Fa-f]*$/g;
  if (regex.test(stripHexPrefix(value))) {
    return true;
  }
  throw new Error("Invalid hex string");
};

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
    async (req, res) => {
      const {
        params: { dappId },
        body: { address, email, signature }
      } = req;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(404).json({ errors: errors.array() });
      }

      if (!dappConfig.isDapp(dappId)) {
        return res.status(404).send("Invalid dapp");
      }

      if (!isSignatureValid(address, email, signature)) {
        return res.status(404).send("Invalid signature");
      }

      // TODO: rate limit the number of times an user can subscribe
      // TODO: handle subscriptions to particular events

      try {
        const subscriber = await Subscriber.findOne({
          dappId,
          address
        });

        if (!subscriber) {
          await Subscriber.create({
            dappId,
            email,
            address,
            status: subscriberStatus.CONFIRMED // TODO: remove this once email confirmation is done
          });

          const template = dappConfig.template(dappId, "sign-up");

          mailer.send(
            dappConfig.getEmailTemplate(dappId, template),
            dappConfig.config(dappId).from,
            {
              email
            }
          );
        }
      } catch (err) {
        // TODO: add global error handler
        return res.status(400).send(err.message);
      }

      return res.status(200).send("OK");
    }
  );

  app.post("/:dapp/unsubscribe", async (req, res) => {
    // TODO:
    const {
      params: { dappId },
      body: { address, email, signature }
    } = req;

    if (!dappConfig.isDapp(dappId)) {
      return res.status(404).send("Invalid dapp");
    }

    if (!isSignatureValid(address, email, signature)) {
      return res.status(404).send("Invalid signature");
    }

    // TODO: handle unsubscribe to particular events

    try {
      await Subscriber.deleteOne({
        dapp: req.params.dappId,
        address: req.body.address
      });
    } catch (err) {
      // TODO: add global error handler
      return res.status(400).send(err.message);
    }

    return res.status(200).send("OK");
  });

  app.get("/confirm/:token", (req, res) => {
    // TODO:
  });

  app.get("/", (req, res) => res.status(200).json({ ok: true }));

  app.listen(config.PORT, () =>
    console.log(`App listening on port ${config.PORT}!`)
  );
});

// MVP
// ====

// TODO: register DAPP and content
// TODO: handle errors sending email
