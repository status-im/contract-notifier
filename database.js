const mongoose = require('mongoose');
const config = require('./config');

class Database {

  constructor(events, config){
    this.events = events;
    this.config = config;

    this.db = null;
    this.client = null;
  }

  init(){
    if (config.DB_CONNECTION == undefined) {
      throw Error('Unable to find MongoDB URI in DB_CONNECTION env variable!')
    }

    mongoose.Promise = global.Promise;
    
    mongoose.connect(config.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true  }, err => {
      if(err) {
        throw err;
      }
    }).then(() => {
      this.db = mongoose;
      console.log("Connected successfully to db");
      this.events.emit('db:connected', this.db);
    });
  }
}

module.exports = Database;
