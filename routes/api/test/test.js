const express = require('express')
const router = express.Router()

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('config')
const { check, validationResult } = require('express-validator')

// models
const User = require('../../../models/User')

// middlewares
const auth = require('../../../middleware/auth')
const { SendError } = require('../utilities/utilities')
const transporter = require('../../../emails/nodeMailer')
const {
  HeaderAndActionButtonEmailTemplate,
} = require('../../../emails/templates/headerAndActionButton/HeaderAndActionButtonEmailTemplate')
const path = require('path')

router.get('/test-find-email/:email', async (req, res) => {
  try {
    const { email } = req.params
    if (!email) throw new Error('No email attached')
    const user = await User.find({ email: email }).explain()
    res.json(user)
  } catch (error) {
    SendError(res, error)
  }
})

module.exports = router
