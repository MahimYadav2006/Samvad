const router = require(express).Router();

// Importing routes
const authRoutes = require("./auth");


// Setting up major routing
router.use("/auth",authRoutes);





module.exports = router;