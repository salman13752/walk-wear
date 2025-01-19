const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");


const productDetails = async (req, res) => {
    try {
      const user = req.session.user; // Get the logged-in user from the session
      const {productId} = req.params; // Extract the product ID from the request parameters
  console.log(req.params)
      // Fetch the product details by its ID
      const productData = await Product.findOne({ _id: productId });
  
      if (!productData) {
        return res.status(404).send('Product not found');
      }
  
      // Render the product details page with the fetched data
      res.render('product-details', {
        user: user, // Pass the user session data
        product: productData // Pass the fetched product data
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send('An error occurred while fetching product details');
    }
  };
  






  module.exports = {
    productDetails,
  }