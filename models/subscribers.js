const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const validator = require("validator");

const SubscriberSchema = new Schema({
  id: Schema.Types.ObjectId,
  dappId: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        // TODO: Validate dapp code
        return true;
      },
      message: props => `${props.value} is not a valid dapp token`
    }
  },
  address: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        // TODO: validate address
        return true;
      },
      message: props => `${props.value} is not a valid address`
    }
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return validator.isEmail(value);
      },
      message: props => `${props.value} is not a valid email`
    }
  },
  lastSignUpAttempt: {
    type: Date,
    default: new Date()
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

SubscriberSchema.statics.findVerifiedUsersByDapp = function(dappId) {
  return this.find({ dappId, isVerified: true });
};

module.exports = mongoose.model("Subscribers", SubscriberSchema);