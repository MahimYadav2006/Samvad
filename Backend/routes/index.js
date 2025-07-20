const router = require("express").Router();

// Importing routes
const authRoutes = require("./auth");
const userRoutes = require("./user");
const chatRoutes = require("./chat");

// Setting up major routing
router.use("/auth",authRoutes);
router.use("/user",userRoutes);
router.use("/chat", chatRoutes);


module.exports = router;