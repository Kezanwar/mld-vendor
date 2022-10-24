const express = require('express')
const router = express.Router()

const nodemailer = require('nodemailer')

// models
const User = require('../../models/User')
const Store = require('../../models/Store')

// middlewares
const auth = require('../../middleware/auth')
const { SendError, capitalizeFirstLetter } = require('../utilities/utilities')
const { STORE_STATUS } = require('../../constants/store')

// route GET api/store
// @desc GET A LOGGED IN USERS STORE
// @access private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) throw new Error('User doesnt exist')
    const userStoreId = user?.store?.id
    if (!userStoreId) res.json({ storeStatus: STORE_STATUS.NONE })
  } catch (error) {
    SendError(res, error)
  }
})

module.exports = router
