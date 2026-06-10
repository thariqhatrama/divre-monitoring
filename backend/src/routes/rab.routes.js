const express = require('express')
const rabController = require('../controllers/rab.controller')
const authMiddleware = require('../middleware/auth.middleware')
const rbacMiddleware = require('../middleware/rbac.middleware')

const router = express.Router()

router.get(
  '/proyek/:id/rab',
  authMiddleware,
  rbacMiddleware(['kepala_divre', 'pm', 'admin']),
  rabController.listRabItems
)

router.post(
  '/proyek/:id/rab',
  authMiddleware,
  rbacMiddleware(['pm', 'admin']),
  rabController.createRabItem
)

router.patch(
  '/rab/:itemId',
  authMiddleware,
  rbacMiddleware(['pm', 'admin']),
  rabController.updateRabItem
)

router.delete(
  '/rab/:itemId',
  authMiddleware,
  rbacMiddleware(['pm', 'admin']),
  rabController.deleteRabItem
)

module.exports = router
