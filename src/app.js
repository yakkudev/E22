const express = require('express')
const cookieParser = require('cookie-parser')
const { sessionManager } = require('./middleware/sessionManager')
const router = require('./routes/mainRouter')

const app = express()

app.set('view engine', 'ejs')
app.set('views', './src/views')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(sessionManager())
app.use('/', router)

module.exports = app
