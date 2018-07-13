'use strict';

var mongoose = require('mongoose');
var Status = require('../models/status');
var Proposal = require('../models/proposal');
var Airdrop = require('../models/airdrop');
var Vote = require('../models/vote');
var Claim = require('../models/claim');

module.exports = {
  connect: function (dbparams, cb) {
    var dbstring = 'mongodb://' + dbparams.user;
    dbstring = dbstring + ':' + dbparams.password;
    dbstring = dbstring + '@' + dbparams.address;
    dbstring = dbstring + ':' + dbparams.port;
    dbstring = dbstring + '/' + dbparams.database;

    mongoose.connect(dbstring, function (err) {
      if (err) {
        console.log('Unable to connect to database: %s', dbstring);
        console.log('Aborting');
        process.exit(1);
      } else {
        console.log('Successfully connected to database: %s', dbparams.database);
        return cb();
      }
    });
  },

  disconnect: function () {
    mongoose.disconnect();
  },

  // status functions
  updateStatus: function (params, cb) {
    Status.findOneAndUpdate({}, params, {upsert: true}, function () {
      return cb();
    });
  },

  // proposal functions
  addProposal: function (params, cb) {
    var newProposal = new Proposal(params);
    newProposal.save(function (err) {
      if (err) {
        return cb(err);
      } else {
        return cb(null);
      }
    });
  },

  getProposal: function (contract, cb) {
    Proposal.findOne({contract: contract}, function (err, proposal) {
      if (err) {
        return cb(null);
      } else {
        return cb(proposal);
      }
    });
  },

  getProposals: function (cb) {
    Proposal.find({}, function( err, proposals) {
      if (err) {
        return cb([]);
      } else {
        return cb(proposals);
      }
    });
  },

  updateProposal: function (contract, params, cb) {
    Proposal.findOneAndUpdate({contract: contract}, {$set: params}, function (err) {
      return cb();
    });
  },

  updateVote: function (contract, address, params, cb) {
    Vote.updateOne({contract: contract, address: address}, params, {upsert: true}, function (err) {
      return cb();
    });
  },

  voteCount: function (contract, cb) {
    Vote.find({contract: contract}, function (err, votes) {
      return cb(votes.length);
    });
  },

  // airdrop functions
  addAirdrop: function (params, cb) {
    var newAirdrop = new Airdrop(params);
    newAirdrop.save(function (err) {
      if (err) {
        return cb(err);
      } else {
        return cb(null);
      }
    });
  },

  getAirdrop: function (contract, cb) {
    Airdrop.findOne({contract: contract}, function (err, airdrop) {
      if (err) {
        return cb(null);
      } else {
        return cb(airdrop);
      }
    });
  },

  getAirdrops: function (cb) {
    Airdrop.find({}, function (err, airdrops) {
      if (err) {
        return cb([]);
      } else {
        return cb(airdrops);
      }
    });
  },

  updateAirdrop: function (contract, params, cb) {
    Airdrop.findOneAndUpdate({contract: contract}, {$set: params}, function (err) {
      return cb();
    });
  },

  updateClaim: function (contract, address, params, cb) {
    Claim.findOneAndUpdate({contract: contract, address: address}, params, {upsert: true}, function(err) {
      return cb();
    });
  },

  claimCount: function (contract, cb) {
    Claim.find({contract: contract}, function (err, claims) {
      return cb(claims.length);
    });
  }
};
