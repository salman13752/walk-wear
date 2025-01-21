const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");
const session = require("express-session")

const productDetails = async (req, res) => {
    try {
      const user = req.session.user; 
      console.log(user)
      
      const {productId} = req.params; 
     
      // Fetch the product details by its ID
      const productData = await Product.findOne({ _id: productId });
  
      if (!productData) {
        return res.status(404).send('Product not found');
      }
  
     
    res.render('product_Details',{
        user: user, 
        product: productData,
    });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send('An error occurred while fetching product details');
    }
  };


const loadComboDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, comboId } = req.query;
    console.log("Requested comboId:", comboId);
    console.log("Requested size:", size);

    const product = await Product.findById(id);
    console.log("Product combos:", product.combos);

    const selectedCombo = product.combos.find(
      (combo) => combo.Size === size && combo._id.toString() === comboId
    );
    console.log("Selected combo:", selectedCombo);

    if (!selectedCombo) {
      return res
        .status(404)
        .json({ success: false, message: "Combo not found" });
    }

    return res.json({
      success: true,
      combo: {
        salePrice: selectedCombo.salePrice,
        regularPrice: selectedCombo.regularPrice,
        quantity: selectedCombo.quantity,
        combosId: selectedCombo._id,
      },
    });
  } catch (error) {
    console.error("Error loading combo details:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
    

  
  module.exports = {
    productDetails,
    loadComboDetails,
  }