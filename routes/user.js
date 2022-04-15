const express = require("express");
const { append } = require("express/lib/response");
const router = express.Router();
const User = require("../models/User")

router.get("/", (req, res, next) => {
    res.redirect("/user/signup");
});

router.get("/signup", (req, res, next) => {
    res.sendFile("/public/signup.html",  {root: "/Eventoria"});
})

router.post("/signup", (req, res, next) => {
    console.log(req.body);
    const user = new User({
        fname: req.body.fname,
        lname: req.body.lname,
        uname: req.body.uname,
        email: req.body.email,
        password: req.body.passwd,
        regDate: new Date()
    });
    user.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/user/login');
    })
});

router.get("/login", (req, res, next) => {
    res.sendFile("/public/login.html", {root: "/Eventoria"});
})

router.post("/login", (req, res, next) => {

});

module.exports = router;