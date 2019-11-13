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
    await this.sleep(1 * 1000); // TODO: extract to config
    await this.poll(fn);
  }

  async getEvents(contractInstance, fromBlock, toBlock) {
    console.log("Queriying ", fromBlock, toBlock);

    const eventNames = contractInstance.options.jsonInterface
      .filter(x => x.type === "event")
      .map(x => x.name);

    await Promise.all(
      eventNames.map(async eventName => {
        let events = await contractInstance.getPastEvents(eventName, {
          fromBlock: fromBlock,
          toBlock: toBlock
        });

        events.forEach(ev => this.events.emit("web3:event", ev));
      })
    );
  }

  getInstance(address, ABI) {
    if (!this.contracts[address]) {
      this.contracts[address] = new this.web3.eth.Contract(ABI, address);
    }
    return this.contracts[address];
  }

  async scan(address, ABI, startBlockNumber = 0) {
    const MaxBlockRange = 30; // TODO: extract to config

    let lastBlockProcessed =
      startBlockNumber || (await this.web3.eth.getBlockNumber()); // TODO: allow user to specify starting block
    let latestEthBlock;

    await this.poll(async () => {
      try {
        latestEthBlock = (await this.web3.eth.getBlockNumber()) - 20; // 20 blocks of delay to avoid reorgs. TODO: extract to config

        if (lastBlockProcessed + MaxBlockRange > latestEthBlock) return; // Wait until more blocks are mined

        latestEthBlock = Math.min(
          latestEthBlock,
          lastBlockProcessed + MaxBlockRange
        );

        if (latestEthBlock > lastBlockProcessed) {
          await this.getEvents(
            this.getInstance(address, ABI),
            lastBlockProcessed,
            latestEthBlock
          );
          lastBlockProcessed = latestEthBlock + 1;
        }
      } catch (e) {
        console.log(e.toString());
      }
    });
  }
}

module.exports = Ethereum;
