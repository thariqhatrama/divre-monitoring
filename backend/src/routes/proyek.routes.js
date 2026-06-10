const express = require('express')
const proyekController = require('../controllers/proyek.controller')
const authMiddleware = require('../middleware/auth.middleware')
const rbacMiddleware = require('../middleware/rbac.middleware')

const router = express.Router()

router.get(
  '/',
  authMiddleware,
  rbacMiddleware(['kepala_divre', 'pm', 'admin']),
  proyekController.listProjects
)

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['pm', 'admin']),
  proyekController.createProject
)

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware(['kepala_divre', 'pm', 'admin']),
  proyekController.getProject
)

router.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware(['pm', 'admin']),
  proyekController.updateProject
)

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['admin']),
  proyekController.archiveProject
)

module.exports = router
