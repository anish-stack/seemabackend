const mongoose = require('mongoose')
const MiniProduct = new mongoose.Schema({
    image:{
        type: String

    },
    Productname: {
        type: String
    },
    Size: {
        type: String
    },
    price: {
        type: String
    },
    Colour: {
        type: String
    },
    Quantity: {
        type: String
    },
    Categories: {
        type: String
    },

})
const OrderModel = new mongoose.Schema({

    items: [MiniProduct],
    FinalPrice: {
        type: String
    },
    UserInfo: {
        Name: {
            type: String
        },
        Email: {
            type: String
        },
        userid: {
            type: String
        }
    },
    UserDeliveryAddress:{
        Street:{type:String},
        HouseNo:{type:String},
        Pincode:{type:String},
        State:{type:String},
        City:{type:String},
        landMark:{type:String}
    },
    Transaction_id: {
        type: String
    },
    OrderStatus: {
        type: String,
        default: "pending"
    },
    PaymentMode: {
        type: String,
        default: "Online"
    },
    PaymentStatus: {
        type: String,
        default: "Complete"
    },
    OrderDate: {
        type: Date,
        default: Date.now()
    }

}, { timestamps: true })


const Orders = mongoose.model('Order', OrderModel)
module.exports = Orders