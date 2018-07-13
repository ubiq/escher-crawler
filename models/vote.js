var mongoose = require('mongoose');

var voteSchema = mongoose.Schema({
  address: {type: String, lowercase: true}, //Ubiq address
  balance: String, // balance at last sync, in escher
  contract: {type: String, lowercase: true}, //contract address for this vote
  candidate: Number
});

module.exports = mongoose.model('Votes', voteSchema);
