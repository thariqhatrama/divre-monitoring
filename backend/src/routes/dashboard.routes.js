const express = require('express')
const dashboardController = require('../controllers/dashboard.controller')
const authMiddleware = require('../middleware/auth.middleware')
const rbacMiddleware = require('../middleware/rbac.middleware')

const router = express.Router()

router.get(
  '/summary',
  authMiddleware,
  rbacMiddleware(['kepala_divre', 'pm', 'admin']),
  dashboardController.getSummary
)

router.get(
  '/by-cabang',
  authMiddleware,
  rbacMiddleware(['kepala_divre', 'pm', 'admin']),
  dashboardController.getByCabang
)

module.exports = router
