const router = require("express").Router();

const authController = require("../controllers/authController");
const chatController = require("../controllers/chatController");
const uploadDoc = require("../utilities/cloudinary").uploadDoc; 
const uploadAudio = require("../utilities/cloudinary").uploadAudio;
const uploadMedia = require("../utilities/cloudinary").uploadMedia;

router.use(authController.protect); 


router.get("/messages/:conversationId", chatController.getMessages);
router.post("/upload-doc", uploadDoc.single("document"), chatController.uploadDoc);
router.post("/upload-audio", uploadAudio.single("audio"), chatController.uploadAudio);
router.post("/upload-media", uploadMedia.single("media"), chatController.uploadMedia);
module.exports = router;