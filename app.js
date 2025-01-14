const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const env = require("dotenv").config();
const db = require("./config/db");
const passport = require("passport");
require("./config/passport");
const userSide = require("./routes/user/userRouter");    
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//configuring session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, //use true while production
      httpOnly: true,
      maxAge: 72 * 60 * 1000, //72 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());








app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "/views/user"),
  path.join(__dirname, "/views/admin"),
]);


//setting up user routee
app.use("/", userSide);

app.listen(process.env.PORT, () => {
  console.log("server running on 3005"); 
});  