const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Brand = require("../../models/brandSchema")
const Category = require("../../models/categorySchema")



const loadshop = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });
        const categories = await Category.find({ isListed: true });
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
        const brands = await Brand.find({ isBlocked: false })
        const categoriesWithids = categories.map(category => ({ _id: category._id, name: category.name }))




        res.render("shop", {
            user: userData,
            product: products,
            category: categoriesWithids,
            brand: brands,
            totalproducts: totalProducts, // output 0
            currentPage: page,
            totalPages: totalPages,


        });
    } catch (error) {
        res.redirect("/pageNotFound");
    }
};


const loadShopPage = async (req, res) => {
    try {
        const brand = await Brand.find({ isBlocked: false });
        const category = await Category.find({ isListed: true });
        const selectedCategory = req.query.category || "";
        const selectedBrand = req.query.brand || "";
        const selectedPriceRange = req.query.priceRange || "";
        const selectedSize = req.query.size || "";
        const selectedColor = req.query.color || "";
        const selectedSort = req.query.sort || "";
        const searchQuery = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        const productQuery = {
            isBlocked: false,
            "combos.0": { $exists: true } // Ensure product has at least one combo
        };

        // Apply filters
        if (selectedCategory) {
            productQuery.category = new mongoose.Types.ObjectId(selectedCategory);
        }
        if (selectedBrand) {
            productQuery.brand = new mongoose.Types.ObjectId(selectedBrand);
        }
        if (selectedPriceRange) {
            const [minPrice, maxPrice] = selectedPriceRange.split('-').map(Number);
            productQuery["combos"] = {
                $elemMatch: {
                    salePrice: { $gte: minPrice, $lte: maxPrice }
                }
            };
        }
        if (selectedSize) {
            if (!productQuery.combos) {
                productQuery.combos = { $elemMatch: {} };
            }
            productQuery.combos.$elemMatch.Size = selectedSize;
        }
        if (selectedColor) {
            if (!productQuery.combos) {
                productQuery.combos = { $elemMatch: {} };
            }
            productQuery.combos.$elemMatch.Colour = selectedColor;
        }
        if (searchQuery) {
            productQuery.productName = { $regex: searchQuery, $options: "i" };
        }

        // Create sort options
        let sortOptions = {};
        switch (selectedSort) {
            case 'priceLowToHigh':
                sortOptions = { "combos.0.salePrice": 1 };
                break;
            case 'priceHighToLow':
                sortOptions = { "combos.0.salePrice": -1 };
                break;
            case 'alphabeticalAZ':
                sortOptions = { productName: 1 };
                break;
            case 'alphabeticalZA':
                sortOptions = { productName: -1 };
                break;
            case 'newArrivals':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldArrivals':
                sortOptions = { createdAt: 1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(productQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        // Get products with pagination and sorting
        const products = await Product.find(productQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('brand');

        res.render("shop", {
            product: products,
            category,
            brand,
            selectedCategory,
            selectedBrand,
            selectedPriceRange,
            selectedSize,
            selectedColor,
            selectedSort,
            searchQuery,
            currentPage: page,
            totalPages,
            totalProducts
        });

    } catch (error) {
        console.error("Error in loadShopPage:", error);
        res.redirect("/pageNotFound");
    }
};


const filterProduct = async (req, res) => {
    try {
        const user = req.session.user
        const Category = req.query.category
        const Brand = req.query.brand



        const findCategory = Category ? await Category.findOne({ _id: Category }) : null;
        const findBrand = Brand ? await Brand.findOne({ _id: Brand }) : null;
        const brands = await Brand.find({}).lean()
        const query = {
            isBlocked: false,
            "combos.quantity": { $gt: 0 }
        }

        if (findCategory) {
            query.category = findCategory._id;


        }

        if (findBrand) {
            query.brand = findBrand._id;
        }


        let findProducts = await Product.find(query).lean()
        findProducts.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))



        const categories = await Category.find({ isListed: true })



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
        res.render("shop", {
            user: userData,
            product: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage,
            selectedCategory: Category || null,
            selectedBrand: Brand || null
        })
    } catch (error) {
        console.log(error)
        res.redirect("/pageNotFound")
    }
}






const filterByPrice = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });
        const brands = await Brand.find({}).lean();
        const categories = await Category.find({ isListed: true }).lean();


        let findProducts = await Product.find({
            "combos.salePrice": { $gt: req.query.gt, $lt: req.query.lt },
            isBlocked: false,
            "combos.quantity": { $gt: 0 }
        }).lean();



        findProducts.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

        let itemsPerPage = 6;
        let currentPage = parseInt(req.query.page) || 1;
        let startIndex = (currentPage - 1) * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;
        let totalPages = Math.ceil(findProducts.length / itemsPerPage);
        const currentProduct = findProducts.slice(startIndex, endIndex);

        req.session.filteredProducts = findProducts;

        res.render("shop", {
            user: userData,
            product: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage
        })
    } catch (error) {
        console.log(error)
        res.redirect("/pageNotFound")
    }
};



const searchProducts = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });
        let search = req.body.Search;


        const brands = await Brand.find({}).lean();
        const categories = await Category.find({ isListed: true }).lean();
        const categoryIds = categories.map(category => category._id.toString());
        let searchResult = [];

        if (req.session.filteredProducts && req.session.filteredProducts.length > 0) {
            searchResult = req.session.filteredProducts.filter(product =>
                product.productName.toLowerCase().includes(search.toLowerCase())
            );


        } else {
            searchResult = await Product.find({
                productName: { $regex: ".*" + search + ".*", $options: "i" },
                isBlocked: false,
                "combos.quantity": { $gt: 0 },
                category: { $in: categoryIds }
            });

        }



        searchResult.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
        let itemsPerPage = 6;
        let currentPage = parseInt(req.query.page) || 1;
        let startIndex = (currentPage - 1) * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;
        let totalPages = Math.ceil(searchResult.length / itemsPerPage);
        const currentProduct = searchResult.slice(startIndex, endIndex);

        res.render("shop", {
            user: userData,
            product: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage,
            count: searchResult.length,
        });

    } catch (error) {
        console.log("Error", error);
        res.redirect("/pageNotFound")

    }
};

const sortProduct = async (req, res) => {
    try {
        const sortOption = req.query.sort;
        let sortQuery;
        // Set the sort query based on the sort option
        if (sortOption === 'lowToHigh') {
            sortQuery = { "combos.salePrice": 1 };  // 1 means ascending order
        } else if (sortOption === 'highToLow') {
            sortQuery = { "combos.salePrice": -1 }; // -1 means descending order
        } else {
            sortQuery = {};  // Default: no sorting
        }




        // Fetch sorted products from MongoDB
        const sortedProducts = await Product.find().sort(sortQuery);
        const categories = await Category.find({ isListed: true });

        const brands = await Brand.find({ isBlocked: false })





        // Render the products page with sorted products
        res.render('shop', {
            product: sortedProducts,
            category: categories,
            brand: brands,
            currentPage: 0,
            totalPages: 0,

        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};





module.exports = {
    loadshop,
    filterProduct,
    filterByPrice,
    searchProducts,
    sortProduct,
    loadShopPage
}