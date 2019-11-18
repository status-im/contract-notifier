const Web3 = require("web3");
const path = require("path");

class Ethereum {
  constructor(events, config) {
    this.events = events;
    this.config = config;
    this.contracts = {};
    this.logger = null;
  }

  init(logger) {
    this.logger = logger;

    this.web3 = new Web3(this.config.BLOCKCHAIN_CONNECTION_POINT);

    this.web3.eth.net
      .isListening()
      .then(() => {
        logger.info("Connected successfully to web3");
        this.events.emit("web3:connected");
      })
      .catch(error => {
        console.log(error);
        logger.error("web3 - ", error);
        process.exit(1);
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
    this.logger.info("Obtaining events from block range: %s - %s", fromBlock, toBlock);

    const eventNames = contractInstance.options.jsonInterface.filter(x => x.type === "event").map(x => x.name);

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
        await this.getEvents(dappId, this.getInstance(address, ABI), lastBlockProcessed, lastBlock);
        lastBlockProcessed = lastBlock + 1;
      } catch (e) {
        this.logger.error(e)
      }
    });
  }
}

module.exports = Ethereum;
