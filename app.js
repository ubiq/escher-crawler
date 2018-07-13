'use strict';

var Web3 = require('web3');
var config = require('./lib/config');
var db = require('./lib/database');
var Controller = require('./lib/controller');

var web3 = new Web3(new Web3.providers.HttpProvider('http://' + config.gubiq));

db.connect(config.mongodb, function(){
  Controller.init(web3, config.intervals, function(){
    Controller.startTimers();
  });
});
