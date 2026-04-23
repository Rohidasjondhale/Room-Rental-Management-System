const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/create-order", auth, paymentController.createOrder);
router.post("/verify-order", auth, paymentController.verifyOrder);

module.exports = router;