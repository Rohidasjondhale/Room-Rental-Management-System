const axios = require("axios");
require("dotenv").config();

exports.createOrder = async (payment, user) => {
  try {
    const orderId = "order_" + Date.now();

    const data = {
      order_id: orderId,
      order_amount: payment.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: user.id.toString(),
        customer_email: user.email,
        customer_phone: "9999999999"
      }
    };

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      data,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    console.log("Cashfree error:", error.response?.data || error.message);
    throw error;
  }
};