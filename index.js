require('dotenv').config()
require('./database/conn')
const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const Locality = require('./models/Localities')
const Volunteer = require('./models/Volunteers')
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
  try {
    let checkVolunteer = await Volunteer.findOne({ mobile: mobile })
    if (checkVolunteer) {
      res.status(409).json({ message: "Mobile Number already Registered" })
      return
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
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
  try {
    await volunteer.save()
      .then(() => res.status(200).json({ message: "Volunteer Registration Successfull" }))
      .catch((error) => res.json({ message: error.message }))
  } catch (error) {
    res.status(500).json({message:error.message})
  }
})

app.listen(port)