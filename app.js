//**setting up all dependencies****
var express = require("express");

var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var config = require('./models/oauth');

var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var Trip = require("./models/trip");
var methodOverride = require("method-override");
var authRoutes = require("./routes/authRoute");
var tripRoutes = require("./routes/tripsRoute");
var userRoutes = require("./routes/usersRoute");



var connectedToDatabase

//Sam: I've added a callback function so the server doesn't crashs
//when the database is not running.
mongoose.connect("mongodb://localhost/hitchDB", function(err){
    if(err){
        console.log("Warning: Not connected to database");
        connectedToDatabase = false;
        return;
    }else{
    connectedToDatabase = true;
   
    }
});

console.log("connected variable =  " + connectedToDatabase);


//*********ALL the express configurations**************
var app = express();
    app.set("view engine", "ejs");
    app.use(bodyParser.urlencoded({extended: true})); //used any time we use a form and post data to a request
    app.use(require("express-session")({
        secret: "Nate likes to recycle",   //this is what we will use to encode/decode pages
        resave: false,
        saveUninitialized: false
    }));
    app.use(express.static("public"));
    

//*********Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.***********
app.use(methodOverride("_method"));

//we need these two lines any time we use passport
app.use(passport.initialize());
app.use(passport.session());

//************Everything Facebook Authentication****************
// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});




// config
// passport.use(new FacebookStrategy({
//     clientID: config.facebook.clientID,
//   clientSecret: config.facebook.clientSecret,
//     callbackURL: "http://localhost:3000/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));


//**********This is home made user authentication
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());  //encodes
passport.deserializeUser(User.deserializeUser());   //decodes
//*****************


//This allows the currently logged in user's information to influence the behavior
//the server or the web pages.
app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
});

app.use(authRoutes);
app.use(userRoutes);
app.use(tripRoutes);




app.get("/sayHello", function(req, res) {
    res.render("email.ejs");
})

//**** Any other Users **** necessary?
app.get("*", function(req,res){
    res.send("No page found");
});

//******** Any other Routes *******
app.get("*", function(req,res){
    res.send("No page found");
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started!!");
});
