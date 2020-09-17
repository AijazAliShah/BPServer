const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const EWallerSchema = new Schema({
  amount: {
    type: String,
  },
  storeName: {
    type: String,
  },
  storeId: String,
  userId: {
    type: String,
  }
});

module.exports = EWallet = mongoose.model('EWallet', EWallerSchema);