const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

function sanitizeUser(user) {
  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
    cabang_id: user.cabang_id,
    cabang: user.cabang || null
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email dan password wajib diisi'
        }
      })
    }

    const user = await userModel.findUserByEmail(email)

    if (!user || !user.aktif) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email atau password salah'
        }
      })
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash)

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email atau password salah'
        }
      })
    }

    const sanitizedUser = sanitizeUser(user)

    const token = jwt.sign(
      {
        sub: sanitizedUser.id,
        id: sanitizedUser.id,
        nama: sanitizedUser.nama,
        email: sanitizedUser.email,
        role: sanitizedUser.role,
        cabang_id: sanitizedUser.cabang_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    return res.json({
      success: true,
      data: {
        token,
        user: sanitizedUser
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: error.message
      }
    })
  }
}

function logout(req, res) {
  return res.json({
    success: true,
    data: {
      message: 'Logout berhasil'
    }
  })
}

module.exports = {
  login,
  logout
}
