const express = require('express');
const authController = require('../controllers/auth.controller');
const { authUserMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/user/register',authController.registerUser)
router.post('/user/login',authController.loginUser)
router.get('/user/logout',authController.logoutUser)

// current user
router.get('/me', authUserMiddleware, (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: { id: user._id, fullName: user.fullName, email: user.email } });
});

// Food Partner Routes
router.post('/foodpartner/register',authController.registerFoodPartner)
router.post('/foodpartner/login',authController.loginFoodPartner)
router.get('/foodpartner/logout',authController.logoutFoodPartner)

module.exports = router;