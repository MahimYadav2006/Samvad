const router = require("express").Router();

// Importing routes
const authRoutes = require("./auth");
const userRoutes = require("./user");
const chatRoutes = require("./chat");
const turnController = require("../controllers/turnController");

// Setting up major routing
router.use("/auth",authRoutes);
router.use("/user",userRoutes);
router.use("/chat", chatRoutes);

// TURN credentials endpoint (lightweight, no auth needed —
// the Metered API key is server-side only)
router.get("/turn-credentials", turnController.getTurnCredentials);


module.exports = router;