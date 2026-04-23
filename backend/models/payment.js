const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("pending", "paid", "failed"),
    defaultValue: "pending"
  },

  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "cashfree"
  },

  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cashfreeOrderId: {
  type: DataTypes.STRING,
  allowNull: true
}
});

module.exports = Payment;