var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Trip = require("../models/trip");
var mongoose = require("mongoose");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook");


var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

//********REGISTER ROUTES********

//get requests serve a page when that file is accessed
router.get("/", function(req, res){   
    res.render("hitchhikers.ejs");
});



//********For Facebook*********


router.get('/register/facebook',
  passport.authenticate('facebook'));

router.get('/register/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


passport.use(new FacebookStrategy({
    clientID: '1442992375731712',
    clientSecret: 'cccb69ea0bc9f3e33481eacf1453ac41',
    callbackURL: 'http://localhost:8080/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log("facebook returned" + accessToken);
    User.findOrCreate({ _id: profile.id, email: profile.emails[0].value, username: profile.name.givenName, password: profile.name.givenName }, function (err, user) {
      return cb(err, user);
    });
  }
));


var connectedToDatabase = true;
//****************LANDING*************************
router.post("/", function(req, res) {
    //I've added this switch statement under the assumption that some other form
    //could lated be added to the root page. 
    console.log(req.body.tripPost);
    switch(req.body.what) {
        //Create trip form
        
        case "createTrip":
            //Add trip to database
            //console.log(connectedToDatabase);
            if(connectedToDatabase) {
                console.log("I am in the first if");
                console.log(req.user.username);
                //A user must be logged in
                if(req.user.accountType)
                    if(req.user != undefined) {
                    //All necessary information must be entered
                        if(req.body.origin != undefined &&
                            req.body.destination != undefined &&
                            req.body.date != undefined) {
                        
                        //Add trip to database    
                            Trip.create({
                                driver: req.user.username,
                                origin: req.body.origin,
                                destination: req.body.destination,
                                date: req.body.date
                            }, function(err, trip){
                                if(err) {
                                    console.log("Error: trip creation failed\n"+
                                    "Error message:\n" + err);
                                }
                            });
                        }
                        else
                            console.log("Warning: Invalid create trip request (missing input)");
                    }
                    else
                        console.log("Warning: Invalid create trip request (no user logged in)");
                }
                else
                    console.log("Warning: Attemped to create trip while not connected to database");

            //The remaining possibilities: post request not from form or with invalid formID
            case undefined:
            default: 
        }
    //If no special responce (a.k.a different webpage) was sent at this point,
    //send/resend the main page.
    if(!res.headersSent)
        res.render("hitchhikers.ejs");
});

router.get("/register", function(req, res){
    var error = "";
    res.render("register", {error: error});
});

router.post("/register", function(req, res){
    req.body.username;
    req.body.password;
    

    console.log("Is the email form working");
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'Gmail',
        auth: {
            user: 'hitchhikers428@gmail.com',
            pass: 'Hitchhikers2017'
        }
    }));
    
    // verify connection configuration
    transporter.verify(function(error, success) {
       if (error) {
            console.log(error);
       } else {
            console.log('Server is ready to take our messages');
       }
    });
    
    var text = "Your account has been created";
    
    var mailOptions = {
        from: "hitchhikers428@gmail.com", // sender address
        to: req.body.email, // list of receivers
        subject: "Thanks for Signing Up!", // Subject line
        text: text //, // plaintext body
        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };
   
    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            console.log(err);
        }else{
            console.log('Message sent: ' + info.response);
        };
    });


    if(req.body.password !== req.body.confirm){
        res.render("register", {error: "Passwords do not match"});
    } else {
        var newUser = new User ({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            accountType: false //initialize account type to a passenger
        });
        User.register(newUser, req.body.password, function(err, user){
            if(err){
                console.log(err);
                console.log("this is the error: " + err);
                return res.render('register', {error: err});
            }
            passport.authenticate("local")(req, res, function(){
                console.log("User successfully added");
                res.redirect("login");
            });    //this will log the user in if there is no error. ****local can be changed to facebook or twitter for authen.
        });
    }
});

//=========Login Route========
//render login form

router.get("/login", function(req,res){
    res.render("login.ejs", {error: ""} );
});



router.get('/login',
  passport.authenticate('facebook'));

router.get('/login',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/trips');
  });

//NEW LOGIN LOGIC
//allows for errors to be passed and displayed for incorrect username or password
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.render('login', {error: info}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/profile');
    });
  })(req, res, next);
});


module.exports = router;