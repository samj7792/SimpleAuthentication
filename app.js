const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const { check, validationResult} = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongo = require("mongodb");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/loginapp");
const db = mongoose.connection;

const routes = require("./routes/index");
const users = require("./routes/users");

// Init App
const app = express();

// View Engine
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs({defaultLayout:"layout"}));
app.set("view engine", "handlebars");

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ exteded: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Express Session
app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.post('/user', [
    // username must be an email
    check('username').isEmail(),
    // password must be at least 5 chars long
    check('password').isLength({ min: 5 })
], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
    User.create({
      username: req.body.username,
      password: req.body.password
    }).then(user => res.json(user));
});

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

app.use("/", routes);
app.use("/users", users);

// Set Port
app.set("port", (process.env.PORT || 3000));

app.listen(app.get("port"), function() {
    console.log("Server started on port " + app.get("port"));
});