const mongoose = require("mongoose")
const VolunteerSchema = new mongoose.Schema({
    name:String,
    gender:String,
    dob:String,
    bgrp:String,
    locality:String,
    mobile:String,
    address:String,
    password:String,
    verfied:Boolean,
    last:Date
})
const Volunteer = mongoose.model('Volunteer',VolunteerSchema)
module.exports = Volunteer