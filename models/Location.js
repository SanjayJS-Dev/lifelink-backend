const mongoose = require("mongoose")
const LocationSchema = new mongoose.Schema({
    mobile: String,
    location: Object
})
const Location = mongoose.model('Location',LocationSchema)
module.exports = Location