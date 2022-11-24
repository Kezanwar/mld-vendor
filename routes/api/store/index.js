const express = require('express')
const router = express.Router()

const {
  SendError,
  removeDocumentValues,
  getUserStoreAndRole,
  prefixImageWithBaseUrl,
} = require('../../utilities/utilities')

const { STORE_STATUS } = require('../../../constants/store')

// middlewares
const auth = require('../../../middleware/auth')

// route GET api/store
// @desc GET A LOGGED IN USERS STORE
// @access private
router.get('/', auth, async (req, res) => {
  try {
    const { user, store } = await getUserStoreAndRole(req.user.id)
    if (!user) throw new Error('User doesnt exist')
    if (!store) {
      res.json({ store_status: STORE_STATUS.NONE })
      return
    }
    const storeResponse = removeDocumentValues(['store_status'], store)
    if (storeResponse.cover_photo)
      storeResponse.cover_photo = prefixImageWithBaseUrl(
        storeResponse.cover_photo
      )
    if (storeResponse.profile_image)
      storeResponse.profile_image = prefixImageWithBaseUrl(
        storeResponse.profile_image
      )

    res.json({ store_status: store.store_status, store: storeResponse })
  } catch (error) {
    console.log(error)
    SendError(res, error)
  }
})

// store routes from respective modules
// api/store/<route>
router.use('/setup', require('./store.setup'))

module.exports = router
