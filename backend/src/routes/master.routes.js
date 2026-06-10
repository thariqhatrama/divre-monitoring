const express = require('express')
const masterController = require('../controllers/master.controller')
const authMiddleware = require('../middleware/auth.middleware')
const rbacMiddleware = require('../middleware/rbac.middleware')

const router = express.Router()
const adminOnly = [authMiddleware, rbacMiddleware(['admin'])]

router.get('/coa', adminOnly, masterController.listCoa)
router.post('/coa', adminOnly, masterController.createCoa)
router.patch('/coa/:kodeSeg5', adminOnly, masterController.updateCoa)

router.get('/cabang', adminOnly, masterController.listBranches)
router.post('/cabang', adminOnly, masterController.createBranch)
router.patch('/cabang/:id', adminOnly, masterController.updateBranch)

router.get('/user', adminOnly, masterController.listUsers)
router.post('/user', adminOnly, masterController.createUser)
router.patch('/user/:id', adminOnly, masterController.updateUser)

module.exports = router
