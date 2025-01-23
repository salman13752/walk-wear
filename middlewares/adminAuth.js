const adminAuth = (req, res, next) => {
    if (!req.session.admin) {
        console.log("Unauthorized access attempt. Redirecting to login.");
        return res.redirect("/admin/login");
    }

    next(); // Allow the request to proceed
};


module.exports = adminAuth;