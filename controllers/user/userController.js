
const nodemailer = require('nodemailer'); // for sending emails
require('dotenv').config(); // to load environment variables
const bcrypt = require('bcrypt'); // For hashing passwords
const User = require('../../models/userSchema'); // User model for MongoDB
const session = require('express-session'); // For managing user sessions
const Product = require('../../models/productSchema'); // Product model for MongoDB
const Category = require('../../models/categorySchema'); // Category model for MongoDB
const Address = require("../../models/addressSchema")
const Order = require("../../models/orderScheema")
const cloudinary = require("../../config/cloudinary");


// Page Not Found Handler
const pageNotFound = async (req, res) => {
    try {
        res.render('page-404'); 
    } catch (error) {
        console.log("Eroor in page not found",error);
         
    }
};

// load home Page
const loadHomepage = async (req, res) => {
    try {
        const user = req.session.user;
        
        const CategoryData = await Category.find({isListed:true})
        const ProductData = await Product.find({
            isBlocked: false,
        }).populate("brand")
         .sort({ createdAt: -1 })
         

       
        if(user){
          const userData = await User.findOne({_id:user})
        res.render("home",{user:userData,product:ProductData})
        }else{
          return  res.render("home",{product:ProductData})
        }
       
    } catch (error) {
        console.log('Home Page not found',error);
        res.status(500).send('Server Error');
    }
};


//function to render registeration page
const loadRegisterPage = async (req, res) => {
    try {
      return res.render("signUpPage");
    } catch (error) {
      console.log("Error at home page");
      res.status(500).send("server error occured");
    }
  };
  
 //function to generate otp
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  


//function to send email
async function sendVerificationEmail(email, otp) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });
  
      const info = await transporter.sendMail({
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "Verify your account",
        text: `Your otp is ${otp}`,
        html: `<b> Your otp is ${otp}</b>`,
      });
  
      return info.accepted.length > 0;
    } catch (error) {
      console.log("error sending email", error);
      return false;
    }
  }
  




  const signup = async (req, res) => {
    try {
      const { name, phone, password } = req.body;
      const email = req.body.email.trim().toLowerCase();
      const findUser = await User.findOne({ email: email });
      if (findUser) {
        return res.render("signUpPage", { message: "user already exists" });
      }
  
      const otp = generateOtp();
  
      const emailSent = sendVerificationEmail(email, otp);
  
      if (!emailSent) {
        return res.render("signUpPage", { message: "Unable to sent email" });
      }
      req.session.userOtp = otp;
      req.session.userData = { email, password, name, phone };
  
      res.render("verifyOtp");
      console.log("otp send", otp);
    } catch (error) {
      console.error("error in save usr", error);
      res.status(500).redirect("/page-not-found");
    }
  };



//function to secure password
const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log("error at securing password", error);
      return false;
    }
  };



  //function to do verify otp
const verifyOtp = async (req, res) => {
    try {
      const { otp } = req.body;
  
      console.log("otp", otp);
  
      
      if (otp === req.session.userOtp) {
        const user = req.session.userData;
        const passwordHash = await securePassword(user.password);
  
        const saveUserData = new User({
          name: user.name,
          phone: user.phone,
          email: user.email,
          password: passwordHash,
        });
        await saveUserData.save();
  
        req.session.user = saveUserData._id;
        res.json({ success: true, redirectUrl: "/" });
      } else {
        res.status(400).json({ success: false, message: "Please try again" });
      }
    } catch (error) {
      console.error("error verifying otp", error);
      res.status(400).json({ success: false, message: "an error try again" });
    }
  };
  


  const resendOtp = async (req, res) => {
    try {
      const { email } = req.session.userData;
      if (!email) {
        return res
          .status(400)
          .status({ success: false, message: "email not found " });
      }
  
      const otp = generateOtp();
      req.session.userOtp = otp;
  
      const emailSent = await sendVerificationEmail(email, otp);
  
      if (emailSent) {
        console.log("resend email send ", otp);
        res.status(200).json({ success: true, message: "otp send successfully" });
      } else {
        res.status(500).json({ success: false, message: "Otp failed to send" });
      }
    } catch (error) {
      console.log("Error at resend otp", error);
      res.status(500).json({ success: false, message: "Internal server error " });
    }
  };


  const loadLogin = async (req, res) => {
    try {
      if (!req.session.user) {
        return res.render("login");
      } else {
        res.redirect("/");
      }
    } catch (error) {
      console.log("error at server page");
      res.status(500).send("server error occured");
    }
  };



  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const findUser = await User.findOne({ isAdmin: 0, email: email });
      if (!findUser) {
        return res.render("login", { message: "user not found" });
      }
      if (findUser.isBlocked) {
        return res.render("login", {
          message: "user is blocked by admin",
        });
      }
  
      const passwordMatch = await bcrypt.compare(password, findUser.password);
      if (!passwordMatch) {
        return res.render("login", { message: "incorrect password" });
      }
  
      req.session.user = findUser._id;
  
      res.redirect("/");
    } catch (error) {
      console.log("error at login page", error);  
      res.render("login", {
        message: "Login failed , please try again later",
      });
    }
  };


  //for logout
