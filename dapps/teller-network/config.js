const { addressCompare } = require("../../watcher/utils");

const ESCROW_ABI = [
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "transactions",
    outputs: [
      { name: "offerId", type: "uint256" },
      { name: "token", type: "address" },
      { name: "tokenAmount", type: "uint256" },
      { name: "expirationTime", type: "uint256" },
      { name: "sellerRating", type: "uint256" },
      { name: "buyerRating", type: "uint256" },
      { name: "fiatAmount", type: "uint256" },
      { name: "buyer", type: "address" },
      { name: "seller", type: "address" },
      { name: "arbitrator", type: "address" },
      { name: "destination", type: "address" },
      { name: "status", type: "uint8" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x9ace38c2"
  }
];

const USERSTORE_ABI = [
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "users",
    outputs: [
      { name: "contactData", type: "string" },
      { name: "location", type: "string" },
      { name: "username", type: "string" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xa87430ba"
  }
];

const ArbitratorLicenseProxy = "0x3e7fc31b9bd5FaFdE828AcC1FD7b7b3dD7c1D927";
const UserStoreProxy = "0x61FBACebCEf64e726fF5B848dA5DFF0c44c199f5";
const EscrowProxy = "0xD5baC31a10b8938dd47326f01802fa23f1032AeE";

const getArbitratorName = async (web3, returnValues) => {
  const UserStore = new web3.eth.Contract(USERSTORE_ABI, UserStoreProxy);
  let arbitratorName = returnValues.arbitrator;
  try {
    const userData = await UserStore.methods.users(returnValues.arbitrator).call();
    arbitratorName = userData.username;
  } catch (e) {
    console.log(e);
  }
  return { arbitratorName };
};

const isParticipant = participant => async (web3, returnValues, userAddress) => {
  const EscrowContract = new web3.eth.Contract(ESCROW_ABI, EscrowProxy);
  const escrow = await EscrowContract.methods.transactions(returnValues.escrowId).call();
  return addressCompare(escrow[participant], userAddress);
};

module.exports = {
  from: {
    email: "noreply@teller.exchange",
    name: "Teller"
  },
  templates: {
    subscribe: "sign-up.md",
    variables: {
      url: "https://status-im.github.io/status-teller-network/build"
    },
    contracts: {
      [EscrowProxy]: {
        "escrow-creation": {
          ABI: {
            name: "Created",
            type: "event",
            inputs: [
              { indexed: true, name: "offerId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "escrowId", type: "uint256" }
            ]
          },
          index: "seller",
          template: "escrow-creation.md"
        },
        "escrow-funded": {
          ABI: {
            name: "Funded",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "expirationTime", type: "uint256" },
              { indexed: false, name: "amount", type: "uint256" }
            ]
          },
          index: "buyer",
          template: "escrow-funded.md"
        },
        "escrow-paid": {
          ABI: {
            name: "Paid",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" }
            ]
          },
          index: "seller",
          template: "escrow-paid.md"
        },
        "escrow-released": {
          ABI: {
            name: "Released",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "isDispute", type: "bool" }
            ]
          },
          index: "buyer",
          filter: async (web3, returnValues) => !returnValues.isDispute,
          template: "escrow-released.md"
        },
        "dispute-won-buyer": {
          ABI: {
            name: "Released",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "isDispute", type: "bool" }
            ]
          },
          index: "buyer",
          filter: async (web3, returnValues) => returnValues.isDispute,
          template: "dispute-won-buyer.md"
        },
        "dispute-won-seller": {
          ABI: {
            name: "Canceled",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "isDispute", type: "bool" }
            ]
          },
          index: "seller",
          filter: async (web3, returnValues) => returnValues.isDispute,
          template: "dispute-won-seller.md"
        },
        "dispute-lost-buyer": {
          ABI: {
            name: "Canceled",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "isDispute", type: "bool" }
            ]
          },
          index: "buyer",
          filter: async (web3, returnValues) => returnValues.isDispute,
          template: "dispute-lost-buyer.md"
        },
        "dispute-lost-seller": {
          ABI: {
            name: "Released",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "isDispute", type: "bool" }
            ]
          },
          index: "seller",
          filter: async (web3, returnValues) => returnValues.isDispute,
          template: "dispute-lost-seller.md"
        },
        "escrow-canceled-buyer": {
          ABI: {
            name: "Canceled",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "isDispute", type: "bool" }
            ]
          },
          index: "buyer",
          filter: async (web3, returnValues) => !returnValues.isDispute,
          template: "escrow-canceled-buyer.md"
        },
        "escrow-canceled-seller": {
          ABI: {
            name: "Canceled",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "buyer", type: "address" },
              { indexed: false, name: "isDispute", type: "bool" }
            ]
          },
          index: "seller",
          filter: async (web3, returnValues) => !returnValues.isDispute,
          template: "escrow-canceled-seller.md"
        },
        "dispute-open-buyer": {
          ABI: {
            name: "ArbitrationRequired",
            type: "event",
            inputs: [
              { indexed: false, name: "escrowId", type: "uint256" },
              { indexed: false, name: "timeout", type: "uint256" }
            ]
          },
          index: isParticipant("buyer"),
          template: "dispute-open-buyer.md"
        },
        "dispute-open-seller": {
          ABI: {
            name: "ArbitrationRequired",
            type: "event",
            inputs: [
              { indexed: false, name: "escrowId", type: "uint256" },
              { indexed: false, name: "timeout", type: "uint256" }
            ]
          },
          index: isParticipant("seller"),
          template: "dispute-open-seller.md"
        },
        "dispute-open-arbitrator": {
          ABI: {
            name: "ArbitrationRequired",
            type: "event",
            inputs: [
              { indexed: false, name: "escrowId", type: "uint256" },
              { indexed: false, name: "timeout", type: "uint256" }
            ]
          },
          index: isParticipant("arbitrator"),
          template: "dispute-open-arbitrator.md"
        }
      },
      [ArbitratorLicenseProxy]: {
        "request-arbitrator": {
          ABI: {
            name: "ArbitratorRequested",
            type: "event",
            inputs: [
              { indexed: false, name: "id", type: "bytes32" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "arbitrator", type: "address" }
            ]
          },
          index: "arbitrator",
          template: "request-arbitrator.md"
        },
        "seller-approved": {
          ABI: {
            name: "RequestAccepted",
            type: "event",
            inputs: [
              { indexed: false, name: "id", type: "bytes32" },
              { indexed: true, name: "arbitrator", type: "address" },
              { indexed: true, name: "seller", type: "address" }
            ]
          },
          index: "seller",
          template: "seller-approved.md",
          data: getArbitratorName
        },
        "seller-denied": {
          ABI: {
            name: "RequestRejected",
            type: "event",
            inputs: [
              { indexed: false, name: "id", type: "bytes32" },
              { indexed: true, name: "arbitrator", type: "address" },
              { indexed: true, name: "seller", type: "address" }
            ]
          },
          index: "seller",
          template: "seller-denied.md",
          data: getArbitratorName
        }
      }
    }
  }
};
