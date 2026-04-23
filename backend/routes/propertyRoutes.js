const express = require("express");
const router = express.Router();

const propertyController = require("../controllers/propertyController");
const auth = require("../middleware/auth");
const ownerAuth = require("../middleware/ownerAuth");

router.post("/", auth, ownerAuth, propertyController.addProperty);
router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getSingleProperty);
router.put("/:id", auth, ownerAuth, propertyController.updateProperty);
router.delete("/:id", auth, ownerAuth, propertyController.deleteProperty);

module.exports = router;