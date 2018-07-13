var mongoose = require('mongoose');

var proposalSchema = mongoose.Schema({
  title: String, // contract title
  type: String, // type of proposal
  contract: {type: String, lowercase: true, unique: true}, //contract address
  startBlock: Number,
  endBlock: Number,
  totalWeight: String, // in escher
  candidates: Array,
  lastBlock: Number, // last block a full sync occured,
  data: String, // url to github issue
  uip: String
});

module.exports = mongoose.model('Proposals', proposalSchema);
