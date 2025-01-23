const Category = require('../../models/categorySchema');

//function to display category details
const categoryInfo = async (req, res) => {
    try {
      const categoryData = await Category.find()
        .sort({ createdAt: 1 })
  
      res.render("category", {
        cat: categoryData,
       
      });
    } catch (error) {
      console.log("errpr at category info,", error);
      res.redirect("/page-not-found");
    }
  };



  //function to add category
// const addCategory = async (req, res) => {
//     const { name, description } = req.body;
//     try {
//       const existingCategory = await Category.findOne({ name });
//       if (existingCategory) {
//         return res.status(400).json({ error: "Category already exists" });
//       }
  
//       const newCategory = new Category({
//         name,
//         description,
//       });
//       await newCategory.save();
//       return res.json({ message: "Category added successfully" });
//     } catch (error) {
//       console.log("error at add category,", error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   };




const addCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    // Check for existing category (case insensitive)
       const existingCategory = await Category.findOne({
      $and: [
        { isListed: true },
        { name: { $regex: `^${name}$`, $options: 'i' } } // Case insensitive check
      ]
    });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const newCategory = new Category({
      name,
      description,
      
    });
    await newCategory.save();
    return res.json({ message: "Category added successfully" });
  } catch (error) {
    console.log("error at add category,", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};





//function to delete category
const deleteCategory = async (req, res) => {
    const id = req.query.id;
    try {
      await Category.updateOne({ _id: id }, { $set: { isListed: false } });
      return res.status(200).json({ response: "category deleted successfully" });
    } catch (error) {
      console.log("error at delete category,", error);
      return res.redirect("/page-not-found");
    }
  };


//function to get edit category page
const geteditCategory = async (req, res) => {
    const id = req.query.id;
    try {
      const category = await Category.findOne({ _id: id });
      res.render("editCategory", {
        category,
      });
    } catch (error) {
      console.log("error at edit category,", error);
      res.redirect("/page-not-found");
    }
  };


  //function to update category
const editCategory = async (req, res) => {
    try {
      const id = req.params.id;
  
      const { categoryname, description } = req.body;
      const existingCategory = await Category.findOne({ name: categoryname });
      if (existingCategory) {
        return res.status(400).json({ error: "Category already exists" });
      }
      const updateCategory = await Category.findByIdAndUpdate(
        id,
        {
          name: categoryname,
          description: description,
        },
        { new: true }
      ); //we get return of updated data
      if (updateCategory) {
        res.status(200).json({ response: "updated successfully" });
      } else {
        res.status(400).json({ error: "Category not updated" });
      }
    } catch (error) {
      console.log(error, "error at edit category");
      res.status(500).json({ error: "Internal server error" });
    }
  };

// //for blocking user
const catBlocked= async (req, res) => {
  try {
    let id = req.query.id;
    const result = await Category.updateOne(
      { _id: id },
      { $set: { isListed: false } }
    );
    return res.json({ response: "user blocked successfully" });
  } catch (error) {
    console.log(("error at blocking user", error));
    res.status(500).json({ response: "an error try again" });
  }
};

// //for unblocking user
const catUnblocked = async (req, res) => {
  try {
    let id = req.query.id;
    await Category.updateOne({ _id: id }, { $set: { isListed: true } });
    return res.json({ response: "user unblocked successfully" });
  } catch (error) {
    console.log("error at unblocking user", error);
    res.status(500).json({ response: "an error try again" });
  }
};


  module.exports = {
    categoryInfo,
    addCategory,
    deleteCategory,
    geteditCategory,
    editCategory,
    catBlocked,
    catUnblocked
  };