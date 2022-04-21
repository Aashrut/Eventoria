const express = require("express");
const router = express.Router();
const Organizer = require("../models/Organizer");
const {passwordHash, comparePasswords} = require("../helpers/auth");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy( {passReqToCallback: true},
    (req, username, password, done) => {
        Organizer.findOne({username: username.toLowerCase()}, async (err, organizer) => {
            if (err) {
                console.log(err);
                return done(err);
            }

            if (!organizer) {
                console.log(`User with username: ${username} does not exist`);
                return done(null, false, { message: `User with username: ${username} does not exist` });
            }
            
            if (!(await comparePasswords(password, organizer.password))) {
                console.log("Invalid Password");
                return done(null, false, { message: `Incorrect Username/Password provided` });
            }
            
            console.log(organizer);
            req.session.type = 'organizer';
            console.log(req.session);
            
            return done(null, organizer);
        });
    }
));

passport.serializeUser((organizer, done) => {
    done(null, organizer._id);
});
  
passport.deserializeUser( (_id, done) => {
    Organizer.findById(_id, (err, organizer) => {
        if (err) return done(err);
        done(null, organizer);
    });
});

router.get("/", (req, res, next) => {
    res.redirect("/organizer/signup");
});

router.get("/signup", (req, res, next) => {
    if (req.isUnauthenticated()) {
        res.render("pages/signup", {submit: "/organizer/signup"});
    }
    else {
        res.redirect("/organizer/dashboard");
    }
})

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
    if (req.isUnauthenticated()) {
        res.render("pages/login", {submit: "/organizer/login"});
    }
    else {
        res.redirect("/organizer/dashboard");
    }
})

router.post("/login",
    passport.authenticate("local",{
        successRedirect: "/organizer/dashboard",
    })
);

router.all("/logout", (req, res, next) => {
    req.logout();
    res.redirect("/organizer/login");
});

router.get("/dashboard", (req, res, next) => {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        res.render("pages/dashboard");
    }
    else {
        res.redirect("/organizer/login");
    }
});

module.exports = router;