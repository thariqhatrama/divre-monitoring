const express = require('express')
const auditController = require('../controllers/audit.controller')
const authMiddleware = require('../middleware/auth.middleware')
const rbacMiddleware = require('../middleware/rbac.middleware')

const router = express.Router()
const adminOnly = [authMiddleware, rbacMiddleware(['admin'])]

router.get('/', adminOnly, auditController.listAuditLogs)

module.exports = router
