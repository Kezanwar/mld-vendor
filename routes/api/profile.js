const express = require('express')
const router = express.Router()
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// middleware
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

// route GET api/profile/me
// @desc get current users profile
// @access private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
      // dont send activity
    )
    if (!profile)
      return res.status(400).json({ msg: 'There is no profile for this user' })
    else {
      res.send(profile)
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('server error')
  }
})

// route POST api/profile
// @desc create user profile using JWT to indentify user
// @access private

router.post(
  '/',
  [
    auth,
    [
      // check('status', 'Status is required').not().isEmpty(),
      // check('bio', 'Bio is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json(errors)

    const {
      bio,
      status,
      website,
      location,
      username,
      twitter,
      instagram,
      linkedin,
    } = req.body

    // build profile object

    const profileFields = {
      user: req.user.id,
      bio,
      status,
      website,
      location,
      username,
      social: {
        twitter,
        instagram,
        linkedin,
      },
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id })
      if (profile) {
        await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
        return res.json(profile)
      } else {
        profile = new Profile(profileFields)
        await profile.save()
        res.json(profile)
      }
    } catch (error) {
      console.error(error.message)
      res.status(500).send('server error')
    }
  }
)

// route GET api/profile
// @desc get all profiles
// @access public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('server error')
  }
})

// route GET api/profile/user/:user_id
// @desc get profile by USER ID
// @access public

router.get('/user/:user_id', async (req, res) => {
  try {
    console.log(req.body)
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar'])

    if (!profile) return res.status(400).json({ msg: 'Profile not found' })

    res.json(profile)
  } catch (err) {
    console.log(err)
    // if error is because of the user ObjectID being wrong format - send same error as above
    if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'Profile not found' })
    res.status(500).send('server error')
  }
})

// route DELETE api/profile
// @desc delete profile and user
// @access private

router.delete('/', auth, async (req, res) => {
  try {
    // @todo, remove users posts too
    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id })
    // remove user
    await User.findOneAndRemove({ _id: req.user.id })
    res.json({ msg: 'user removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('server error')
  }
})

// route PUT api/profile/activity
// @desc add activity feed to profile
// @access private

// router.put('/activity', auth, async (req, res) => {
//   const {activityType, activityInteractedWith, activityLink} = req.body
//   let activity = {
//     type: activityType,
//     interactedWith: activityInteractedWith,
//     link: activityLink,
//   }
//   try {
//     let profile = await Profile.findOne({ user: req.user.id });
//     if (!profile) return res.json({msg: "No profile for this user"});
//     else {
//       profile.activities.unshift(activity);
//       await profile.save();
//       return res.status(200).json({msg: "success"})
//       // return res.json(profile);
//     }
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("server error");
//   }
// })

// // route PUT api/profile/notification
// // @desc add activity feed to profile
// // @access public

// router.put('/notification', auth, async (req, res) => {
//   const {type, authorUserName, authorID, link, userID} = req.body
//   try {
//     let profile = await Profile.findOne({ user: userID });
//     if (!profile) return res.json({msg: "No profile for this user"});
//     else {
//       profile.activities.unshift(activity);
//       await profile.save();
//       return res.status(200).json({msg: "success"})
//       // return res.json(profile);
//     }
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("server error");
//   }
// })

// route GET api/profile/me/specific_field
// @desc retrieve a specific field from my profile
// @access private

router.get('/me/::specific_field', auth, async (req, res) => {
  try {
    const param = req.params.specific_field
    const profileField = await Profile.findOne({ user: req.user.id }).select(
      `${param}`
    )
    if (!profileField) return res.json({ msg: 'No profile for this user' })
    else return res.json(profileField)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('server error')
  }
})

module.exports = router
