require('dotenv').config()
require('./database/conn')
const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const Locality = require('./models/Localities')
const Volunteer = require('./models/Volunteers')
const Institution = require('./models/Institution')
const http = require('http')
const socket = require('socket.io')
const Location = require('./models/Location')
const port = process.env.PORT || 3000

const app = express()
app.use(express.json())
app.use(cors({
    origin:"http://localhost:5173",
    methods: ['GET','POST','PATCH','DELETE'],
    credentials: true
}))

const server = http.createServer(app)
const socketServer = socket(server,{
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET','POST','PATCH','DELETE'],
        credentials: true
    }
})

socketServer.on('connection', (socket) => {

})

//middleware for authentication using jwt
const verifyToken = (req, res, next) => {
    let authHeader = req.headers.authorization
    if (authHeader == undefined) {
        res.status(401).json({ message: "No Token. Authentication Failed" })
    } else {
        let token = authHeader.split(" ")[1]
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: "Invalid Token. Authentication Failed" })
            } else {
                next();
            }
        })
    }
}

//get institution data from token
app.get('/getInstData', (req, res) => {
    let authHeader = req.headers.authorization
    if (authHeader == undefined) {
        res.status(401).json({ message: "No Token. Authentication Failed" })
    } else {
        let token = authHeader.split(" ")[1]
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: "Invalid Token. Authentication Failed" })
            } else {
                res.status(200).json(decoded)
            }
        })
    }
})

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
    let checkInstitution = await Institution.findOne({ phone: phone })
    if (checkInstitution) {
        res.status(409).json({ message: "Mobile Number already Registered" })
        return
    }
    checkInstitution = await Institution.findOne({ email: email })
    if (checkInstitution) {
        res.status(409).json({ message: "Email ID already Registered" })
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
            latitude: "0",
            longitude: "0"
        }
    })
    await institution.save()
        .then(() => res.status(200).json({ message: "Institution Registration Successfull" }))
        .catch((error) => res.json({ message: error.message }))
})

app.post('/validateLogin', async (req, res) => {
    let { email, password } = req.body
    let institution = await Institution.findOne({ email: email })
    if (institution) {
        if (bcrypt.compareSync(password, institution.password)) {
            if (institution.verfied) {
                let token = jwt.sign(institution.toJSON(), process.env.JWT_KEY)
                res.status(200).json(token)
            } else {
                res.status(401).json({ message: "Registration not Verified" })
            }
        } else {
            res.status(401).json({ message: "Incorrect Password" })
        }
    } else {
        res.status(401).json({ message: "Invalid Email ID" })
    }
})

app.post('/isVolunteer', async (req, res) => {
    let { mobile, password } = req.body
    let volunteer = await Volunteer.findOne({ mobile: mobile })
    if (volunteer) {
        if (bcrypt.compareSync(password, volunteer.password)) {
            if (volunteer.verfied) {
                res.status(200).json(volunteer)
            } else {
                res.status(401).json({ message: "Registration not Verified" })
            }
        } else {
            res.status(401).json({ message: "Incorrect Password" })
        }
    } else {
        res.status(401).json({ message: "Invalid Mobile Number" })
    }
})

//to institutions to verify volunteers
app.post('/getVolunteers', verifyToken, async (req, res) => {
    let locality = req.body.locality
    try {
        let volunteers = await Volunteer.find({ locality: locality, verfied: false })
        if (volunteers.length > 0) {
            res.status(200).json(volunteers)
        } else {
            res.sendStatus(204)
        }
    } catch (error) {
        res.status(502).json({ message: error.message })
    }
})

app.patch('/acceptVolunteer', verifyToken, async (req, res) => {
    let mobile = req.body.mobile
    try {
        let volunteer = await Volunteer.findOneAndUpdate({ mobile: mobile }, { verfied: true })
        if (volunteer) {
            res.sendStatus(200)
        } else {
            res.sendStatus(404)
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/rejectVolunteer', verifyToken, async (req, res) => {
    let mobile = req.body.mobile
    try {
        let volunteer = await Volunteer.deleteOne({ mobile: mobile })
        if (volunteer.deletedCount == 0) {
            res.sendStatus(404)
        } else {
            res.sendStatus(200)
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/getDonorList', verifyToken, async (req, res) => {
    let bgrp = req.body.bgrp
    try {
        let volunteers = await Volunteer.find({ bgrp: bgrp })
        if (volunteers.length > 0) {
            res.send(200).json(volunteers)
        } else {
            res.sendStatus(204)
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post("/getDonors", (req, res) => {
    let bgrp = req.body.bgrp
    socketServer.emit("request", bgrp)
    res.sendStatus(200)
})

//to store volunteer location
app.post("/storeLocation", async (req, res) => {
    let { mob, latitude, longitude } = req.body
    const location = new Location({
        mobile: mob,
        location: {
            latitude: latitude,
            longitude: longitude
        }
    })
    let checkLocation = await Location.findOne({ mobile: mob })
    if (checkLocation) {
        await Location.updateOne({ mobile: mob }, {
            location: {
                latitude: latitude,
                longitude: longitude
            }
        })
    } else {
        await location.save()
            .then(() => {
                res.sendStatus(200)
            })
            .catch((error) => {
                res.status(500).json({ message: error.message })
            })
    }
})

server.listen(port)