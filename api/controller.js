const { validationResult } = require("express-validator");
const { isSignatureValid, getToken } = require("./utils");
const Subscribers = require("../models/subscribers");
const Verifications = require("../models/verifications");
const BadRequest = require("./bad-request");

class Controller {
  static subscribe(dappConfig, mailer) {
    return async (req, res, next) => {
      const {
        params: { dappId },
        body: { address, email, signature }
      } = req;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new BadRequest(errors.array()));
      }

      if (!dappConfig.isDapp(dappId)) {
        return next(new BadRequest("DApp not found"));
      }

      if (!isSignatureValid(address, email, signature)) {
        return next(new BadRequest("Invalid signature"));
      }

      // TODO: handle subscriptions to particular events

      try {
        const session = await Subscribers.startSession();
        session.startTransaction();

        const subscriber = await Subscribers.findOne({
          dappId,
          address
        });

        const t = getToken();

        if (!subscriber) {
          const s = await Subscribers.create({
            dappId,
            email,
            address
          });

          await Verifications.create({
            ...t,
            subscriber: s._id
          });
        } else if (!subscriber.isVerified) {
          const d = new Date(subscriber.lastSignUpAttempt);
          d.setMinutes(d.getMinutes() + 5);
          if (d > new Date()) {
            return next(new BadRequest("You need to wait at least 5 minutes between sign up attempts"));
          }

          subscriber.lastSignUpAttempt = d;
          await subscriber.save();

          await Verifications.create({
            ...t,
            subscriber: subscriber._id
          });
        }

        if (!subscriber || !subscriber.isVerified) {
          const template = dappConfig.template(dappId, "sign-up");
          mailer.send(dappConfig.getEmailTemplate(dappId, template), dappConfig.config(dappId).from, {
            email,
            token: t.token
          });
        }

        session.commitTransaction();
      } catch (err) {
        return next(err);
      }
      return res.status(200).send("OK");
    };
  }

  static unsubscribe(dappConfig) {
    return async (req, res) => {
      const {
        params: { dappId },
        body: { address, signature }
      } = req;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new BadRequest(errors.array()));
      }

      if (!dappConfig.isDapp(dappId)) {
        return next(new BadRequest("DApp not found"));
      }

      if (!isSignatureValid(address, dappId, signature)) {
        return next(new BadRequest("Invalid signature"));
      }

      // TODO: handle unsubscribe to particular events

      try {
        await Subscribers.deleteOne({
          dappId,
          address
        });
      } catch (err) {
        return next(err);
      }

      return res.status(200).send("OK");
    };
  }

  static confirm() {
    return async (req, res) => {
      const {
        params: { token }
      } = req;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new BadRequest(errors.array()));
      }

      try {
        const session = await Verifications.startSession();
        session.startTransaction();

        const verification = await Verifications.findOne({
          token
        }).populate("subscriber");

        if (verification) {
          if (verification.expirationTime < new Date()) {
            return next(new BadRequest("Verification token already expired"));
          }

          if (!verification.subscriber.isVerified) {
            verification.subscriber.isVerified = true;
            await verification.subscriber.save();
          }

          await Verifications.deleteMany({
            subscriber: verification.subscriber._id
          });

          session.commitTransaction();
        } else {
          session.abortTransaction();
          return next(new BadRequest("Invalid verification token"));
        }
      } catch (err) {
        return next(err);
      }

      return res.status(200).send("OK");
    };
  }

  static userExists() {
    return async (req, res) => {
      const {
        params: { dappId, address }
      } = req;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new BadRequest(errors.array()));
      }

      try {
        const subscriber = await Subscribers.findOne({
          dappId,
          address,
          isVerified: true
        });

        return res.status(200).json({ isUser: subscriber ? true : false });
      } catch (err) {
        return next(err);
      }
    };
  }
}

module.exports = Controller;
