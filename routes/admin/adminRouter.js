const express = require('express');
const adminController = require('../../controllers/admin/adminController');
const customerController = require('../../controllers/admin/customerController');
const router = express.Router();
const adminAuth = require('../../middlewares/adminAuth');
const catController = require('../../controllers/admin/categoryController');
const productController = require('../../controllers/admin/productController');
const brandController = require("../../controllers/admin/brandController");
const orderController = require("../../controllers/admin/orderController")
//for multer 
const multer = require("multer");
const storage = require("../../helpers/multer");
const uploads = multer({ storage: storage });


// Load admin controller

router.get("/login",adminController.loadlogin);
router.post("/login",adminController.loginverification);

// for dashboard
router.get("/",adminController.loaddashboard);
router.get("/logout",adminController.logout);


// for customer management
router.get("/users",adminAuth,customerController.userInfo);
// for blocking and unblocking customers
router.get("/block-user", customerController.userBlocked);
router.get("/unblock-user", customerController.userUnblocked);


// for category management
router.get("/category",adminAuth,catController.categoryInfo);
router.post("/addCategory",catController.addCategory);
router.get("/deleteCategory",catController.deleteCategory);
router.get("/editCategory", catController.geteditCategory);
router.post("/editCategory/:id", catController.editCategory);
router.get("/blockCategory",catController.catBlocked);
router.get("/unblockCategory",catController.catUnblocked);

router.get("/addProducts",adminAuth,productController.getProductInfo);
router.post(
  "/addProducts",
  uploads.array("images", 4),
  productController.addProducts
);
router.get("/products",adminAuth,productController.getAllProducts);
router.put("/products/deleteProduct", productController.deleteProducts);
router.get("/editProduct", productController.getEditProducts);
router.post(
  "/editProduct/:id",
  uploads.array("images", 4),
  productController.editProduct
);

//for brands section
router.get("/brands",adminAuth,brandController.getBrandPage);
router.post("/addbrands", uploads.single("image"), brandController.addBrand);
router.get("/blockBrand", brandController.blockBrand);
router.post("/deleteBrand/:id",brandController.deleteBrand);

//for order route
router.get("/orders", orderController.getOrders);
router.post("/orders/:id", orderController.updateOrderStatus);
router.get('/details/:id', orderController.getOrderDetails);



module.exports = router;