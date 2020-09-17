const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const OrderSchema = new Schema({
    storeId: {
        type: String
    },
    products: [ {
        product: {
            _id: {
                type: String
            },
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
            
    },
    quantity: String,
    amount: String
    }
    ],
    totalAmount: {
        type: String
    },
    orderNumber: String,
    storeName: String,
    storeAddress: String,
    storePhone: String,
    userId: String,
    name: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    orderTime :{
        type: String
    },
    orderDate :{
        type: String
    },
    isInPreparation: Boolean,
    isReady: Boolean,
    isPicked: Boolean,
    isAccepted: Boolean, 
    isRejected: Boolean,
    isHomeDelivery: Boolean
});

module.exports = Order = mongoose.model('Order', OrderSchema);