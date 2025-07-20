const router = require("express").Router();

const authController = require("../controllers/authController");
const chatController = require("../controllers/chatController");
router.use(authController.protect); 

router.get("/messages/:conversationId", chatController.getMessages);

module.exports = router;