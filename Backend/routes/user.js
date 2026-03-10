const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { uploadAvatar } = require("../utilities/cloudinary"); // adjust path

router.use(authController.protect); // Protect all routes after this middleware

router.get('/me', userController.getMe);
router.patch('/me',userController.updateMe);
router.patch('/update-avatar',uploadAvatar.single("avatar"), userController.updateAvatar);
router.patch('/update-password',  userController.updatePassword);
router.get('/users',  userController.getUsers);
router.get("/someone", userController.getSomeOne);
router.patch('/public-key', userController.updatePublicKey);
router.post('/start-conversation',  userController.startConversation);
router.get('/conversations',userController.getConversations);

module.exports = router;