const express = require("express");
const userRoute = express.Router();
const userController = require("../../controllers/user/userController");
const passport = require("passport");


//page not found route
userRoute.get("/page-not-found", userController. pageNotFound);

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
      // Successful login, send user info in session
      req.session.user = req.user;
      res.redirect("/");
    }
  );

// for user login




  
module.exports = userRoute;