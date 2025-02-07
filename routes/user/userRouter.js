const express = require("express");
const userRoute = express.Router();
const userController = require("../../controllers/user/userController");
const passport = require("passport");
const productController = require("../../controllers/user/productController");
const cartController = require("../../controllers/user/cartController");
const orderController = require("../../controllers/user/orderController")
const shopController = require("../../controllers/user/shopController")
const userAuth = require("../../middlewares/userAuth")
//page not found route
userRoute.get("/page-not-found", userController.pageNotFound);

//for home page
userRoute.get("/", userController.loadHomepage);

//for login route
userRoute.get("/login", userController.loadLogin);
userRoute.post("/login", userController.login);

//for registeration page
userRoute.get("/signup", userController.loadRegisterPage);
userRoute.post("/signup", userController.signup);

//for otp verification
userRoute.post("/verify-otp", userController.verifyOtp);
userRoute.post("/resend-otp", userController.resendOtp);

//for userlogout
userRoute.get("/logout", userController.logout);

//for google authentication
userRoute.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
userRoute.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {

    req.session.user = req.user._id;

    res.redirect("/");
  }
);

//for product management
userRoute.get("/productDetails/:productId", productController.productDetails);
userRoute.get("/productDetails/combo/:id", productController.loadComboDetails);


// for user profile
userRoute.get('/profile/:id', userAuth, userController.showUserProfile);
userRoute.get('/profile/edit/:id', userAuth, userController.editProfile);
userRoute.post("/userUpdate/:id", userAuth, userController.updateProfile);


//for cart details
userRoute.get("/cart", userAuth, cartController.getCart);
userRoute.post("/addCart/:productId/combo/:comboId", userAuth, cartController.addToCart);
userRoute.delete("/cart/:cartId/item/:itemId", userAuth, cartController.deleteCartItem);
userRoute.patch("/updateCart", userAuth, cartController.addquantity);
userRoute.patch("/decreaseQuantity", userAuth, cartController.decreaseQuantity);

// for checkout
userRoute.get("/checkout", orderController.processCheckout)
userRoute.post("/ckeckOut", orderController.placeOrder);
// userRoute.get("/orderplaced", userAuth.userCheck, orderController.orderPlaced);


//for shopping page
userRoute.get("/shop", shopController.loadshop)

// for filtering 
userRoute.get("/filter", shopController.filterProduct)
userRoute.get("/filterPrice", shopController.filterByPrice)


userRoute.get("/products",shopController.sortProduct)

//for search 
userRoute.post("/Search", shopController.searchProducts)
module.exports = userRoute;

// for add address
userRoute.get("/address", userAuth, userController.getAddress)
userRoute.get("/addAddress", userAuth, userController.addAddress)
userRoute.post("/addAddress", userAuth, userController.postAddAddress)
userRoute.get("/editAddress", userAuth, userController.editAddress)
userRoute.post("/editAddress", userAuth, userController.postEditAddress)
userRoute.get("/deletAddress", userAuth, userController.deleteAddress)

// for oders page

userRoute.get("/Orders", userAuth, userController.loadOrder)