const logout = async (req, res) => {
    try {
      req.session.user = null;
      req.session.save((err) => {
        if (err) {
          console.log("Error saving session:", err);
          return res.redirect("/page-not-found");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.log("Error at logout:", error);
      res.redirect("/page-not-found");
    }
  };


   

  const showUserProfile = async (req, res) => {
    try {
        // Fetch user details
        const id = req.params.id; 
        const user = await User.findById(id);
        const AddressData = await Address.findOne({userId:user._id})
        const orders = await Order.find({});
        console.log(orders,"oders on show profile");
                
        if (!user) {
            return res.status(404).send('User not found');
        }

        
        

        res.render('user-profile', {
           user,
           orders,
          addressData:AddressData,
          })
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading profile');
    }
};

// Render the Edit Profile page
const editProfile = async (req, res) => {
  const id = req.params.id; 
  const user = await User.findById(id);

  if (!user) {
   return res.status(404).send('User not found');
  }

  res.render('edit-profile', { user });
};


  
const updateProfile = async (req, res) => {
  console.log(req.body); // Log text fields
  console.log(req.file); // Log uploaded file details

  const { name, phone } = req.body;
  const id = req.params.id;

  try {
    let profileImageUrl = null;

    // Check if a file is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_images",
      });

      profileImageUrl = result.secure_url;
    }

    if (!id) {
      return res.status(404).send("User not found");
    }

    const updateField = {
      name,
      phone,
    };

    if (profileImageUrl) {
      updateField.profileImage = profileImageUrl;
    }

    await User.updateOne({ _id: id }, { $set: updateField });

    res.redirect("/"); // After updating, redirect to the profile page
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
};


const addAddress = async(req,res)=>{
  try {
    const user = req.session.user
    
    
    res.render("addAddress",{user:user})
  } catch (error) {
    console.log("error",error);
    
  }
}


const postAddAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const userData = await User.findOne({ _id:userId });
    const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body;

    const userAddress = await Address.findOne({ userId: userData._id });
    
    if (!userAddress) {
      const newAddress = new Address({
        userId: userData._id,
        address: [{ addressType, name, city, landMark, state, pincode, phone, altPhone }]
      });
      await newAddress.save();
    } else {
      userAddress.address.push({ addressType, name, city, landMark, state, pincode, phone, altPhone });
      await userAddress.save();

    }

   

    res.redirect(`/profile/${userId}`)
  } catch (error) {
    console.log("Error in saving address",error);
    
  }
};


const editAddress = async (req, res) => {
  try {

    const addressId = req.query.id;
    const user = req.session.user;

    
    

    const currAddress = await Address.findOne({
      "address._id": addressId,
    });

    if (!currAddress) {
      return res.redirect("/page-not-found")
    }

    const addressData = currAddress.address.find((item) => {
      return item.id.toString() === addressId.toString();
    })

    if (!addressData) {
      return res.redirect("/page-not-found")
    }

    res.render("edit-address", { address: addressData, user: user })

  } catch (error) {
    res.redirect("/page-not-found")
console.log("Eroor in edit adress",error);
  }
}

const postEditAddress = async (req, res) => {
  try {
    const data = req.body;
    const addressId = req.query.id;
    const userId = req.session.user; // Get user ID from session

    // Find the address
    const findAddress = await Address.findOne({ "address._id": addressId });

    if (!findAddress || !findAddress.address) {
      return res.status(401).json({ success: false, message: "Address update failed. Address not found." });
    }

    // Update the address
    await Address.updateOne(
      { "address._id": addressId },
      {
        $set: {
          "address.$": {
            _id: addressId,
            addressType: data.addressType,
            name: data.name,
            city: data.city,
            landMark: data.landMark,
            state: data.state,
            pincode: data.pincode,
            phone: data.phone,
            altPhone: data.altPhone,
          }
        }
      }
    );

    res.status(200).json({ success: true, message: "Address updated successfully!", userId });

  } catch (error) {
    console.error("Error in addressEdit page:", error);
    res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};


const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const addressId = req.query.id;
    const findAddress = await Address.findOne({ "address._id": addressId });
   
    if (!findAddress) {
      return res.status(404).send("Address not found")
    }

    await Address.updateOne(
      { "address._id": addressId },
      {
        $pull: {
          address: {
            _id: addressId,
          }
        }
      }
    )
    
    
    res.redirect(`/profile/${userId}`)

  } catch (error) {
    console.log("Error in delete address",error);
    res.redirect("/page-not-found")
    

  }
}

const getAddress = async(req,res)=>{
try {
  const userId = req.session.user;
  const userData = await User.findOne({ _id:userId });
  const AddressData = await Address.findOne({userId:userId})
  
  res.render("addressPage",{
    addressData:AddressData,
    user:userData,
  })
} catch (error) {
  console.log(error);
  
}

}
 

const loadOrder = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send("User not found");
    }
    const orders = await Order.find({ userId: userId });
    res.render("ordersPage", {
      orders,
      user,
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    res.status(500).send("Internal Server Error");
  }
};





module.exports = {
    pageNotFound,
    loadHomepage,
    loadRegisterPage,
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    login,
    logout,
    showUserProfile,
    editProfile,
    updateProfile,
    addAddress,
    postAddAddress,
    editAddress,
    postEditAddress,
    deleteAddress,
    getAddress,
    loadOrder
};
