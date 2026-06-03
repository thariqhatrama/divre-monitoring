const express = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const rbacMiddleware = require('../middleware/rbac.middleware')

const router = express.Router()

router.get(
  '/protected',
  authMiddleware,
  rbacMiddleware(['kepala_divre', 'pm', 'admin']),
  (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'Protected route berhasil diakses',
        user: req.user
      }
    })
  }
)

router.get(
  '/admin',
  authMiddleware,
  rbacMiddleware(['admin']),
  (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'Admin route berhasil diakses',
        user: req.user
      }
    })
  }
)

module.exports = router
