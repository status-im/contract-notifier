module.exports = {
  from: {
    email: "noreply@teller.exchange",
    name: "Teller Network"
  },
  templates: {
    "sign-up": {
      subject: "Signup email",
      html: "sign-up.html",
      text: "sign-up.txt"
    },
    contracts: {
      "0xFCC8175384c199C3Bc7a43c3583CbdcEf74ceC24": {
        events: {
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
            template: {
              subject: "New trade!",
              html: "escrow-creation.html",
              text: "escrow-creation.txt"
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
            template: {
              subject: "Your escrow has been funded!",
              html: "escrow-funded.html",
              text: "escrow-funded.txt"
            }
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
            template: {
              subject: "Your escrow has been paid!",
              html: "escrow-paid.html",
              text: "escrow-paid.txt"
            }
          }
        }
      }
    }
  }
};
