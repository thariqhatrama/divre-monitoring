const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token tidak ditemukan'
        }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findUserById(decoded.sub)

    if (!user || !user.aktif) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User tidak aktif atau tidak ditemukan'
        }
      })
    }

    req.user = user
    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token sudah kedaluwarsa'
        }
      })
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token tidak valid'
      }
    })
  }
}

module.exports = authMiddleware
