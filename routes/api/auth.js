const express = require('express')
const router = express.Router()

const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('config')
const { check, validationResult } = require('express-validator')
const path = require('path')

// models
const User = require('../../models/User')

// middlewares
const auth = require('../../middleware/auth')
const {
  SendError,
  capitalizeFirstLetter,
  mapValidationErrorArray,
} = require('../utilities/utilities')

const transporter = require('../../emails/nodeMailer')
const { noreply } = require('../../emails/emailAddresses')
const {
  HeaderAndActionButtonEmailTemplate,
} = require('../../emails/templates/headerAndActionButton/HeaderAndActionButtonEmailTemplate')

// route GET api/auth
// @desc GET A LOGGED IN USER WITH JWT
// @access private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) throw new Error('User doesnt exist')
    res.json({ user })
  } catch (error) {
    SendError(res, error)
  }
})

// route POST api/auth
// @desc Authenticate and log in a user and send token
// @access public

router.post(
  '/login',
  //   middleware validating the req.body using express-validator
  [
    check('email', 'Please include a valid e-mail ').isEmail(),
    check('password', 'Password is required ').exists(),
  ],
  async (req, res) => {
    try {
      // generating errors from validator and handling them with res
      const errors = validationResult(req)
      if (!errors.isEmpty()) throw new Error(mapValidationErrorArray(errors))
      // if validator check passes then

      // destructuring from req.body
      const { email, password } = req.body
      // checking if user doesnt exist, if they dont then send err
      let user = await User.findOne({ email: email })

      if (!user) {
        throw new Error('Invalid credentials')
      }

      // compare the passwords if they exist

      const isMatch = await bcrypt.compare(password, user.password)

      // if dont exist send an error

      if (!isMatch) {
        throw new Error('Invalid credentials')
      }

      // is user credentials are a match
      // create the payload for JWT which includes our users id from the db

      const payload = {
        user: {
          id: user.id,
        },
      }

      //  call jwt sign method, poss in the payload, the jwtsecret from our config we created, an argument for optional extra parameters such as expiry, a call back function which allows us to handle any errors that occur or send the response back to user.

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw new Error(err)
          // res.cookie('authCookie', JSON.stringify(token), {
          //   secure: process.env.APP_ENV !== 'development',
          //   httpOnly: true,
          //   expires: 360000,
          // })
          res.json({
            accessToken: token,
            user: { ...user._doc, password: null },
          })
        }
      )
    } catch (err) {
      console.error(err)
      SendError(res, err)
    }
  }
)

// route POST api/users
// @desc register user - uses express validator middleware to check the userinfo posted to see if there are any errors and handle them, else create new user in the db, returns a token and user
// @access public

router.post(
  '/register',
  //   middleware validating the req.body using express-validator
  [
    check('first_name', ' Name is required').not().isEmpty(),
    check('last_name', ' Name is required').not().isEmpty(),
    check('email', ' Please include a valid e-mail').isEmail(),
    check(
      'password',
      ' Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // generating errors from validator and handling them with res

    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) throw new Error(mapValidationErrorArray(errors))

      // if validator check passes then

      // destructuring from req.body
      const { first_name, last_name, email, password } = req.body

      // checking if user exists, if they do then send err
      let user = await User.findOne({ email: email })

      if (user) throw new Error('User already exists')

      const display_name =
        capitalizeFirstLetter(first_name) +
        ' ' +
        capitalizeFirstLetter(last_name)

      // create a new user with our schema and users details from req
      user = new User({
        first_name,
        last_name,
        email,
        password,
        display_name,
      })
      // encrypt users passsord using bcrypt
      // generate the salt
      const salt = await bcrypt.genSalt(10)
      // encrypt users password with the salt
      user.password = await bcrypt.hash(password, salt)

      // save the new user to DB using mongoose
      await user.save()

      //  call jwt sign method, pass in the email and send an email to confirm their email address

      const confirmEmailPayload = {
        email: user.email,
      }

      jwt.sign(
        confirmEmailPayload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        async (err, token) => {
          if (err) throw new Error(err)

          const emailHtml = HeaderAndActionButtonEmailTemplate(
            user.first_name,
            'Please click the link below to confirm your email',
            `http://localhost:5006/api/auth/confirm-email/${token}`,
            'Confirm your email'
          )

          let info = await transporter.sendMail({
            from: `"My Local Deli" <${noreply}>`, // sender address
            to: user.email, // list of receivers
            subject: 'Confirm your email address!', // Subject line
            // text: 'Hello world?', // plain text body
            html: emailHtml, // html body
          })
        }
      )

      //  call jwt sign method, poss in the payload, the jwtsecret from our config we created, an argument for optional extra parameters such as expiry, a call back function which allows us to handle any errors that occur or send the response back to user.
      const authIdPayload = {
        user: {
          id: user.id,
        },
      }

      jwt.sign(
        authIdPayload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        async (err, token) => {
          if (err) throw new Error(err)

          res.json({
            accessToken: token,
            user: { ...user._doc, password: null },
          })
        }
      )
    } catch (err) {
      console.error(err)
      SendError(res, err)
    }
  }
)

