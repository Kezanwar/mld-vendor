const express = require('express')
const { check, validationResult } = require('express-validator')
const router = express.Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

// bringing in Mongoose User Model
const User = require('../../models/User')

// route POST api/users
// @desc register user - uses express validator middleware to check the userinfo posted to see if there are any errors and handle them, else create new user in the db
// @access public
router.post(
  '/',
  //   middleware validating the req.body using express-validator
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid e-mail').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // generating errors from validator and handling them with res
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors)
    }
    // if validator check passes then

    // destructuring from req.body
    const { name, email, password } = req.body

    try {
      // checking if user exists, if they do then send err
      let user = await User.findOne({ email: email })
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] })
      }
      // if not get users gravatar or a default if doesnt exist
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      })
      // create a new user with our schema and users details from req
      user = new User({
        name,
        email,
        avatar,
        password,
      })
      // encrypt users passsord using bcrypt
      // generate the salt
      const salt = await bcrypt.genSalt(10)
      // encrypt users password with the salt
      user.password = await bcrypt.hash(password, salt)

      // save the new user to DB using mongoose
      await user.save()

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
          if (err) throw err

          res.json({
            token: token,
            user: { ...user._doc, password: null },
          })
        }
      )
    } catch (err) {
      console.error(err)
      res.status(500).send('Server Error')
    }
  }
)

// using async await here means that in our try / catch statement we just await each method which returns a promise, rather then calling .then() and then .then() inside the first .then and hen another inside the next .then etc. keeps the code more clean looking.

module.exports = router
