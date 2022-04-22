const express = require("express");
const router = express.Router();
const Organizer = require("../models/Organizer");
const {passwordHash, comparePasswords} = require("../helpers/auth");

router.get("/", (req, res, next) => {
    res.redirect("/organizer/signup");
});

router.get("/signup", (req, res, next) => {
    if (!req.session.isAuthenticated) {
        res.render("pages/signup", {submit: "/organizer/signup"});
    }
    else if (req.session.isAuthenticated && req.session.userType == 'user') {
        res.redirect("/user/dashboard");
    }
    else if ((req.session.isAuthenticated && req.session.userType == 'organizer')) {
        res.redirect("/organizer/dashboard");
    }
    else {
        req.session.destroy();
        res.redirect("/");
    }
});

router.post("/signup", async (req, res, next) => {
    console.log(req.body);
    const hashedPassword = await passwordHash(req.body.password, 10);
    const organizer = new Organizer({
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: hashedPassword,
        regDate: new Date(),
        type: 'organizer'
    });

    const usernameExists = await Organizer.findOne({username: req.body.username.toLowerCase()});

    const emailExists = await Organizer.findOne({email: req.body.email.toLowerCase()});

    if (usernameExists) {
        console.log("User with this Username already exists!");
        return res.redirect("/organizer/signup");
    }
    if (emailExists) {
        console.log("User with this Email already exists!");
        return res.redirect("/organizer/signup");
    }

    organizer.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/organizer/login');
    })
});

router.get("/login", (req, res, next) => {
    if (!req.session.isAuthenticated) {
        res.render("pages/login", {submit: "/organizer/login"});
    }
    else if (req.session.isAuthenticated && req.session.userType == 'user') {
        res.redirect("/user/dashboard");
    }
    else if ((req.session.isAuthenticated && req.session.userType == 'organizer')) {
        res.redirect("/organizer/dashboard");
    }
    else {
        req.session.destroy();
        res.redirect("/");
    }
});

router.post("/login", (req, res, next) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    Organizer.findOne({username: username}, async (err, organizer) => {
        if (err) {
            console.log(err);
            return res.redirect("/organizer/login");
        }

        if (!organizer) {
            console.log({ message: `User with username: ${username} does not exist` });
            return res.redirect("/organizer/login");
        }

        if (!(await comparePasswords(password, organizer.password))) {
            console.log({ message: `Incorrect Username/Password provided` });
            return res.redirect("/organizer/login");
        }

        req.session.userType = 'organizer';
        req.session.username = username;
        req.session.isAuthenticated = true;
        res.redirect("/organizer/dashboard");
    });
});

router.all("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/organizer/login");
});

router.get("/dashboard", (req, res, next) => {
    if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        res.render("pages/dashboard");
    }
    else if (req.session.isAuthenticated && req.session.userType == 'user'){
        console.log("Invalid Authorization! You are not an Organizer!");
        res.redirect("/user/dashboard");
    }
    else if (!req.session.isAuthenticated) {
        res.redirect("/organizer/signup");
    }
    else {
        req.session.destroy();
        res.redirect("/");
    }
});

module.exports = router;