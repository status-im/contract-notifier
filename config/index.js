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
  /* Watcher */
  BLOCK_DELAY: 6, //  [Recommended 6 ~80 secs...] this could be helpful to avoid reorgs
  POLL_SLEEP: 30, // seconds
  VALID_DAPPS: ['teller-network']
};

module.exports = config;
