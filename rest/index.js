const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')


const app = express()
app.use(cors())
const port = process.env.PORT || 5000

const mongoDBURI = 'mongodb://localhost/signless'

const routes = require('./server/router')

mongoose.connect(mongoDBURI, 
    { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB')
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
}   

app.use('/', routes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})