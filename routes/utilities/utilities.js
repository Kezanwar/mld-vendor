require('dotenv').config()
const { STORE_ROLES } = require('../../constants/store')
const Store = require('../../models/Store')
const User = require('../../models/User')
const sharp = require('sharp')

const _ = require('lodash')
// utilties

exports.ArrayIsEmpty = (array) => {
  if (array.length > 0) return false
  else return true
}

exports.SendError = (res, err, statusCode = 500) => {
  res
    .status(statusCode)
    .json({ message: err?.message || 'Internal server error' })
}

exports.capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

exports.mapValidationErrorArray = (errors) =>
  errors?.errors.map((err) => err.msg)

exports.getDocumentValues = (arrayOfRequiredKeys, document) => {
  if (!arrayOfRequiredKeys || !Array.isArray(arrayOfRequiredKeys || !document))
    throw new Error(
      'getDocumentValues expects an array of values as its first argument and the MGDB/Document to pull from as the second'
    )

  const object = document.toObject()

  return _.pick(object, arrayOfRequiredKeys)
}

exports.removeDocumentValues = (arrayOfUnrequiredKeys, document) => {
  if (
    !arrayOfUnrequiredKeys ||
    !Array.isArray(arrayOfUnrequiredKeys || !document)
  )
    throw new Error(
      'removeDocumentValues expects an array of values as its first argument and the MGDB/Document to omit from as the second'
    )

  const object = document.toObject()

  return _.omit(object, arrayOfUnrequiredKeys)
}

exports.isAdmin = (user) => {
  if (!user) throw new Error('No user')
  if (!user.store) throw new Error('No store associated with this user')
  if (
    !user.store.role !== STORE_ROLES.admin ||
    !user.store.role !== STORE_ROLES.super_admin
  )
    return false
  else return true
}

exports.getUserStoreAndRole = (id) =>
  new Promise(async (resolve, reject) => {
    if (!id) reject('no ID passed')
    const user = await User.findById(id)
    const store = user?.store?.store_id
      ? await Store.findById(user?.store?.store_id)
      : undefined
    const role = user?.store?.role
    resolve({
      user,
      store,
      role,
    })
  })

exports.getUser = (id) =>
  new Promise(async (resolve, reject) => {
    if (!id) throw new Error('no ID passed')
    const user = await User.findById(id).select('-_id')
    resolve(user || undefined)
  })

exports.createUrlFromString = (str) => {
  return str.replace(/\s+/g, '-').toLowerCase()
}

exports.createImageName = (obj, item, image) => {
  const type = image.mimetype.split('/')[1]
  return `${obj.id}-${item}.${type}`
}

exports.resizeProfilePhoto = (buffer) =>
  new Promise(async (resolve, reject) => {
    try {
      const resizedBuffer = await sharp(buffer)
        .resize({ height: 500, width: 500, fit: 'contain' })
        .toBuffer()
      resolve(resizedBuffer)
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })

exports.prefixImageWithBaseUrl = (imageName) =>
  `${process.env.S3_BUCKET_BASE_URL}${imageName}`
