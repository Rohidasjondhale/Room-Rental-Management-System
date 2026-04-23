const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Payment = require("./models/payment");

dotenv.config();

const sequelize = require("./config/db");

const User = require("./models/user");
const Property = require("./models/property");
const Booking = require("./models/booking");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/payments", paymentRoutes);

// relations
User.hasMany(Property);
Property.belongsTo(User);

Property.hasMany(Booking);
Booking.belongsTo(Property);

User.hasMany(Booking, { foreignKey: "tenantId" });
Booking.belongsTo(User, { foreignKey: "tenantId", as: "Tenant" });

User.hasMany(Booking, { foreignKey: "ownerId" });
Booking.belongsTo(User, { foreignKey: "ownerId", as: "Owner" });

// routes
app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/bookings", bookingRoutes);
app.use("/password", passwordRoutes);

app.get("/", (req, res) => {
  res.send("Room Rental Management System backend is running");
});

sequelize.sync()
  .then(() => {
    console.log("Database connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database error:", err);
  });