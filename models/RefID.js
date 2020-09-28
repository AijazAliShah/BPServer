const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const RefSchema = new Schema({
  storeName: {
    type: String,
  },
  id: {
    type: String,
  },
  userID: {
      type: String
  }
});

module.exports = RefID = mongoose.model('RefID', RefSchema);