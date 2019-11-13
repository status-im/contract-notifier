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
      "0xEE301C6A57e2fBf593F558C1aE52B20485101fC2": {
        events: {
          "escrow-creation-seller": {
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
              html: "escrow-creation-seller.html",
              text: "escrow-creation-seller.txt"
            }
          },
          "escrow-creation-buyer": {
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
            index: "buyer",
            template: {
              html: "escrow-creation-buyer.html",
              text: "escrow-creation-buyer.txt"
            }
          }
        }
      }
    }
  }
};
