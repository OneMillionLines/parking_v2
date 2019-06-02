'use strict';

const Myimport=require('../src/imports');
const db=new Myimport().getDbConnection();
const _ = require("lodash");
const Vehicle=require('../vehicle');
const routes = [
  {
    //insert data as a json describing the mall structure
    
    method: "POST",
    path: "/parking",
    handler: require('./routes/parkingPost')
  },
  {
    method: "GET",
    path: "/parking",
    handler: require('./routes/parkingGet')
  },
  {
    method: "PUT",
    path: "/parking",
    handler: require('./routes/parkingPut')
  },
  {
    method: "DELETE",
    path: "/parking",
    handler: require('./routes/parkingDelete')
  },

  //  end of parking crud routes
  //start of user routes
  {
    method: "POST",
    path: "/user",
    handler: require('./routes/UserPost')
  },

  {
    method: "DELETE",
    path: "/user",
    handler: require('./routes/UserDelete')
  }
]
module.exports = routes;