const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const cloudinary = require("../../config/cloudinary");


const getProductInfo = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });
    res.render("addProduct", {
      cat: category,
      brand: brand,
    });
  } catch (error) {}
};

//to add product
const addProducts = async (req, res) => {
  try {
    const { productName, brand, description, category, combos } = req.body;

    // Check if the product already exists
    const ProductExists = await Product.findOne({ productName });
    if (ProductExists) {
      return res
        .status(400)
        .send("Product already exists, try another product");
    }

    // Upload images to Cloudinary
    const imageUrl = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          quality: "100",
        });
        imageUrl.push(result.secure_url); // Push the URL to the array
      }
    }

    // Initialize combosArray
    let combosArray = [];

    // Parse combos if provided
    if (combos) {
     
      combosArray = JSON.parse(combos);
      combosArray.forEach((combo) => {
        if (combo.Colour && typeof combo.Colour === "string") {
          combo.Colour = combo.Colour.split(",").map((c) => c.trim()).join(", "); 
          // Convert the array back into a comma-separated string
        }
      });
      
    }
   

    // Find category by name
    const categoryId = await Category.findOne({ name: category });
    if (!categoryId) {
      return res.status(400).send("Category not found");
    }
    const brandId = await Brand.findOne({ brandName: brand });
    console.log("here", brandId);
    // Create and save the new product
    const newProduct = new Product({
      productName,
      description,
      brand: brandId._id,
      category: categoryId._id, // Store category ID
      combos: combosArray,
      productImage: imageUrl,
      status: "Available",
    });

    await newProduct.save();
    return res.status(200).json({ message: "Product added successfully!" });
  } catch (error) {
    console.error("Error saving product:", error);
    return res.status(500).redirect("/page-not-found");
  }
};


//for all products listing
const getAllProducts = async (req, res) => {
  try {
    let search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 4;

    const productData = await Product.find({
      isBlocked: false,
      productName: { $regex: new RegExp(".*" + search + ".*", "i") },
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("category")
      .populate("brand");

    const count = await Product.find({
      productName: { $regex: new RegExp(".*" + search + ".*", "i") },
    }).countDocuments();

    const categories = await Category.find({ isListed: true });
    const brands = await Brand.find({ isBlocked: false });

    if (categories && brands) {
      res.render("products", {
        productData,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        categories,
        brands,
      });
    } else {
      res.redirect("/page-not-found");
    }
  } catch (error) {
    console.error("Error at getting products:", error);
    res.status(500).send("Server Error");
  }
};

//for deleting products
const deleteProducts = async (req, res) => {
  try {
    const id = req.query.id;
   
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: { isBlocked: true } },
      { new: true }
    );

    if (updatedProduct) {
      res.status(200).json({ response: "Product deleted successfully" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.log("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//for editing products
const getEditProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id)
      .populate("brand")
      .populate("category");
    const category = await Category.find({});
    const brand = await Brand.find({});
    res.render("editProducts", {
      product: product,
      cat: category,
      brand: brand,
    });
  } catch (error) {
    console.log("Error found in the loading Edit Product side: ", error);
    res.redirect("/page-not-found");
  }
};

const editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    // const product = await Product.findOne({ _id: id });
    const data = req.body;

    const existingProduct = await Product.findOne({
      productName: data.productName,
      _id: { $ne: id },
    });

    if (existingProduct) {
      return res.status(400).json({
        error:
          "Product with this name already exists! Please try again with another name",
      });
    }

    const images = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          quailty: "100",
        });

        images.push(result.secure_url);
      }
    }

    
    let combosArray = [];
    if (typeof data.combos === "string") {
      combosArray = JSON.parse(data.combos); // Convert the string to an array of objects
    } else if (Array.isArray(data.combos)) {
      combosArray = data.combos; 
    }

    const brand = await Brand.findOne({ brandName: data.brand });
    const category = await Category.findOne({ name: data.category });

    const updateFields = {
      productName: data.productName,
      description: data.description,
      brand: brand._id,
      category: category._id,
      combos: combosArray,
    };

    if (req.files.length > 0) {
      updateFields.$push = { productImage: { $each: images } };
    }

    await Product.findByIdAndUpdate(id, updateFields, { new: true });
    console.log("Product edited successfully!");
    res.status(200).json({ message: "Product edited successfully!" });
  } catch (error) {
    console.log("Error found in Edit Product side: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

//for deleting images
const deleteSingleImage = async (req, res) => {
  try {
    let { imagePublicId, productId } = req.body;

    console.log("Original imagePublicId:", imagePublicId);
    let imageId;
    // code to get public id from  url
    if (imagePublicId.startsWith("http")) {
      const parts = imagePublicId.split("/");
      const fileName = parts[parts.length - 1];
      imageId = fileName.split(".")[0];
    }

    console.log("Extracted public_id:", imageId);

    // deletind the image from Cloudinary
    const result = await cloudinary.uploader.destroy(imageId);
    console.log("result", result);
    if (result.result !== "ok") {
      console.error("Error deleting image from Cloudinary:", result);
      return res.status(500).send({
        status: false,
        message: "Failed to delete image from Cloudinary",
        error: result,
      });
    }

    console.log(`Image ${imagePublicId} deleted from Cloudinary successfully.`);

    const product = await Product.findByIdAndUpdate(
      productId,
      { $pull: { productImage: imagePublicId } },
      { new: true }
    );
    console.log("product", product);
    if (!product) {
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });
    }

    // Step 3: Respond with success
    res.send({ status: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSingleImage:", error.message);
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
module.exports = {
  getProductInfo,
  addProducts,
  getAllProducts,
  deleteProducts,
  getEditProducts,
  editProduct,
  deleteSingleImage,
};