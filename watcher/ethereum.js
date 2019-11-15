const Web3 = require("web3");
const path = require("path");

class Ethereum {
  constructor(events, config) {
    this.events = events;
    this.config = config;
    this.contracts = {};
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
    await this.sleep(this.config.POLL_SLEEP * 1000);
    await this.poll(fn);
  }

  async getEvents(dappId, contractInstance, fromBlock, toBlock) {
    console.log("Obtaining events from block range: ", fromBlock, "-", toBlock);

    const eventNames = contractInstance.options.jsonInterface
      .filter(x => x.type === "event")
      .map(x => x.name);

    await Promise.all(
      eventNames.map(async eventName => {
        let events = await contractInstance.getPastEvents(eventName, {
          fromBlock: fromBlock,
          toBlock: toBlock
        });

        events.forEach(ev => {
          ev.dappId = dappId;
          this.events.emit("web3:event", ev);
        });
      })
    );
  }

  getInstance(address, ABI) {
    if (!this.contracts[address]) {
      this.contracts[address] = new this.web3.eth.Contract(ABI, address);
    }
    return this.contracts[address];
  }

  async scan(dappId, address, ABI, startBlock = 0) {
    let lastBlock = await this.web3.eth.getBlockNumber();
    let lastBlockProcessed = startBlock || lastBlock - this.config.BLOCK_DELAY;

    await this.poll(async () => {
      try {
        const currentBlock = await this.web3.eth.getBlockNumber();
        lastBlock = currentBlock - this.config.BLOCK_DELAY; // To avoid losing events due to reorgs

        if (lastBlockProcessed > lastBlock) return; // Wait until more blocks are mined

        await this.getEvents(
          dappId,
          this.getInstance(address, ABI),
          lastBlockProcessed,
          lastBlock
        );
        lastBlockProcessed = lastBlock + 1;
      } catch (e) {
        console.log(e.toString());
      }
    });
  }
}

module.exports = Ethereum;
