var mongoose = require("mongoose");


var TripSchema = new mongoose.Schema({
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle"
        },
        origin: String,
        destination: String,
        date: Date,
        price: Number,
        availableSeats: Number,
        passengers: [ //for now this is an array of interested users
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
    });
    

module.exports = mongoose.model("Trip", TripSchema);