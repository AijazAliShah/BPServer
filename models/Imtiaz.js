const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ImtiazSchema = new Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  token: {
    type: String,
  }
});

module.exports = Imtiaz = mongoose.model('Imtiaz', ImtiazSchema);