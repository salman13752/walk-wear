const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Brand = require("../../models/brandSchema");
const Category = require("../../models/categorySchema");
const Order = require("../../models/orderScheema");



const processCheckout = async (req, res) => {
    try {
      const userId = req.session.user;
      const userData = userId ? await User.findById(userId) : null;
      const brand = await Brand.find({});
      const addresses = await Address.find({ userId: userId });
      const cart = await Cart.findOne({ userId }).populate("items.productId");
  
      if (!cart) {
        return res
          .status(404)
          .json({ sucess: false, message: "no cart available" });
      }
  
      //fetch combo detail
      for (const item of cart.items) {
        if (item.comboId) {
          const product = await Product.findById(item.productId);
          const combo = product.combos.find(
            (combo) => combo._id.toString() === item.comboId.toString()
          );
  
          if (!combo) {
            return res
              .status(404)
              .json({ sucess: false, message: "combos not available" });
          }
  
          //Attach combo details to the item
          item.comboDetails = combo;
          
        }
      }
  
      const address = addresses.flatMap((doc) => doc.address);
      // filter out items with zero quantity
      const validCartItems = cart.items.filter((item) => item.quantity > 0);
     
  
      // check stock for each valid item
      for (const item of validCartItems) {
        const availableQuantity = item.comboDetails
          ? item.comboDetails.quantity
          : item.productId.stock;
        
      }
      // calculate total price
      const totalPrice = validCartItems.reduce(
        (sum, item) =>
          sum +
          (item.comboDetails ? item.comboDetails.salePrice : item.price) *
            item.quantity,
        0
      );
  
      // calculate the cart summary
      const cartSummary = {
        totalPrice,
      };    
      res.render("checkOut", {
        cart: { items: validCartItems },
        brand,
        cartSummary,
        user: userData,
        totalPrice,
        address,
      });
    } catch (error) {
      console.error("Error processing checkout:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  









const placeOrder = async (req, res) => {
    try {
      const userId = req.session.user;
      const { selectedAddress, paymentMethod } = req.body;
   
  console.log(selectedAddress)
      if (!selectedAddress || !paymentMethod) {
        return res
          .status(400)
          .json({ success: false, message: "Missing order details" });
      }
  
      const cart = await Cart.findOne({ userId: userId })
        .populate({
          path: "items.productId",
          populate: {
            path: "combos",
            model: "Combo", 
          },
        })
        .lean();
       
  
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }
  
      const validCartItems = cart.items.filter((item) => item.quantity > 0);
      if (validCartItems.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No valid items in cart" });
      }

      const orderItems = await Promise.all(
        validCartItems.map(async (item) => {
          const selectedCombo = item.productId.combos.find(
            (combo) => combo._id.toString() === item.comboId.toString()
          );
         
          if (!selectedCombo) {
            throw new Error(
              `Combo not found for product: ${item.productId.productName}`
            );
          }
          return {
            product: item.productId._id,
            productName: item.productId.productName,
            quantity: item.quantity,
            price: selectedCombo.salePrice,
            totalPrice: item.quantity * selectedCombo.salePrice,
            Size: selectedCombo.Size,
            Colour: selectedCombo.Colour,
            status: "Pending",
          };
        })
      );
  
      





      const totalAmount = orderItems.reduce(
        (acc, item) => acc + item.totalPrice,
        0
      );
  
      const newOrder = new Order({
        userId,
        address: selectedAddress,
        paymentMethod: paymentMethod,
        orderedItems: orderItems,
        totalPrice: totalAmount,
        FinalAmount: totalAmount,
      });
  
      await newOrder.save();
  
      // update product quantities
      await Promise.all(
        validCartItems.map(async (item) => {
          const product = await Product.findById(item.productId._id);
          if (product) {
            const comboIndex = product.combos.findIndex(
              (combo) => combo._id.toString() === item.comboId.toString()
            );
            if (comboIndex !== -1) {
              const selectedCombo = product.combos[comboIndex];
              if (selectedCombo.quantity < item.quantity) {
                throw new Error(
                  `Insufficient stock for product: ${product.productName}`
                );
              }
              product.combos[comboIndex].quantity -= item.quantity;
              if (product.combos[comboIndex].quantity === 0) {
                product.combos[comboIndex].status = "Out of Stock";
              }
              await product.save();
            } else {
              throw new Error(
                `Invalid combo selection for product: ${product.productName}`
              );
            }
          } else {
            throw new Error(`Product not found for ID: ${item.productId._id}`);
          }
        })
      );
  
      //clear the cart
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
      

      res.render("Order-placed",{user:userId})
    } catch (error) {
      console.error("Error placing order:",error);
     
    }
  };
  



  module.exports = {
    processCheckout,
    placeOrder,
    
  }