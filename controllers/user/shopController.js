const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const brand = require("../../models/brandSchema")
const category = require("../../models/categorySchema")



const loadshop = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });
        const categories = await category.find({ isListed: true });
        const categoryIds = categories.map((category) => category._id.toString());
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            combos: { $elemMatch: { quantity: { $gt: 0 } } }, 
        }).sort({ createdOn: -1 }).skip(skip).limit(limit);

       
        
        

        const totalProducts = await Product.countDocuments({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gt: 0 },
        });

        const totalPages = Math.ceil(totalProducts / limit);
       const brands = await brand.find({isBlocked:false})
      const categoriesWithids = categories.map(category => ({_id:category._id,name:category.name}))
     
      
        res.render("shop",{
            user:userData,
            product:products,
            category:categoriesWithids,
            brand:brands,
            totalproducts:totalProducts,
            currentPage:page,
            totalPages:totalPages
        });
    } catch (error) {
        console.log("eroor on loadshop",error);
        
        res.redirect("/pageNotFound");
    }
};





module.exports={
    loadshop,
}