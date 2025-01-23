const brand = require("../../models/brandSchema");
const product = require("../../models/productSchema");
const cloudinary = require("../../config/cloudinary");

const getBrandPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;
    const brandData = await brand
      .find({})
      .sort({ createdAt: -1 })
      

    const totalBrands = await brand.countDocuments();


    res.render("brandPage", {
      brands: brandData,
      totalBrands: totalBrands,
    });
  } catch (error) {
    console.log("error at brandpage", error);
    return res.redirect("/page-not-found");
  }
};


const addBrand = async (req, res) => {
  try {
    const brandName = req.body.name.toLowerCase().trim();
    const brands = await brand.find();

    // Check if the brand already exists
    const findBrand = await brand.findOne({ brandName: new RegExp(`^${brandName}$`, "i") });
    if (findBrand) {
      console.log("Brand already exists");
      return res.render("brandPage", {
        brands,
        errorMessage: "Brand already exists",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      quality: "100",
    });

    // Create and save new brand
    const newBrand = new brand({
      brandName: brandName, // Store in lowercase
      brandImage: result.secure_url,
    });
    await newBrand.save();

    // Redirect after successful save
    res.redirect("/admin/brands");
  } catch (error) {
    console.log("Error occurred while adding brand", error);
    res.redirect("/page-not-found");
  }
};





//for doing  delete
const blockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    await brand.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/brands");
  } catch (error) {}
};



const deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    await brand.findByIdAndDelete(brandId);
    res.redirect("/admin/brands");
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).send("Error deleting brand");
  }
};


module.exports = {
  getBrandPage,
  addBrand,
  blockBrand,
  deleteBrand
};