const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view"
  }
];

module.exports = {
  from: {
    email: "noreply@teller.exchange",
    name: "Teller"
  },
  templates: {
    subscribe: "sign-up.md",
    contracts: {
      "0xFCC8175384c199C3Bc7a43c3583CbdcEf74ceC24": {
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
          template: "escrow-creation.md",
          data: async (web3, returnValues) => {
            // Example obtaining contract data
            const SNT = new web3.eth.Contract(ERC20_ABI, "0x3C36db79598e7902b5D726af7C7d406d5Da8aF14");
            return {
              tokenName: await SNT.methods.name().call(),
              balance: await SNT.methods.balanceOf(returnValues.seller).call()
            };
          }
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
              { indexed: true, name: "seller", type: "address" }
            ]
          },
          index: "buyer",
          filter: async (web3, returnValues) => !returnValues.isDispute,
          template: "escrow-released.md"
        },
        "dispute-release-buyer": {
          // Dispute won by the buyer
          ABI: {
            name: "Released",
            type: "event",
            inputs: [
              { indexed: true, name: "escrowId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" }
            ]
          },
          index: "buyer", // (web3, returnValues, currentUser) => return true; If we want to use an indexer based on functions
          filter: async (web3, returnValues) => returnValues.isDispute === true,
          template: "dispute-release-buyer.md"
        }
      }
    }
  }
};
