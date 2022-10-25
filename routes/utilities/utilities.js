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
