const jwt = require("jsonwebtoken")
const config = require('config')

const auth = async (req, res, next) => {

  const token = req.header('x-auth-token')

  // Check for token: if no: No token, authorizaton denied
  if (!token)
    return res.status(401).json({ msg: 'Authorizaton Denied, Please Login' })

  try {
    // Verify token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET || config.get('jwtSecret'))

    // Add user from payload
    req.user = decoded
    next()

  } catch (e) {
    // res.status(400).json({ msg: 'Token is not valid' })
    res.status(400).json({ msg: 'Session Expired, Refresh the page to login!' })
  }

}

// ROLE
const authRole = (roles) => (req, res, next) => {

  const token = req.header('x-auth-token')
  // Check for token
  if (!token)
    return res.status(401).json({ msg: 'No token, authorizaton Denied' })

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || config.get('jwtSecret'))

  // Add user from payload
  req.user = decoded

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Session expired',
      code: 'SESSION_EXPIRED'
    })
  }

  let authorized = false

  //if user has a role that is required to access any API
  const allowedUser = roles.find(rol => rol === req.user.role)
  authorized = allowedUser === req.user.role

  console.log(authorized ? `${req.user.role} is authorized` :
    `${req.user.role} is not authorized`)

  if (authorized) {
    return next()
  }

  return res.status(401).json({
    success: false,
    msg: 'Unauthorized',
  })
}

module.exports = { auth, authRole }