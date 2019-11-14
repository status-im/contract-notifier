const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VerificationSchema = new Schema({
  token: String,
  expirationTime: Date,
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscribers"
  }
});

module.exports = mongoose.model("Verifications", VerificationSchema);
