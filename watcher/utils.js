const web3Utils = require('web3-utils');

const addressCompare = (address1, address2) => {
    if(!address1 || !address2) return false;
    return web3Utils.toChecksumAddress(address1) === web3Utils.toChecksumAddress(address2);
  };
  
  module.exports = {
      addressCompare
  };
  