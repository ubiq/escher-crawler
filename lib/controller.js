'use strict';

var BigNumber = require('bignumber.js');
var nanotimer = require('nanotimer');
var request = require('request');

var lib = require('./common');
var db = require('./database');
var Escher = require('./contracts/escher');
var Proposal = require('./contracts/proposal');
var Airdrop = require('./contracts/airdrop');

var blockTimer = new nanotimer();
var syncTimer = {
  fast: new nanotimer(),
  full: new nanotimer()
}

var web3;
var intervals;

var head = {};

function checkBlock () {
  if (!web3.isConnected()) {
    console.log('web3 not connected');
    return;
  } else {
    var latestBlock = web3.eth.getBlock('latest');
    // check if a new block has occured
    if (latestBlock.hash != head.hash) {
      // new block, stop timer
      blockTimer.clearInterval();
      // get total ubiq supply from ubiqscan
      request({
        uri: 'https://api1.ubiqscan.io/v2/getsupply',
        json: true
      }, function(err, response, summary) {
        // update db
        db.updateStatus({
          block: {
            number: latestBlock.number,
            miner: latestBlock.miner,
            timestamp: latestBlock.timestamp,
            transactions: latestBlock.transactions.length,
            reward: lib.calculateBlockReward(latestBlock)
          },
          totalEscher: Escher.getSupply(),
          totalUbiq: summary.result
        }, function () {
          head = latestBlock; // update head
          blockTimer.setInterval(checkBlock,'', intervals.block); // restart timer
          return;
        });
      });
    } else {
      return;
    }
  }
}

function syncVotes (blockNumber, mode, cb) {
  db.getProposals(function (proposals) {
    // loop through proposals
    lib.syncLoop(proposals.length, function (loop) {
      var p = loop.iteration();
      db.voteCount(proposals[p].contract, function (voteCount) {
      var start = mode === 'fast' ? voteCount : 0;
        if (blockNumber < proposals[p].startBlock || proposals[p].lastBlock > proposals[p].endBlock + 40) { // 40 confs
          loop.next(); // skip this proposal its out of range.
        } else {
          if (blockNumber > proposals[p].endBlock) {
            web3.eth.defaultBlock = proposals[p].endBlock;
          } else {
            web3.eth.defaultBlock = blockNumber;
          }

          var totalWeight = mode === 'fast' ? new BigNumber(proposals[p].totalWeight) : new BigNumber(0);
          var proposal = proposals[p].contract;
          var voters = Proposal.getVoters(proposal, start, Proposal.voterCount(proposal));
          var weights = {};
          var votes = {};
          // loop through votes
          lib.syncLoop(voters.length, function (loop_) {
            var i = loop_.iteration();
            var candidate = Proposal.getVote(proposal, voters[i]);
            var balance = web3.fromWei(new BigNumber(Escher.getBalance(voters[i])), 'ether').toString(); //balance in escher
            totalWeight = new BigNumber(totalWeight).plus(balance); // add balance to total
            // update vote
            db.updateVote(proposal, voters[i].toString(), {
              address: voters[i].toString(),
              balance: balance,
              contract: proposal,
              candidate: candidate
            }, function (err) {
              if (votes[candidate]) {
                votes[candidate] += 1;
                weights[candidate] = new BigNumber(weights[candidate]).plus(balance).toString();
                loop_.next();
              } else {
                weights[candidate] = balance;
                votes[candidate] = 1;
                loop_.next();
              }
            })
          }, function () {
            // loop through candidates
            var candidates = proposals[p].candidates;
            lib.syncLoop(candidates.length, function(loop_) {
              var c = loop_.iteration();
              if (votes[candidates[c].index]) {
                if (mode === 'fast') {
                  candidates[c].totalVotes += votes[candidates[c].index];
                  candidates[c].totalWeight = new BigNumber(candidates[c].totalWeight).plus(weights[candidates[c].index]);
                  loop_.next();
                } else {
                  candidates[c].totalVotes = votes[candidates[c].index];
                  candidates[c].totalWeight = weights[candidates[c].index];
                  loop_.next();
                }
              } else {
                loop_.next();
              }
            }, function() {
              // update proposal
              db.updateProposal(proposal, {
                totalWeight: totalWeight.toString(),
                lastBlock: blockNumber,
                candidates: candidates
              }, function(){
                loop.next()
              });
            })
          });
        }
      });
    }, function () {
      console.log('votes done');
      return cb();
    })
  })
}

