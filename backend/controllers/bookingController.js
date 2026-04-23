const Booking = require("../models/booking");
const Property = require("../models/property");
const { sendEmail } = require("../services/brevoService");
const User = require("../models/user");

exports.createBooking = async (req, res) => {
  try {
    const { propertyId, checkInDate, checkOutDate } = req.body;

    if (!propertyId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "propertyId, checkInDate and checkOutDate are required"
      });
    }

    const property = await Property.findByPk(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    if (!property.available) {
      return res.status(400).json({
        message: "Property is not available"
      });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date"
      });
    }

    const totalPrice = diffDays * property.price;

    const booking = await Booking.create({
      checkInDate,
      checkOutDate,
      totalPrice,
      status: "pending",
      PropertyId: property.id,
      tenantId: req.user.id,
      ownerId: property.UserId || property.userId
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    console.log("Create booking error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { tenantId: req.user.id },
      include: [
        {
          model: Property,
          attributes: ["id", "title", "location", "price", "priceType"]
        },
        {
          model: User,
          as: "Owner",
          attributes: ["id", "name", "phone"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      message: "My bookings fetched successfully",
      bookings: bookings
    });
  } catch (error) {
    console.log("My bookings error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { ownerId: req.user.id },
      include: [
        {
          model: Property,
          attributes: ["id", "title", "location", "price"]
        },
        {
          model: User,
          as: "Tenant",
          attributes: ["id", "name", "email", "phone"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      message: "Owner bookings fetched successfully",
      bookings
    });
  } catch (error) {
    console.log("Get owner bookings error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, cancelReason } = req.body;

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "You can update only your booking requests"
      });
    }

    if (!["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    if (status === "cancelled" && (!cancelReason || cancelReason.trim() === "")) {
      return res.status(400).json({
        message: "Cancellation reason is required"
      });
    }

    booking.status = status;

    if (status === "cancelled") {
      booking.cancelReason = cancelReason;
    } else {
      booking.cancelReason = null;
    }

    await booking.save();

    res.status(200).json({
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.log("Update booking status error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.cancelMyBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.tenantId !== req.user.id) {
      return res.status(403).json({
        message: "You can cancel only your own booking"
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking already cancelled"
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Completed booking cannot be cancelled"
      });
    }

    booking.status = "cancelled";
    booking.cancelReason = "Cancelled by tenant";
    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error) {
    console.log("Cancel booking error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};