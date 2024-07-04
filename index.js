require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT

app.get('/localities', (req, res) => {
  
})

app.listen(port, ()=>{
  console.log("Server is running on Port Number: "+port)
})