// route GET api/auth/confirm-mail/:token
// @desc CONFIRM EMAIL ADDRESS
// @access private
router.get('/confirm-email/:token', async (req, res) => {
  try {
    const { token } = req.params
    if (!token) throw new Error('Unexpected error')
    const decoded = jwt.verify(token, config.get('jwtSecret'))
    const email = decoded.email
    if (!email) throw new Error('Email address not recognized')
    // const decoded = jwt.verify(token, config.get('jwtSecret'))
    const user = await User.findOne({ email: email })
    if (!user) throw new Error('User doesnt exist')
    user.email_confirmed = true
    user.save()
    res.sendFile(path.join(process.cwd(), 'public/email-confirmed.html'))
  } catch (error) {
    SendError(res, error)
  }
})

// route POST api/auth/resend-confirm-email
// @desc CONFIRM EMAIL ADDRESS
// @access private
router.post('/resend-confirm-email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) throw new Error('User doesnt exist')
    const confirmEmailPayload = {
      email: user.email,
    }

    jwt.sign(
      confirmEmailPayload,
      config.get('jwtSecret'),
      { expiresIn: 360000 },
      async (err, token) => {
        if (err) throw new Error(err)

        const emailHtml = HeaderAndActionButtonEmailTemplate(
          user.first_name,
          'Please click the link below to confirm your email',
          `http://localhost:5006/api/auth/confirm-email/${token}`,
          'Confirm your email'
        )

        let info = await transporter.sendMail({
          from: `"My Local Deli" <${noreply}>`, // sender address
          to: user.email, // list of receivers
          subject: 'Confirm your email address!', // Subject line
          // text: 'Hello world?', // plain text body
          html: emailHtml, // html body
        })
      }
    )
    res.status(200).send({ message: 'success' })
  } catch (error) {
    SendError(res, error)
  }
})

// route GET api/auth
// @desc RESET PASSWORD
// @access private
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) throw new Error('No email attached')
    const user = await User.findOne({ email: email })
    if (!user) throw new Error('Email address doesnt exist')

    const confirmEmailPayload = {
      email: user.email,
    }

    jwt.sign(
      confirmEmailPayload,
      config.get('jwtSecret'),
      { expiresIn: 360000 },
      async (err, token) => {
        if (err) throw new Error(err)

        const emailHtml = HeaderAndActionButtonEmailTemplate(
          user.first_name,
          'Please click the link below to reset your password',
          `http://localhost:5006/api/auth/reset-password/${token}`,
          'Reset your password'
        )

        let info = await transporter.sendMail({
          from: `"My Local Deli" <${noreply}>`, // sender address
          to: user.email, // list of receivers
          subject: 'Reset your password', // Subject line
          // text: 'Hello world?', // plain text body
          html: emailHtml, // html body
        })
      }
    )
  } catch (error) {
    SendError(res, error)
  }
})

module.exports = router
