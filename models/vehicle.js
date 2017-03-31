var mongoose = require("mongoose");


var VehicleSchema = new mongoose.Schema({
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        year: String,
        make: String,
        model: String,
        colour: String,
        seatsAvailable: Number,
        licensePlate: String,
    });
    

module.exports = mongoose.model("Vehicle", VehicleSchema);