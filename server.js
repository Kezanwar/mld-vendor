const express = require('express')
// const path = require('path')
require('dotenv').config()
const connectDB = require('./config/db')
const excludeTrackAndTrace = require('./middleware/excludeTrackAndTrace')

const PORT = process.env.PORT
const APP_ENV = process.env.APP_ENV
const cors = require('cors')

const app = express()

connectDB()

// init middleware
// allows us to get data within bodies of req/res
app.use(express.json({ extended: false }))
// app.use(express.static('/public'))
app.use(express.static(__dirname + '/public'))
app.use(cors())
// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', yourExactHostname)
//   res.header('Access-Control-Allow-Credentials', true)
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   )
//   next()
// })

app.get('/', (req, res) => res.send('squib API Running'))

// define routes

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))
if (APP_ENV === 'development')
  app.use('/api/test', require('./routes/api/test/test'))

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
