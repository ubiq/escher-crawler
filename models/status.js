var mongoose = require('mongoose');

var statusSchema = mongoose.Schema({
  block: {
    number: Number,
    miner: String,
    timestamp: Number,
    transactions: Number,
    reward: String
  },
  totalUbiq: String,
  totalEscher: String
});

module.exports = mongoose.model('Status', statusSchema);
