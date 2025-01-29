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
            totalproducts:totalProducts, // output 0
            currentPage:page,
            totalPages:totalPages
        });
    } catch (error) {
        console.log("eroor on loadshop",error);
        
        res.redirect("/pageNotFound");
    }
};








const filterProduct = async(req,res)=>{
    try {
        const user = req.session.user
        const Category = req.query.category 
        const Brand = req.query.brand



        const findCategory = Category ? await category.findOne({_id:Category}) : null;
        const findBrand = Brand ? await brand.findOne({_id:Brand}) : null;
        const brands = await brand.find({}).lean() 
        const query = {
            isBlocked : false,
           "combos.quantity": { $gt: 0 }
        }

        if(findCategory){
            query.category = findCategory._id;
          
            
        }
        
        if(findBrand){
            query.brand = findBrand._id;
        }

         
        let findProducts = await Product.find(query).lean()
        findProducts.sort((a,b)=> new Date(b.createdOn)-new Date(a.createdOn))



        const categories = await category.find({isListed:true})



        let itemsPerPage = 6;

let currentPage = parseInt(req.query.page) || 1;
let startIndex = (currentPage - 1) * itemsPerPage;
let endIndex = startIndex + itemsPerPage;
let totalPages = Math.ceil(findProducts.length / itemsPerPage);
const currentProduct = findProducts.slice(startIndex, endIndex);




let userData = null;
if (user) {
    userData = await User.findOne({ _id: user });
    if (userData) {
        const searchEntry = {
            category: findCategory ? findCategory._id : null,
            brand: findBrand ? findBrand._id : null,
            searchedOn: new Date(),
        };
        userData.searchHistory.push(searchEntry);
        await userData.save();
    }
}
   


req.session.filterProduct = currentProduct;
res.render("shop",{
    user: userData,
    product:currentProduct,
    category:categories,
    brand:brands,
    totalPages,
    currentPage,
    selectedCategory:Category || null,
    selectedBrand : Brand || null 
})
    } catch (error) {
        console.log(error)
        res.redirect("/pageNotFound")
    }
}



module.exports={
    loadshop,
    filterProduct,
}