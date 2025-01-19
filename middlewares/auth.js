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


    const adminAuth = (req,res,next)=>{ 

        User.findOne({isAdmin:true})
        .then(data=>{
            if(data){
                next()
            }else{
                res.redirect("/admin/login")
            }
        })
        .catch(err=>{
            console.log('Error in admin auth')
            res.redirect("/admin/login")
        })
    }


  

    module.exports = {userAuth,adminAuth}   