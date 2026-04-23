const Property = require("../models/property");

// add property
exports.addProperty = async (req, res) => {
  try {
    const { title, description, location, price, priceType } = req.body;

    if (!title || !description || !location || !price || !priceType) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const property = await Property.create({
      title: title,
      description: description,
      location: location,
      price: price,
      priceType: priceType,
      UserId: req.user.id
    });

    res.status(201).json({
      message: "Property added successfully",
      property: property
    });
  } catch (error) {
    console.log("Add property error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.findAll();

    res.status(200).json({
      message: "Properties fetched successfully",
      properties: properties
    });
  } catch (error) {
    console.log("Get properties error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// get single property
exports.getSingleProperty = async (req, res) => {
  try {
    const id = req.params.id;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    res.status(200).json({
      message: "Property fetched successfully",
      property: property
    });
  } catch (error) {
    console.log("Get single property error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// update property
exports.updateProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, location, price, available, priceType } = req.body;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    if (property.UserId !== req.user.id) {
      return res.status(403).json({
        message: "You can update only your property"
      });
    }

    property.title = title || property.title;
    property.description = description || property.description;
    property.location = location || property.location;
    property.price = price || property.price;
    property.priceType = priceType || property.priceType;

    if (available !== undefined) {
      property.available = available;
    }

    await property.save();

    res.status(200).json({
      message: "Property updated successfully",
      property: property
    });
  } catch (error) {
    console.log("Update property error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// delete property
exports.deleteProperty = async (req, res) => {
  try {
    const id = req.params.id;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    if (property.UserId !== req.user.id) {
      return res.status(403).json({
        message: "You can delete only your property"
      });
    }

    await property.destroy();

    res.status(200).json({
      message: "Property deleted successfully"
    });
  } catch (error) {
    console.log("Delete property error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};