const mongoose = require('mongoose');
const config = require('./config');

class Database {

  constructor(events, config){
    this.events = events;
    this.config = config;

    this.db = null;
    this.client = null;
  }

  init(logger){
    if (config.DB_CONNECTION == undefined) {
      logger.error('DB - Unable to find MongoDB URI in DB_CONNECTION env variable!')
      process.exit(1);
    }

    mongoose.Promise = global.Promise;
    
    mongoose.connect(config.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true  }, err => {
      if(err) {
        throw err;
      }
    }).then(() => {
      this.db = mongoose;
      logger.log('info', "Connected successfully to db")
      this.events.emit('db:connected', this.db);
    }).catch(err => {
      logger.error("DB - ", err)
      process.exit(1);
    });
  }
}

module.exports = Database;
