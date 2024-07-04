const mongoose = require("mongoose")
require('dotenv').config()

main().then(()=>console.log("Connected to DB")).catch((error)=>console.log(error.message))

async function main() {
    const url = process.env.MONGODB_CONN
    await mongoose.connect(url)
}