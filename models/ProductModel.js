const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    img: {
        type: String    },
    productName: {
        type: String,
        required: true
    },
    sizes: [{
        size: {
            type: String,
            required: true
        },
        discountPrice: {
            type: String,
            required: true
        },
        mainPrice: {
            type: String,
        },
        colors: {
            colorValue: {
                type: String
            },
            stockNo: {
                type: String
            }
        }
    }],
    secondImg: {
        type: String
       
    },
    thirdImage: {
        type: String
       
    },
    fourthImage: {
        type: String
       
    },
    discountPrice: {
        type: String,
        required: true
    },
    mainPrice: {
        type: String
    },
    percentage: {
        type: String,
        required: true
    },
    collectionName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    SKU: {
        type: String,
        required: true
    },
    availability: {
        type: Boolean,
       default:true
    },
    categories: {
        type: String,
        required: true
    },
    tags:{
        type: String    }
}, { timeStamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
