const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProductSchema = new Schema({
    storeId: {
        type: String
    },
    productType: {
        type: String
    },
    productName: {
        type: String
    },
    price: {
        type: String
    },
    discount: {
        type: String
    },
    productDescription: {
        type: String
    },
    
});
 
module.exports = Product = mongoose.model('Product', ProductSchema);