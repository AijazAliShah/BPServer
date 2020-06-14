const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const StoreSchema = new Schema({
  
storeName: {
  type: String
},
ownerName: {
    type: String,
  },
emailAddress: {
    type: String,
  },
phoneNumber: {
    type: String,
  },
storeAddress: {
    type: String,
  },
userName: {
    type: String,
  },
password: {
    type: String,
  },
aboutStore: {
    type: String,
  },
  isActive: {
      type: Boolean,
  },
  isBlocked: {
    type: Boolean,
},
  lat: String,
  lng: String,
  
});

module.exports = Store = mongoose.model('Store', StoreSchema);