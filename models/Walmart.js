const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const WalmartSchema = new Schema({
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

module.exports = Walmart = mongoose.model('Walmart', WalmartSchema);