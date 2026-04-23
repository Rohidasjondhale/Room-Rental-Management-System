const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Property = sequelize.define("Property", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  location: {
    type: DataTypes.STRING,
    allowNull: false
  },

  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  priceType: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: "day"
}
});

module.exports = Property;