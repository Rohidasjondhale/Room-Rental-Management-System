const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const auth = require("../middleware/auth");
const ownerAuth = require("../middleware/ownerAuth");

router.post("/", auth, bookingController.createBooking);
router.get("/my-bookings", auth, bookingController.getMyBookings);
router.get("/owner-bookings", auth, ownerAuth, bookingController.getOwnerBookings);
router.put("/:id/status", auth, ownerAuth, bookingController.updateBookingStatus);
router.put("/:id/cancel", auth, bookingController.cancelMyBooking);

module.exports = router;