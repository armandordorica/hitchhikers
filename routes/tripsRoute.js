var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Trip = require("../models/trip");
var Vehicle = require("../models/vehicle");
var mongoose = require("mongoose");

router.get("/trip/new", isLoggedIn, function(req, res) {
   res.render("newtrip");
});

router.post("/trip/new", isLoggedIn, function(req, res) {
    var newTrip = ({
        driver: req.user._id,
        origin: req.body.origin,
        destination: req.body.destination,
        date: req.body.date,
        price: req.body.price,
        availableSeats: req.body.seats
    })
    Trip.create(newTrip, function(err, trip){
        if(err){
            console.log(err);
        } else {
            User.findByIdAndUpdate(req.user._id, function(err, user){
                if(err){
                    console.log(err);
                } else {
                    $push: {
                        tripIDs: trip._id; 
                    }  
                }   
            });
            console.log("Trip Added");
            res.redirect("/trips");
        }
            
    });
});

router.get("/trips", function(req, res) {
   
    var origin = req.param('origin');
    var destination = req.param('destination');
    var priceMin = req.param('priceMin');
    var priceMax = req.param('priceMax');
    var seats = req.param('seats');
    var sortBy = req.param('sortBy');
    var order = req.param('order');
    
    var sortOrder = 1;
    if(order == "decreasing"){
        sortOrder = -1;
    }
    
    // build search query
    var query = {};
    if(origin !== undefined && origin !== ""){
        query['origin'] = origin;
    }
    if(destination !== undefined && destination !== ""){
        query['destination'] = destination;
    }
    if((priceMin !== undefined) && (priceMin !== "") && (priceMax !== undefined) && (priceMax !== "")){ 
        query['price'] = {$gte: priceMin, $lte: priceMax};
    };
    if(((priceMin !== undefined) && (priceMin !== "")) && ((priceMax == undefined) || (priceMax == ""))){ 
        query['price'] = {$gte: priceMin};
    };
    if(((priceMin == undefined) || (priceMin == "")) && ((priceMax !== undefined) && (priceMax !== ""))){ 
        query['price'] = {$lte: priceMax};
    };
    if((seats !== undefined) && (seats !== "")){
        query['availableSeats'] = {$gte: seats};
    }
 
    
    var sortQuery ={};
    if((sortBy == undefined) || (sortBy == "")){
        sortQuery["price"] = -1;
    }else{
        sortQuery[sortBy] = sortOrder;
    }
    
    //console.log("sortBy is " + sortBy);
    if(sortBy !== "driverRating"){
        Trip.find(query).sort(sortQuery).populate('driver').exec(function(err, trips) {
            if(err){
                console.log("error finding and sorting");
            }else{
                //console.log(trips);
                res.render("trips.ejs", {trips: trips, length: trips.length});
            }
        });
        
    }else{
        //implement different sorting function for driver rating
        //(cannot use mongo sort for populated variables)
        Trip.find(query).populate('driver').exec(function(err,trips){
            if(err){
                console.log("error finding trips");
            }else{
                //convert to array
                var tripArray = []
                trips.forEach(function(trip){
                    tripArray.push(trip);
                });
                tripArray.sort(function(a, b) {
                    var driverArating = 0;
                    var driverBrating = 0;
                    if(a.driver !== undefined){
                        driverArating = a.driver.rating;
                    }
                    if(b.driver !== undefined){
                        driverBrating = b.driver.rating;
                    }
                    return driverArating - driverBrating;
                });
                if(order == "decreasing"){
                    tripArray.reverse();
                }
                res.render("trips.ejs", {trips: tripArray, length: tripArray.length});
            }
        });
    };
    
});

router.post("/trips", function(req, res){
    
        var destination = req.body.destination;
        var origin = req.body.origin;
        var priceMin = req.body.priceMin;
        var priceMax = req.body.priceMax;
        var seats = req.body.seats;
        var sortBy = req.body.sortBy;
        var order = req.body.order;
        res.redirect("/trips"+"?origin="+origin+"&destination="+destination+"&priceMin="+priceMin+"&priceMax="+priceMax+"&sortBy="+sortBy+"&order="+order+"&seats="+seats);

});

//TRIP DETAILS PAGE
// called from trips page "view details"
router.get("/trip/:id", isLoggedIn, function(req, res) {
    var tripID = req.params.id;
    Trip.findById(tripID).populate('driver', 'passengers').exec(function(err,trip){
        if(err) {
            console.log("Could not find trip");
        }else{
            console.log("rendering trip page, passengers = " + trip.passengers);
            console.log(trip.driver)
            User.findById(trip.driver, function(err, driver){
                if(err){
                    //if we fail redirect back to the trip page and log an error
                    res.redirect("/trips");
                    console.log("Error finding driver");
                } else {
                    //if we succeed redirect to the trips page
                    console.log(driver.name);
                    res.render("trip.ejs", {trip: trip, driver: driver});
                }
            });
        }
    });
});

