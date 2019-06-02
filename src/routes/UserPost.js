'use strict';
const _ = require("lodash");
const Vehiclehandler=require('../../Vehiclehandler');
const Myimport=require('../imports');
const db=new Myimport().getDbConnection();
const moment=require('moment')

module.exports=async function(req, res) {

  let payload = req.payload;
  let result;

  await db.tx(async t=>{
  
    let vehiclehandler=new Vehiclehandler(payload,t);
    let vehicle_pos= await vehiclehandler.load();
    let command= "INSERT INTO user_table(vehicle_no,time_val,vehicle_data) VALUES ($1,$2,$3)";
    let values;
    if(!_.isEqual(vehicle_pos,{ f_id: 0, dist: 0, pos: 0 ,disLen:0})){
      payload["vehicle_pos"]=vehicle_pos;
      values = [payload.vehicle_no,moment(),payload];
      await t
        .none(command, values)
        .then(data => {
          result=vehicle_pos;
        })
        .catch(error => (console.log("ERROR:", error),result="On inserting "+values+" we get error: "+error.detail));
    }
    else{
      result="Sorry No space available";
    }
    
  });
  return result;
}