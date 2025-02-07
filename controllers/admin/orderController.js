const User = require("../../models/userSchema") 
const mongoose = require('mongoose');
const Product = require("../../models/productSchema");
const Order = require("../../models/orderScheema");
const Address = require("../../models/addressSchema")




const getOrders = async (req, res) => {
  const orders = await Order.find();
  res.render("orders", { orders });
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
      const { itemId, status } = req.body;
      const orderId = req.params.id;

      if (!itemId || !orderId) {
          return res.status(400).send("Invalid order or item ID.");
      }

      await Order.findOneAndUpdate(
          { _id: orderId, "orderedItems._id": itemId },
          { $set: { "orderedItems.$.status": status } }
      );

      console.log("Updated Order Item ID:", itemId);
      res.redirect("/admin/orders");
  } catch (error) {
      console.log("Error updating order status:", error);
      res.status(500).send("Internal Server Error");
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const id = req.params.id
    console.log(req.params)
    
    const order = await Order.findOne({ orderId: id})
      .populate('userId', 'name email') 
      // .populate('address.address')
      .populate('orderedItems.product');

const addressDoc = await Address.findOne({userId:order.userId,'address._id':order.address})
const selectedAddress = addressDoc ? addressDoc.address.find(addr => addr._id.toString() === order.address.toString()) : null;


     

    res.render('orderDetail', { order,selectedAddress });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};



module.exports={
    updateOrderStatus,
    getOrders,
    getOrderDetails
    
}