function syncClaims (blockNumber, mode, cb) {
  db.getAirdrops(function(airdrops) {
    // loop through airdrops
    lib.syncLoop(airdrops.length, function (loop) {
      var a = loop.iteration();
      db.claimCount(airdrops[a].contract, function (claimCount) {
        var start = mode === 'fast' ? claimCount : 0;
        if (blockNumber < airdrops[a].startBlock || airdrops[a].lastBlock > airdrops[a].endBlock + 40) {
          loop.next(); //skip this airdrop, its out of range
        } else {
          if (blockNumber > airdrops[a].endBlock) {
            web3.eth.defaultBlock = airdrops[a].endBlock;
          } else {
            web3.eth.defaultBlock = blockNumber;
          }
          var totalClaimed = mode === 'fast' ? new BigNumber(web3.toWei(airdrops[a].totalClaimed, 'ether')) : new BigNumber(0);
          var airdrop = airdrops[a].contract;
          var claimers = Airdrop.getClaimers(airdrop, start, Airdrop.claimerCount(airdrop));
          lib.syncLoop(claimers.length, function (loop_) {
            var i = loop_.iteration();
            var balance = web3.fromWei(new BigNumber(web3.eth.getBalance(claimers[i])).toString(), 'ether').toString()
            totalClaimed = new BigNumber(totalClaimed).plus(web3.eth.getBalance(claimers[i]));
            db.updateClaim(airdrop, claimers[i].toString(), {
              address: claimers[i].toString(),
              balance: balance,
              airdrop: airdrop
            }, function (err) {
              if (err) {
                console.log(err);
                loop_.next();
              } else {
                loop_.next();
              }
            });
          }, function () {
            // update airdrop
            db.updateAirdrop(airdrop, {
              totalClaimed: web3.fromWei(totalClaimed.toString(), 'ether'),
              lastBlock: blockNumber
            }, function () {
              loop.next();
            })
          })
        }
      });
    }, function () {
      console.log('claims done');
      return cb();
    });
  });
}

function sync (mode) {
  if (!head) return;
  syncTimer[mode].clearInterval();
  var blockNumber = head.number;
  console.log('start sync: ' + mode);
  syncVotes(blockNumber, mode, function () {
    syncClaims(blockNumber, mode, function () {
      syncTimer[mode].setInterval(sync,[mode], intervals[mode]);
      return;
    });
  });
}

function populateProposals (proposals, cb) {
  lib.syncLoop(proposals.length, function (loop) {
    var i = loop.iteration();
    db.getProposal(proposals[i].contract, function (proposal) {
      if (proposal) {
        // proposal already in db
        loop.next();
      } else {
        // add proposal to db
        db.addProposal({
          title: proposals[i].title,
          type: proposals[i].type,
          contract: proposals[i].contract,
          startBlock: Proposal.startBlock(proposals[i].contract),
          endBlock: Proposal.endBlock(proposals[i].contract),
          candidates: proposals[i].candidates,
          data: proposals[i].data,
          uip: proposals[i].uip,
          totalWeight: '0',
          lastBlock: 0
        }, function (err) {
          if (err) {
            console.log(err);
          }
          loop.next();
        })
      }
    });
  }, function () {
    return cb();
  })
}

function populateAirdrops (airdrops, cb) {
  lib.syncLoop(airdrops.length, function(loop) {
    var i = loop.iteration();
    db.getAirdrop(airdrops[i].contract, function (airdrop) {
      if (airdrop) {
        // airdrop already in db
        loop.next();
      } else {
        // add airdrop to db
        db.addAirdrop({
          title: airdrops[i].title,
          contract: airdrops[i].contract,
          startBlock: Airdrop.startBlock(airdrops[i].contract),
          endBlock: Airdrop.endBlock(airdrops[i].contract),
          multiplier: airdrops[i].multiplier,
          totalClaimed: '0',
          lastBlock: 0
        }, function (err) {
          if (err) {
            console.log(err);
          }
          loop.next();
        })
      }
    });
  }, function () {
    return cb();
  })
}

module.exports = {
  init: function (web3_, intervals_, cb) {
    web3 = web3_;
    intervals = intervals_;
    Escher.init(web3_);
    Proposal.init(web3_, function(proposals) {
      populateProposals(proposals, function () {
        Airdrop.init(web3_, function(airdrops) {
          populateAirdrops(airdrops, function () {
            return cb();
          });
        });
      });
    });
  },
  startTimers: function () {
    blockTimer.setInterval(checkBlock,'', intervals.block);
    syncTimer.fast.setInterval(sync,['fast'], intervals.fast);
    syncTimer.full.setInterval(sync,['full'], intervals.full);
    return;
  }
}
