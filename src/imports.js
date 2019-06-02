'use strict';
const pgp = require("pg-promise")(),
  dbConnection = require("../secrets/db_configuration"),
  db = pgp(dbConnection),
  redis = require("async-redis"),
  amqp = require("amqplib/callback_api"),
  client = redis.createClient();

class getImportObjects{
    constructor(){
    }
    
    getDbConnection(){
        if(db){
            return db;
        }
        else{
            dbConnection = require("../secrets/db_configuration");
            db = pgp(dbConnection);
        }
    }

}

//const s=new getImportObjects().getDbConnection();
module.exports=getImportObjects;