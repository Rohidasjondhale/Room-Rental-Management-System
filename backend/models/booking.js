const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  checkInDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  checkOutDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
    defaultValue: "pending"
  },
  paymentStatus: {
  type: DataTypes.ENUM("pending", "paid", "failed"),
  defaultValue: "pending"
},
cancelReason: {
  type: DataTypes.TEXT,
  allowNull: true
}

});

module.exports = Booking;