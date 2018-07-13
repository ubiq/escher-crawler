'use strict';

var web3;
var lib = require('../common');
var proposals = require('../../conf/proposals');
var BigNumber = require('bignumber.js');

const abi = [{"constant":false,"inputs":[{"name":"candidate","type":"uint256"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"endBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"offset","type":"uint256"},{"name":"limit","type":"uint256"}],"name":"getVoters","outputs":[{"name":"_voters","type":"address[]"},{"name":"_candidates","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"votersCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"votes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"voters","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_startBlock","type":"uint256"},{"name":"_endBlock","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"voter","type":"address"},{"indexed":true,"name":"candidate","type":"uint256"}],"name":"onVote","type":"event"}];

var contracts = {};

var getContract = function(abi, address, cb) {
  return cb(web3.eth.contract(abi).at(address));
};

module.exports = {
  init: function (web3_, cb) {
    web3 = web3_;
    lib.syncLoop(proposals.data.length, function(loop) {
      var i = loop.iteration();
      getContract(abi, proposals.data[i].contract, function(contract) {
        // add contract object to contracts
        contracts[proposals.data[i].contract] = contract;
        loop.next();
      });
    }, function() {
      return cb(proposals.data);
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
  getVote: function (hash, address) {
    if (contracts[hash]) {
      return new BigNumber(contracts[hash].votes(address)).toNumber();
    } else {
      return 0;
    }
  },
  getVoters: function (hash, start, end) {
    if (contracts[hash]) {
      return contracts[hash].getVoters(start, end)[0];
    } else {
      return [];
    }
  },
  voterCount: function (hash) {
    if (contracts[hash]) {
      return new BigNumber(contracts[hash].votersCount()).toNumber();
    } else {
      return 0;
    }
  }
};
