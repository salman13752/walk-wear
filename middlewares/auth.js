const User = require("../models/userSchema");

const userAuth = (req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data&& !data.isBlocked){
                next()
            }else{
                res.redirect("/login")
            }
        })
        .catch(err=>{
            console.log('Error in user auth',err)
            res.redirect("/login")
        })
    }
}


const adminAuth = async (req, res, next) => {
    try {
        // Check if admin session exists
        if (!req.session.admin) {
            return res.redirect("/admin/login");
        }

        // Find admin user in the database
        const adminUser = await User.findOne({ isAdmin: true });
       
        if (adminUser) {
            next(); // Allow the request to proceed
        } else {
            res.redirect("/admin/login"); // Redirect if no admin is found
        }
    } catch (err) {
        console.error('Error in admin auth:', err);
        res.redirect("/admin/login"); // Redirect in case of error
    }
};



  

    module.exports = {userAuth,adminAuth}   