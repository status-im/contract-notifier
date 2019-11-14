let secret = {};
try {
  secret = require("./.secret.json");
} catch (err) {
  console.log("WARN: .secret.json file not available");
}

const env = process.env;

/* some defaults cannot be known in advance */
const config = {
  /* Api */
  PORT: env.PORT || 4000,
  RATE_LIMIT_TIME: env.RATE_LIMIT_TIME || 15,
  RATE_LIMIT_MAX_REQ: env.RATE_LIMIT_MAX_REQ || 1,
  /* Database */
  DB_CONNECTION: env.DB_CONNECTION || secret.DB_CONNECTION || null,
  /* Blockchain */
  BLOCKCHAIN_CONNECTION_POINT: env.BLOCKCHAIN_CONNECTION_POINT || secret.BLOCKCHAIN_CONNECTION_POINT || "http://localhost:8545",
  /* Email */
  SENDGRID_API_KEY: secret.SENDGRID_API_KEY,
  /* WATCHER */
  // With this example, if current block is 100, it will wait until block 108 to query blocks 101-103
  BLOCK_DELAY: 5, // 60 secs... this could be helpful to avoid reorgs
  EVENTS_RANGE: 3, // blocks    
  POLL_SLEEP: 1 // seconds
};

module.exports = config;
