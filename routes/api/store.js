const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')

const {
  SendError,
  capitalizeFirstLetter,
  mapValidationErrorArray,
} = require('../utilities/utilities')
const { STORE_STATUS } = require('../../constants/store')

// models
const User = require('../../models/User')
const Store = require('../../models/Store')

// middlewares
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

// route GET api/store
// @desc GET A LOGGED IN USERS STORE
// @access private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) throw new Error('User doesnt exist')
    const userStoreId = user?.store?.store_id
    if (!userStoreId) res.json({ storeStatus: STORE_STATUS.NONE })
  } catch (error) {
    SendError(res, error)
  }
})

// route GET api/store
// @desc GET A LOGGED IN USERS STORE
// @access private
router.post(
  '/setup/step-1/:store_id',
  auth,
  [
    check('company_name', ' Company name is required').not().isEmpty(),
    check('company_address', ' Company address is required').exists(),
    check(
      'company_address.address_line_1',
      'Company address line 1 is required '
    )
      .not()
      .isEmpty(),
    check('company_address.postcode', ' Company postcode is required')
      .not()
      .isEmpty(),
    check('company_address.city', ' Company city is required').not().isEmpty(),
    check('company_address.country', ' Company country is required')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new Error(mapValidationErrorArray(errors))
      }

      const user = await User.findById(req.user.id)
      const userStoreId = user?.store?.store_id

      const { store_id } = req.params

      if (!store_id) throw new Error('No ID given')

      const { company_name, company_number, company_address } = req.body
      const { address_line_1, address_line_2, postcode, city, country } =
        company_address

      const existingStore = Store.findById(store_id)

      if (userStoreId && store_id && existingStore) {
        if (userStoreId !== store_id && userStoreId !== existingStore.id) {
          throw new Error('Not authorized to edit this store')
        }
        if (existingStore) {
          // update existing store
        }
      }

      if (!store_id && !existingStore && !userStoreId) {
        // no existing store, create a new store
      }
    } catch (error) {
      SendError(res, error)
      console.log(error)
    }
  }
)

module.exports = router
