const User = require("../models/userSchema");

const userAuth = (req,res,next)=>{
    if (!req.session.user) {
        console.log("Unauthorized access attempt. Redirecting to home.");
        return res.redirect("/");
    }

    next(); // Allow the request to proceed
}



    module.exports = userAuth
    