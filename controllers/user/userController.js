
const nodemailer = require('nodemailer'); // For sending emails
require('dotenv').config(); // To load environment variables
const bcrypt = require('bcrypt'); // For hashing passwords
const User = require('../../models/userSchema'); // User model for MongoDB
const session = require('express-session'); // For managing user sessions




// Page Not Found Handler
const pageNotFound = async (req, res) => {
    try {
        res.render('page-404'); // Render the "Page Not Found" view
    } catch (error) {
        res.redirect('/pageNotFound'); // Redirect to the same page in case of an error
    }
};

// Load Home Page
const loadHomepage = async (req, res) => {
    try {
        const user = req.session.user;
        if(user){
          const userData = await User.findOne({_id:user})
        res.render("home",{user:userData})
        }else{
          return  res.render("home")
        }
       
    } catch (error) {
        console.log('Home Page not found');
        res.status(500).send('Server Error');
    }
};


//function to render registeration page
const loadRegisterPage = async (req, res) => {
    try {
      return res.render("signUpPage");
    } catch (error) {
      console.log("Error at home page");
      res.status(500).send("server error occured");
    }
  };
  
 //function to generate otp
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  


//function to send email
async function sendVerificationEmail(email, otp) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });
  
      const info = await transporter.sendMail({
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "Verify your account",
        text: `Your otp is ${otp}`,
        html: `<b> Your otp is ${otp}</b>`,
      });
  
      return info.accepted.length > 0;
    } catch (error) {
      console.log("error sending email", error);
      return false;
    }
  }
  




  const signup = async (req, res) => {
    try {
      const { name, phone, password } = req.body;
      const email = req.body.email.trim().toLowerCase();
      const findUser = await User.findOne({ email: email });
      if (findUser) {
        return res.render("signUpPage", { message: "user already exists" });
      }
  
      const otp = generateOtp();
  
      const emailSent = sendVerificationEmail(email, otp);
  
      if (!emailSent) {
        return res.render("signUpPage", { message: "Unable to sent email" });
      }
      req.session.userOtp = otp;
      req.session.userData = { email, password, name, phone };
  
      res.render("verifyOtp");
      console.log("otp send", otp);
    } catch (error) {
      console.error("error in save usr", error);
      res.status(500).redirect("/page-not-found");
    }
  };



//function to secure password
const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log("error at securing password", error);
      return false;
    }
  };



  //function to do verify otp
const verifyOtp = async (req, res) => {
    try {
      const { otp } = req.body;
  
      console.log("otp", otp);
  
      if (otp === req.session.userOtp) {
        const user = req.session.userData;
        const passwordHash = await securePassword(user.password);
  
        const saveUserData = new User({
          name: user.name,
          phone: user.phone,
          email: user.email,
          password: passwordHash,
        });
        await saveUserData.save();
  
        req.session.user = saveUserData._id;
        res.json({ success: true, redirectUrl: "/" });
      } else {
        res.status(400).json({ success: false, message: "Please try again" });
      }
    } catch (error) {
      console.error("error verifying otp", error);
      res.status(400).json({ success: false, message: "an error try again" });
    }
  };
  


  const resendOtp = async (req, res) => {
    try {
      const { email } = req.session.userData;
      if (!email) {
        return res
          .status(400)
          .status({ success: false, message: "email not found " });
      }
  
      const otp = generateOtp();
      req.session.userOtp = otp;
  
      const emailSent = await sendVerificationEmail(email, otp);
  
      if (emailSent) {
        console.log("resend email send ", otp);
        res.status(200).json({ success: true, message: "otp send successfully" });
      } else {
        res.status(500).json({ success: false, message: "Otp failed to send" });
      }
    } catch (error) {
      console.log("Error at resend otp", error);
      res.status(500).json({ success: false, message: "Internal server error " });
    }
  };


  const loadLogin = async (req, res) => {
    try {
      if (!req.session.user) {
        return res.render("login");
      } else {
        res.redirect("/");
      }
    } catch (error) {
      console.log("error at server page");
      res.status(500).send("server error occured");
    }
  };



  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const findUser = await User.findOne({ isAdmin: 0, email: email });
      if (!findUser) {
        return res.render("login", { message: "user not found" });
      }
      if (findUser.isBlocked) {
        return res.render("login", {
          message: "user is blocked by admin",
        });
      }
  
      const passwordMatch = await bcrypt.compare(password, findUser.password);
      if (!passwordMatch) {
        return res.render("login", { message: "incorrect password" });
      }
  
      req.session.user = findUser._id;
  
      res.redirect("/");
    } catch (error) {
      console.log("error at login page", error);  
      res.render("login", {
        message: "Login failed , please try again later",
      });
    }
  };


  //for logout
const logout = async (req, res) => {
    try {
      req.session.user = null;
      req.session.save((err) => {
        if (err) {
          console.log("Error saving session:", err);
          return res.redirect("/page-not-found");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.log("Error at logout:", error);
      res.redirect("/page-not-found");
    }
  };

  


module.exports = {
    pageNotFound,
    loadHomepage,
    loadRegisterPage,
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    login,
    logout,
};
