const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");
const session = require("express-session")



const productDetails = async (req, res) => {
  try {
    const user = req.session.user;
    const { productId } = req.params;

    // Fetch the product details by its ID
    const productData = await Product.findOne({ _id: productId });

    if (!productData) {
      return res.status(404).send('Product not found');
    }

    // Fetch related products 
    const relatedProducts = await Product.find({ category: productData.category, _id: { $ne: productId } }).limit(5);

    res.render('product_Details', {
      user: user,
      product: productData,
      relatedProducts: relatedProducts,
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
  

    const product = await Product.findById(id);
   

    const selectedCombo = product.combos.find(
      (combo) => combo.Size === size && combo._id.toString() === comboId
    );
    

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