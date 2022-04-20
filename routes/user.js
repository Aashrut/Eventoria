const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {passwordHash, comparePassword} = require("../helpers/auth");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy(
    (username, password, done) => {
        User.findOne({uname: username}, (err, user) => {
            if (err) return done(err);

            if (!user) return done(null, false, { message: `User with username: ${username} does not exist` });

            if (!comparePassword(password, user.password)) {
                console.log("Invalid Password");
                return done(null, false, { message: `Incorrect Username/Password provided` });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});
  
passport.deserializeUser( (id, done) => {
    User.findById(id, (err, user) => {
        if (err) return done(err);
        done(null, user);
    });
});

const loggedInOnly = (req, res, next) => {
    if (req.isAuthenticated) return next();
    else res.redirect("/user/login");
};
  
const loggedOutOnly = (req, res, next) => {
    if (!req.isAuthenticated) return next();
    else res.redirect("/user/dashboard");
};

router.get("/", (req, res, next) => {
    res.redirect("/user/signup");
});

router.get("/signup", loggedOutOnly , (req, res, next) => {
    res.sendFile("/public/signup.html",  {root: "/Eventoria"});
})

router.post("/signup", async (req, res, next) => {
    console.log(req.body);
    const hashedPassword = await passwordHash(req.body.passwd, 10);
    console.log(hashedPassword);
    const user = new User({
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.uname,
        email: req.body.email,
        password: hashedPassword,
        regDate: new Date()
    });
    user.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/user/login');
    })
});

router.get("/login", loggedOutOnly ,(req, res, next) => {
    res.sendFile("/public/login.html", {root: "/Eventoria"});
})

router.post("/login",
    passport.authenticate("local",{
        successRedirect: "/user/dashboard",
        failureRedirect: "/user/login"
    }),
    (req, res, next) => {
        res.redirect("/user/dashboard");
    }
);

router.all("/logout", (req, res, next) => {
    req.logout();
    res.redirect("/user/login");
})

router.get("/dashboard", loggedInOnly , (req, res, next) => {
    res.sendFile("/public/dashboard.html", {root: "/Eventoria"});
})

module.exports = router;