// router.put("/trip/:id", function(req, res) {
//     Trip.findByIdAndUpdate(req.user._id, {
//         $set: {
//             availableSeats: availableSeats
//         }
//     }, function(err, updatedUser) {
//         if(err){
//             console.log(err);
//             res.render("editProfile.ejs");
//         } else {
//             console.log(req.body.name);
//             res.redirect("/profile");
//         }
//     });
// })

//GET TRIP PASSENGERS
/*called from the profile.ejs when a driver wants to view the passengers that have
requested to join their trip. Redirects the driver to a page passengers.ejs that
Displays the passengers*/
router.get("/trip/:id/passengers", function(req, res) {
    
    
    
    
    //attempt to add passenger:
    // User.findOne({name: "Mike Harver"}).exec(function(err,mike){
    //     if(err){
    //         console.log("could not find user");
    //     }else{
    //         Trip.findById("58c72e11af4feab92f24a688").populate('driver', 'passengers').exec(function(err,trip){
    //             if(err){
    //                 console.log("could not find trip");
    //             }else{
    //                 trip.passengers.push(mike);
    //                     console.log("passengers: " + trip.passengers);
    //     }
    // });
    //     }
    // });
   
    var tripID = req.params.id;
    Trip.findById(tripID, function(err, trip) {
        if(err){
            console.log("Could not find trip ")
        } else{
            res.render("passengers.ejs", {trip: trip});
        }
    })
    
    // Trip.findById(tripID).populate("passengers", "driver").exec(function(err,trip){
    //     console.log(trip);
    //     if(err){
    //         console.log("Error finding trip");
    //     }else{
    //         console.log("rendering passengers page");
    //         console.log(trip);
    //         console.log("passengers: " + trip.passengers);
    //         res.render("passengers.ejs", {trip: trip});
    //     }
    // })
    
});

router.put("/trip/:id", function(req,res){
    //console.log(req.body.addTrip);
    //console.log(req.session.passport.user._id);
        
        // Trip.findById(req.body.addTrip).populate('passengers').exec(function(err,trip){
        // if(err) {
        //     console.log("Could not find trip");
        // }else{
            
        // }
    console.log("HERE")
    console.log(req.params.id);
    
    //find User and add the new trip to the Users tripID array
    User.findByIdAndUpdate(req.user._id, {
        $push: {
          tripIDs: req.params.id
        }
    }, function(err,user) {
        if(err){
            console.log(err);
            console.log("im here dawg");
        }
        else{
            console.log('Trip added to passengers trip array');
            }
    });
    
    //Update the trip's passengers array to add the current User
    Trip.findByIdAndUpdate(req.params.id, {
        $push: {
          passengers: req.user._id
        }
    }, function(err,user) {
        if(err){
            console.log(err);
            console.log("im here dawg");
        }
        else{
            console.log('Passenger added to the trips Passenger array');
            }
    });
    
    //First find the available seats on the updated trip then decrement 
    //that value by 1 and update available seats
    Trip.findById(req.params.id, function(err, trip){
       if(err){
           console.log(err);
       } else {
           var seats = trip.availableSeats;
           console.log("found available seats")
           Trip.findByIdAndUpdate(req.params.id, {
               $set: {
                   availableSeats: seats - 1
               }
           }, function(err, trip){
               if(err){
                   console.log(err)
               } else {
                    console.log("Available seats updated")
                    res.redirect("/trips")
               }
           })
       }
    });
    
    
});


//DELETE TRIP ROUTE
router.delete("/trip/:id", function(req,res){ 
    //take the params.id from the post request and us the findByIdAndRemove
    //to remove from the data bas
    Trip.findByIdAndRemove(req.params.id, function(err){
        if(err){
            //if we fail redirect back to the trip page and log an error
            res.redirect("/trips");
            console.log("Error removing trip");
        } else {
            //if we succeed redirect to the trips page
            res.redirect("/trips");
            console.log("Trip Removed");
        }
    });
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

/*TODO: create a PUT method to update trip variables
    most importantly the ability to update passengers who are interested in a trip
    Route is called from within the trips.ejs and it must update the passengers array
    to include the user who pressed the Show Interest button*/
module.exports = router;