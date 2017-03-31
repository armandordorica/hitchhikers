var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Trip = require("../models/trip");
var Vehicle = require("../models/vehicle");
var mongoose = require("mongoose");
//mongoose.Promise = require('bluebird');


router.get("/users", function(req, res) { //get request for all users
    User.find({},function(err,users){
        if(err){
            console.log(err);
        } else {
            res.render("users.ejs", {users: users});
        }
    });
});

router.get("/user/:id", function(req, res) {
    var userID = req.params.id;
    User.findById(userID, function(err,user){
        if(err) {
            console.log("Could not find user");
        }else{
            console.log(user._id);
            res.render("driverProfile.ejs", {user: user});
        }
    });
});

//EDIT USER
router.get("/profile/edit", isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, foundUser){
        if(err){
            res.redirect("/login.ejs" + req.params.id)
        } else {
            res.render("editProfile", {user: foundUser}); 
        }
    })
});

router.put("/profile/edit", isLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.user._id, {
        $set: {
            name: req.body.name,
            email: req.body.email,
            //username: req.body.name,
            password: req.body.password,
            description: req.body.description
        }
    }, function(err, updatedUser) {
        if(err){
            console.log(err);
            res.render("editProfile.ejs");
        } else {
            console.log(req.body.name);
            res.redirect("/profile");
        }
    });
});


//GET PROFILE
router.get("/profile", isLoggedIn, function(req,res){
    var count = 0;
    var Trips = [];
    var counter = 0;
    

   
    for(var index = 0; index < req.user.tripIDs.length; index++){
 
        var tripID = req.user.tripIDs[index];
        var done = true;
        //console.log(Trip.findById(tripID));
      //  Trips.push(Trip.findById(mongoose.Types.ObjectId(tripID)));
     // console.log(Trip.findById(tripID));
      
    
    var theTripQuery = Trip.findById(mongoose.Types.ObjectId(tripID));
    theTripQuery.then(function(trip){
        if(trip !== null){
             Trips.push(trip);
             console.log(trip.date);

        }
    });
    //console.log(theTripQuery);
    
    //Trips.push(theTrip);
       
    
    //   Trip.findById(mongoose.Types.ObjectId(tripID), function(err,trip){
    //       if(err){
    //           console.log(err);
    //       }
    //       else{
    //           console.log(trip);
    //           console.log(done);
    //           Trips.push(trip);
    //           done = false;
    //     };
      
       
    //   // console.log(Trip.findById(tripID).origin);
    // });

 //sconsole.log(Trips[index]);
};

function function2() {
    // all the stuff you want to happen after that pause
   res.render("profile.ejs", {trips: Trips});
}


setTimeout(function2, 3000);
   
});

//PUT PROFILE
//Conatains the logic to update a passenger to driver status, copied what Ivan wrote above
//but made it into a put statement. This gets call from the profile page
router.put("/profile", function(req, res){
    var isDriver = false;
    if(req.body.driverButton == "DRIVER"){
        isDriver = true;
    }
    //console.log(req.session.passport.user.username);
    //console.log(isDriver);
    var newVehicle = ({
        driver: req.user._id,
        year: req.body.yeat,
        make: req.body.make,
        model: req.body.model,
        colour: req.body.colour,
        seatsAvailable: req.body.seats,
        licencePlate: req.body.licencePlate
    })
    Vehicle.create(newVehicle, function(err, vehicle){
        if(err){
            console.log(err);
        } else {
            User.findByIdAndUpdate(req.user._id, function(err, user){
                if(err){
                    console.log(err);
                } else {
                    $push: {
                        vehicleIDs: vehicle._id; 
                    }  
                }   
            });
            console.log("Vehicle Added");
        }
            
    });
    

    User.findByIdAndUpdate(req.user._id,  {
        $set: {
            accountType: true
        }
    }, function(err, updatedUser) {
        if(err){
            console.log(err);
            res.render("profile.ejs");
        }
        else{
            console.log('Account Updated');
            console.log(req.accountType);
            res.redirect("/profile");
        }
    });
});


router.post("/profile/rate/:id", function(req, res) {
    console.log(req.params.id);
       res.redirect("/profile");
      
      var newRating = 0;
//       var Trips = [];
      
//       for(var index = 0; index < req.user.tripIDs.length; index++){
 
         var tripID = req.params.id;
      
     var theTripQuery = Trip.findById(mongoose.Types.ObjectId(tripID));
    theTripQuery.then(function(trip){
        if(trip !== null){    
            //adding the rating to the rating array
            User.findByIdAndUpdate(trip.driver, {
        $push: {
            ratingArray: req.body.rating
        },
      
    }, function(err, updatedUser) {
        if(err){
            console.log(err);
        } else {
            
            //res.redirect("/profile");
        }
    });
         var theUserQuery = User.findById(mongoose.Types.ObjectId(trip.driver));
            theUserQuery.then(function(user){
            if(user !== null){
             for(var i = 0; i < user.ratingArray.length; i++){
                 newRating += Number(user.ratingArray[i]);
                 //console.log(user.ratingArray[i])
                 //console.log(rating);
             }
             newRating = newRating/user.ratingArray.length;

        }
    });
    
    var function2 = function() {
   User.findByIdAndUpdate(trip.driver, {
        $set: {
            rating: Number(newRating)
        },
      
    }, function(err, updatedUserRating) {
        if(err){
            console.log(err);
        } else {
            console.log(newRating);
            console.log(updatedUserRating.rating);
            console.log(req.body.rating);
            //res.redirect("/profile");
        }
    });
};

setTimeout(function2, 3000);
    
    

        }
    });
   
// };
    
    
});

//use to check if a user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
