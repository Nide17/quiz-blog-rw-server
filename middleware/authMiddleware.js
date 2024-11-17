const jwt = require("jsonwebtoken")
const config = require('config')

const auth = async (req, res, next) => {

  const token = req.header('x-auth-token')

  // Check for token: if no: No token, authorization denied
  if (!token)
    return res.status(401).json({ msg: 'No token, authorization Denied', id: 'NO_TOKEN' })

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.get('jwtSecret'))

    // Add user from payload
    req.user = decoded

    // print the expiry date of the token
    const expiryDate = new Date(decoded.exp * 1000)

    next()

  } catch (e) {
    res.status(400).json({ msg: 'Session Expired, login again!' })
  }

}

// ROLE
const authRole = (roles) => (req, res, next) => {

  const token = req.header('x-auth-token')

  // Check for token
  if (!token)
    return res.status(401).json({ msg: 'No token, authorization Denied', id: 'NO_TOKEN' })

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.get('jwtSecret'))

    // Add user from payload
    req.user = decoded

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
        id: 'SESSION_EXPIRED'
      })
    }

    //if user has a role that is required to access any API
    const allowedUser = roles.find(rol => rol === req.user.role)

    if (allowedUser === req.user.role) {
      return next()
    }

    return res.status(401).json({
      success: false,
      msg: 'Unauthorized',
      id: 'UNAUTHORIZED'
    })
  }
  catch (e) {
    res.status(400).json({ msg: 'Session Expired, login again!', id: 'SESSION_EXPIRED' })
  }
}

module.exports = { auth, authRole }