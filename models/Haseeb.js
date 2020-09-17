const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const HaseebSchema = new Schema({
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

module.exports = Haseeb = mongoose.model('Haseeb', HaseebSchema);