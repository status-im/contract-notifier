const web3EthAccounts = require("web3-eth-accounts");
const web3Utils = require("web3-utils");

const isSignatureValid = (address, message, signature) => {
  const accounts = new web3EthAccounts();
  address = web3Utils.toChecksumAddress(address);
  let recoverAddress = accounts.recover(message, signature);
  recoverAddress = web3Utils.toChecksumAddress(recoverAddress);
  return address === recoverAddress;
};

module.exports = {
  isSignatureValid
};
