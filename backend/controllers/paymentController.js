const axios = require("axios");
const Booking = require("../models/booking");

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.tenantId !== req.user.id) {
      return res.status(403).json({ message: "You can pay only for your own booking" });
    }

    const orderId = "order_" + Date.now();

    const cashfreeResponse = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: booking.totalPrice,
        order_currency: "INR",
        customer_details: {
          customer_id: String(req.user.id),
          customer_name: req.user.name || "User",
          customer_email: req.user.email,
          customer_phone: req.user.phone || "9999999999"
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/payment-status.html?order_id={order_id}&booking_id=${booking.id}`
        },
        order_note: `Booking payment for booking ${booking.id}`
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": process.env.CASHFREE_API_VERSION || "2022-09-01",
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({
      message: "Order created successfully",
      orderId: cashfreeResponse.data.order_id,
      paymentSessionId: cashfreeResponse.data.payment_session_id
    });
  } catch (error) {
    console.log("Create Cashfree order error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create payment order",
      error: error.response?.data || error.message
    });
  }
};

exports.verifyOrder = async (req, res) => {
  try {
    const { orderId, bookingId } = req.body;

    if (!orderId || !bookingId) {
      return res.status(400).json({ message: "orderId and bookingId are required" });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.tenantId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const cashfreeResponse = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": process.env.CASHFREE_API_VERSION || "2022-09-01"
        }
      }
    );

    const orderStatus = cashfreeResponse.data.order_status;

    if (orderStatus === "PAID") {
      booking.status = "confirmed";
      await booking.save();

      return res.status(200).json({
        message: "Payment verified successfully",
        orderStatus
      });
    }

    return res.status(400).json({
      message: "Payment not completed",
      orderStatus
    });
  } catch (error) {
    console.log("Verify Cashfree order error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.response?.data || error.message
    });
  }
};