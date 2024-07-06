const mongoose = require("mongoose")
const InstitutionSchema = new mongoose.Schema({
    name:String,
    locality:String,
    phone:String,
    address:String,
    email:String,
    password:String,
    verfied:Boolean,
    location:Object
})
const Institution = mongoose.model('Institution',InstitutionSchema)
module.exports = Institution