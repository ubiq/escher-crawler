'use strict';

var web3;
var lib = require('../common');
var airdrops = require('../../conf/airdrops');
var BigNumber = require('bignumber.js');

const abi = [{"constant":true,"inputs":[],"name":"endBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"claimersCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"claim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"offset","type":"uint256"},{"name":"limit","type":"uint256"}],"name":"getClaimers","outputs":[{"name":"_claimers","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"claimers","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"claims","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_startBlock","type":"uint256"},{"name":"_endBlock","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"claimer","type":"address"}],"name":"onClaim","type":"event"}];

var contracts = {};

var getContract = function(abi, address, cb) {
  return cb(web3.eth.contract(abi).at(address));
};

module.exports = {
  init: function (web3_, cb) {
    web3 = web3_;
    lib.syncLoop(airdrops.data.length, function(loop) {
      var i = loop.iteration();
      getContract(abi, airdrops.data[i].contract, function(contract) {
        // add contract object to contracts
        contracts[airdrops.data[i].contract] = contract;
        loop.next();
      });
    }, function() {
      return cb(airdrops.data);
    });
  },
  startBlock: function (hash) {
    if (contracts[hash]) {
      return new BigNumber(contracts[hash].startBlock()).toNumber();
    } else {
      return 0;
    }
  },
  endBlock: function (hash) {
    if (contracts[hash]) {
      return new BigNumber(contracts[hash].endBlock()).toNumber();
    } else {
      return 0;
    }
  },
  getClaim: function (hash, address) {
    if (contracts[hash]) {
      return contracts[hash].claims(address);
    } else {
      return 0;
    }
  },
  getClaimers: function (hash, start, end) {
    if (contracts[hash]) {
      return contracts[hash].getClaimers(start, end);
    } else {
      return [];
    }
  },
  claimerCount: function (hash) {
    if (contracts[hash]) {
      return new BigNumber(contracts[hash].claimersCount()).toNumber();
    } else {
      return 0;
    }
  }
};
