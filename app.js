const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const userRouter = require("./routes/user");
const organizerRouter = require("./routes/organizer");
const logger = require("morgan");

const PORT = process.env.PORT || 4001

const app = express();

app.use(logger('dev'));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false
    },
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/user", userRouter);
app.use("/organizer", organizerRouter);

app.get("/", (req, res, next) => {
    res.render("pages/index");
})

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});