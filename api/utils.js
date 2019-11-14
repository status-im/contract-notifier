const web3EthAccounts = require("web3-eth-accounts");
const web3Utils = require("web3-utils");
const cryptoRandomString = require("crypto-random-string");
const stripHexPrefix = require("strip-hex-prefix");

const isSignatureValid = (address, message, signature) => {
  const accounts = new web3EthAccounts();
  address = web3Utils.toChecksumAddress(address);
  let recoverAddress = accounts.recover(message, signature);
  recoverAddress = web3Utils.toChecksumAddress(recoverAddress);
  return address === recoverAddress;
};

const getToken = () => {
  const expirationTime = new Date();
  expirationTime.setUTCHours(expirationTime.getUTCHours() + 2);
  return {
    token: cryptoRandomString({ length: 200, type: "url-safe" }),
    expirationTime
  };
};

const hexValidator = value => {
  const regex = /^[0-9A-Fa-f]*$/g;
  if (regex.test(stripHexPrefix(value))) {
    return true;
  }
  throw new Error("Invalid hex string");
};

module.exports = {
  isSignatureValid,
  getToken,
  hexValidator
};
