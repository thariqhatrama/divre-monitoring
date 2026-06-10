const express = require('express')
const kursController = require('../controllers/kurs.controller')
const authMiddleware = require('../middleware/auth.middleware')
const rbacMiddleware = require('../middleware/rbac.middleware')

const router = express.Router()
const canReadKurs = [authMiddleware, rbacMiddleware(['kepala_divre', 'pm', 'admin'])]
const adminOnly = [authMiddleware, rbacMiddleware(['admin'])]

router.get('/', canReadKurs, kursController.getKurs)
router.put('/', adminOnly, kursController.updateKurs)

module.exports = router
