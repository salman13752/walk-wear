const express = require('express');
const adminController = require('../../controllers/admin/adminController');
const customerController = require('../../controllers/admin/customerController');
const router = express.Router();
const {adminAuth} = require('../../middlewares/auth')



// Load admin controller

router.get("/login",adminController.loadlogin);
router.post("/login",adminController.loginverification);

// for dashboard
router.get("/",adminAuth,adminController.loaddashboard);
router.get("/logout",adminController.logout);

// for customer management

router.get("/users",adminAuth,customerController.userInfo);




module.exports = router;