require('dotenv').config()
require('./database/conn')
const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const Locality = require('./models/Localities')
const Volunteer = require('./models/Volunteers')
const Institution = require('./models/Institution')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.get('/localities', async (req, res) => {
  const Localities = await Locality.find({})
  res.status(200).json(Localities)
})

app.post('/addVolunteer', async (req, res) => {
  let { name, gender, dob, bgrp, locality, mobile, address, password } = req.body
  let checkVolunteer = await Volunteer.findOne({ mobile: mobile })
  if (checkVolunteer) {
    res.status(409).json({ message: "Mobile Number already Registered" })
    return
  }
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)
  const volunteer = new Volunteer({
    name: name,
    gender: gender,
    dob: dob,
    bgrp: bgrp,
    locality: locality,
    mobile: mobile,
    address: address,
    password: hash,
    verfied: false,
    last: new Date()
  })
  await volunteer.save()
    .then(() => res.status(200).json({ message: "Volunteer Registration Successfull" }))
    .catch((error) => res.json({ message: error.message }))
})

app.post('/addInstitution', async (req, res) => {
  let { name, locality, phone, address, email, password } = req.body
  let checkInstitution = await Institution.find({ phone: phone, email:email })
  if (checkInstitution) {
    res.status(409).json({ message: "Mobile Number or Email ID already Registered" })
    return
  }
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)
  const institution = new Institution({
    name: name,
    locality: locality,
    phone: phone,
    address: address,
    email: email,
    password: hash,
    verfied: false,
    location: {
      latitude:"0",
      longitude:"0"
    }
  })
  await institution.save()
    .then(() => res.status(200).json({ message: "Institution Registration Successfull" }))
    .catch((error) => res.json({ message: error.message }))
})

app.post('/isVolunteer', async (req, res) => {
  let { mobile, password } = req.body
  let volunteer = await Volunteer.findOne({mobile:mobile})
  if(volunteer) {
    if(bcrypt.compareSync(password,volunteer.password)) {
        res.status(200).json(volunteer)
    } else {
        res.status(401).json({message:"Incorrect Password"})
    }
  } else {
    res.status(401).json({message:"Invalid Mobile Number"})
  }
})

app.listen(port)