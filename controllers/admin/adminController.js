const User = require("../../models/userSchema") 
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { session } = require("passport");
const Product = require("../../models/productSchema");



const loadlogin = async (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    
    res.render("adminLoginPage");
  }
};

  
const loginverification = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, isAdmin: true });
    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.admin = admin; 
        
         
        return res.redirect("/admin");
      } else {
        return res.render("adminLoginPage", {
          message: "Invalid Username or Password",
        });
      }
    } else {
      return res.render("adminLoginPage", {
        message: "Invalid Username or Password",
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};



const loaddashboard = async (req, res) => {
  try {
    
    if (req.session.admin) {
      const totalUsers = await User.findOne({}).countDocuments();
      
      // fetch total products 
      const totalProducts = await Product.countDocuments();

      return res.render("admindash", {
        totalProducts,
        totalUsers,
      });
    } else {
      return res.redirect("/admin/login");
    }
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    return res.redirect("/page-not-found");
  }
};



  
  //function for loggingout admin page
  const logout = async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.log("Error in destroying session");
          return res.status(500).send("Error during logout.");
        }
        res.redirect("/admin/login");  
      });
    } catch (error) {
      console.log("Error at logout:", error);
      res.status(500).send("Internal server error.");
    }
  };
  




  module.exports = {
    loadlogin,
    loginverification,
    loaddashboard,
    logout,
  };