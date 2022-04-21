const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {passwordHash, comparePasswords} = require("../helpers/auth");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy( {passReqToCallback: true},
    (req, username, password, done) => {
        User.findOne({username: username.toLowerCase()}, async (err, user) => {
            if (err) {
                console.log(err);
                return done(err);
            }

            if (!user) {
                console.log(`User with username: ${username} does not exist`);
                return done(null, false, { message: `User with username: ${username} does not exist` });
            }

            if (!(await comparePasswords(password, user.password))) {
                console.log("Invalid Password");
                return done(null, false, { message: `Incorrect Username/Password provided` });
            }
            
            console.log(user);
            req.session.type = 'user';
            console.log(req.session);
            
            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});
  
passport.deserializeUser( (_id, done) => {
    User.findById(_id, (err, user) => {
        if (err) return done(err);
        done(null, user);
    });
});

router.get("/", (req, res, next) => {
    res.redirect("/user/signup");
});

router.get("/signup", (req, res, next) => {
    if (req.isUnauthenticated()) {
        res.render("pages/signup", {submit: "/user/signup"});
    }
    else {
        res.redirect("/user/dashboard");
    }
})

router.post("/signup", async (req, res, next) => {
    console.log(req.body);
    const hashedPassword = await passwordHash(req.body.password, 10);
    const user = new User({
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: hashedPassword,
        regDate: new Date(),
        type: 'user'
    });

    const usernameExists = await User.findOne({username: req.body.username.toLowerCase()});

    const emailExists = await User.findOne({email: req.body.email.toLowerCase()});

    if (usernameExists) {
        console.log("User with this Username already exists!");
        return res.redirect("/user/signup");
    }
    if (emailExists) {
        console.log("User with this Email already exists!");
        return res.redirect("/user/signup");
    }

    user.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/user/login');
    })
});

router.get("/login", (req, res, next) => {
    if (req.isUnauthenticated()) {
        res.render("pages/login", {submit: "/user/login"});
    }
    else {
        res.redirect("/user/dashboard");
    }
});

router.post("/login",
    passport.authenticate("local",{
        successRedirect: "/user/dashboard",
    })
);

router.all("/logout", (req, res, next) => {
    req.logout();
    res.redirect("/user/login");
});

router.get("/dashboard", (req, res, next) => {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        res.render("pages/dashboard")
    }
    else {
        res.redirect("/user/login");
    }
});

module.exports = router;