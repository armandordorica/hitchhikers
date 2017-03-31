var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    description: String,
    rating: Number,
    ratingArray: [],
    driversLicense: String,
    phone: String,
    dlVerified: Boolean,
    emailVerified: Boolean,
    phoneVerified: Boolean,
    accountType: false, //false=passenger (Default) -- true=driver
    // trips: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Trip"
    //     }
    // ],
    tripIDs: [],//attempting to keep just trip ids to avoid circular definition
    vehiclesIDs: []
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);