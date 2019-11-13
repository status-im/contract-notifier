const Web3 = require("web3");

class Ethereum {
  constructor(events, config) {
    this.events = events;
    this.config = config;
  }

  init() {
    this.web3 = new Web3(this.config.BLOCKCHAIN_CONNECTION_POINT);

    this.web3.eth.net
      .isListening()
      .then(() => {
        console.log("Connected successfully to web3");
        this.events.emit("web3:connected");
      })
      .catch(error => {
        throw error;
      });
  }

  sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  async poll(fn) {
    await fn();
    await this.sleep(1 * 1000); // TODO: extract to config
    await this.poll(fn);
  }

  async getEvents(fromBlock, toBlock) {
    console.log("Queriying ", fromBlock, toBlock);
    // TODO:
    let events = await this.contract.getPastEvents("Created", {
      filter: {},
      fromBlock: fromBlock,
      toBlock: toBlock
    });

    for (let event of events) {
      // TODO: process each event. See if the return values matches the indexed address field, and send email
      console.log(event);
    }
  }

  async scan() {
    // TODO: obtain this for all contracts / events in dapps/ folder
    const abi = [
      {
        name: "Created",
        type: "event",
        inputs: [
          { indexed: true, name: "offerId", type: "uint256" },
          { indexed: true, name: "seller", type: "address" },
          { indexed: true, name: "buyer", type: "address" },
          { indexed: false, name: "escrowId", type: "uint256" }
        ]
      }
    ];
    this.contract = new this.web3.eth.Contract(
      abi,
      "0xEE301C6A57e2fBf593F558C1aE52B20485101fC2"
    );

    const MaxBlockRange = 30; // TODO: extract to config

    let latestCachedBlock = 5434202; // TODO: obtain latest block written to database
    let latestEthBlock = 0; // latest block in blockchain

    await this.poll(async () => {
      try {
        latestEthBlock = (await this.web3.eth.getBlockNumber()) - 12; // 12 blocks of delay to avoid reorgs.

        if (latestCachedBlock + MaxBlockRange > latestEthBlock) return; // Wait until more blocks are mined

        latestEthBlock = Math.min(
          latestEthBlock,
          latestCachedBlock + MaxBlockRange
        );
        if (latestEthBlock > latestCachedBlock) {
          await this.getEvents(latestCachedBlock, latestEthBlock);
          latestCachedBlock = latestEthBlock + 1;
        }
      } catch (e) {
        console.log(e.toString());
      }
    });
  }
}

module.exports = Ethereum;
