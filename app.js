const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const user = require("./routes/user");

const PORT = process.env.PORT || 4001

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/user", user);

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
})