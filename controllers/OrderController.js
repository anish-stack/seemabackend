const Orders = require('../models/OrderModel');
const merchantId = "PGTESTPAYUAT"
const apiKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
const crypto = require('crypto');
const axios = require('axios');
async function doPayment(amount, Merchant, transactionId, res, req) {
    try {
        const user = await req.user;
        // console.log(user) // Assuming req.user is a Promise resolving to user data
        const data = {
            merchantId: merchantId,
            merchantTransactionId: transactionId,
            merchantUserId: Merchant,
            name: user.name || "User",
            amount: amount * 100,
            redirectUrl: `${process.env.BACKEND_URL}/api/status/${transactionId}}`,
            redirectMode: 'POST',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + apiKey;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;
        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
        // console.log(checksum)
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        const response = await axios.request(options);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        // Handle error
    }
}

exports.CreateOrder = async (req, res) => {
    try {
        const { items, finalPrice, UserInfo, PaymentMode, UserDeliveryAddress } = req.body;

        if (!finalPrice || !UserInfo || !PaymentMode || !UserDeliveryAddress) {
            return res.status(403).json({
                success: false,
                msg: "Please Fill All Fields "
            });
        }

        let payData;

        if (PaymentMode === "Online") {
            const { amount, transactionId, Merchant } = generateOnlinePaymentDetails(finalPrice);
            payData = await doPayment(amount, Merchant, transactionId, res, req);
        }

        const createOrderSave = new Orders({
            items: items,
            UserInfo,
            UserDeliveryAddress,
            PaymentMode,
            FinalPrice: finalPrice
        });

        await createOrderSave.save();

        res.status(200).json({
            success: true,
            msg: "Order created successfully",
            data: createOrderSave,
            payData: payData || "COD - ORDER"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

function generateOnlinePaymentDetails(finalPrice) {
    const transactionId = generateMerchantTransactionId();
    const Merchant = MerchantId();
    const amount = finalPrice;
    return { amount, transactionId, Merchant };
}

function generateMerchantTransactionId() {
    const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const idLength = 25;
    let transactionId = '';

    for (let i = 0; i < idLength; i++) {
        const randomIndex = Math.floor(Math.random() * allowedCharacters.length);
        transactionId += allowedCharacters.charAt(randomIndex);
    }

    return transactionId;
}

function MerchantId() {
    const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const idLength = 25;
    let MerchantIds = '';

    for (let i = 0; i < idLength; i++) {
        const randomIndex = Math.floor(Math.random() * allowedCharacters.length);
        MerchantIds += allowedCharacters.charAt(randomIndex);
    }

    return MerchantIds;
}

exports.checkStatus = async (req, res) => {


    // Extract the merchantTransactionId from the request body
    const { transactionId: merchantTransactionId } = req.body;

    // Check if the merchantTransactionId is available
    if (!merchantTransactionId) {
        return res.status(400).json({ success: false, message: "Merchant transaction ID not provided" });
    }

    // Retrieve the merchant ID from the environment variables or constants
    const merchantId = "PGTESTPAYUAT";

    // Generate the checksum for authentication
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + apiKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;
    const testUrlCheck = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1"
    // const testUrlCheck = "https://api.phonepe.com/apis/hermes/pg/v1/"

    // Prepare the options for the HTTP request
    const options = {
        method: 'GET',
        url: `${testUrlCheck}/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    axios.request(options)
        .then(async (response) => {
            if (response.data.success === true) {
                const timestampRange = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
                const LatestOrder = await Orders.findOneAndUpdate(
                    { createdAt: { $gte: timestampRange } }, // Filter based on createdAt field
                    {
                        PaymentStatus: 'Done', // Update payment status
                        Transaction_id: merchantTransactionId // Update transaction ID
                    },
                    { new: true }
                );
                console.log(LatestOrder)
                if (!LatestOrder) {
                    return res.status(404).json({ success: false, message: "No order found within the specified timestamp range" });
                }
                await LatestOrder.save()

                const successRedirect = `${process.env.FRONTEND_URL}/Payment-Status/${merchantTransactionId}?success=true`;
                res.redirect(successRedirect);

            } else {
                const failedRedirectUrl = `${process.env.FRONTEND_URL}/Payment-Status/${merchantId || merchantTransactionId}?success=false`;
                res.redirect(failedRedirectUrl);

            }
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        });

};

//Get My Orders
exports.GetMyOrders = async (req, res) => {
    try {
        const user = req.user;
        const foundOrders = await Orders.find({ 'UserInfo.userid': user._id });

        res.status(200).json({
            success: true,
            msg: "Orders Found Successfully",
            data: foundOrders
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
