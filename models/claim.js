var mongoose = require('mongoose');

var claimSchema = mongoose.Schema({
  address: {type: String, lowercase: true}, //Ubiq address
  balance: String, // balance at last sync, in ubq
  contract: {type: String, lowercase: true}, //airdrop contract address for this claim
});

module.exports = mongoose.model('Claims', claimSchema);
