const bcrypt = require('bcrypt')

const encrypt = async (password) => {
  const hash = await bcrypt.hash(password)
  return hash
}

const validate = async (password, hash) => {
  const match = await bcrypt.compare(password, hash)
  return match
}

module.exports = {
  encrypt, validate
}