const mongoose = require("mongoose")
const LocalitySchema = new mongoose.Schema({
    loc_id:String,
    name:String
})
const Locality = mongoose.model('Locality',LocalitySchema)
module.exports = Locality