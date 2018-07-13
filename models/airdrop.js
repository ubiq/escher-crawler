var mongoose = require('mongoose');

var airdropSchema = mongoose.Schema({
  title: String, // contract title
  contract: {type: String, lowercase: true, unique: true}, //contract address
  multiplier: Number, // escher multiplier (e.g 12)
  startBlock: Number,
  endBlock: Number,
  totalClaimed: String, //in ubq
  lastBlock: Number //last block a sync occured
});

module.exports = mongoose.model('Airdrops', airdropSchema);
