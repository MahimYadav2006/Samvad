const router = require(express).Router();

// Importing routes
const authRoutes = require("./auth");
const userRoutes = require("./user");

// Setting up major routing
router.use("/auth",authRoutes);
router.use("/user",userRoutes);




module.exports = router;