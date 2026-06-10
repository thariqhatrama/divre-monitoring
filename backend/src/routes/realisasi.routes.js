const express = require('express')
const realisasiController = require('../controllers/realisasi.controller')
const authMiddleware = require('../middleware/auth.middleware')
const rbacMiddleware = require('../middleware/rbac.middleware')

const router = express.Router()

router.get(
  '/proyek/:id/realisasi',
  authMiddleware,
  rbacMiddleware(['kepala_divre', 'pm', 'admin']),
  realisasiController.listRealisasi
)

router.post(
  '/rab/:itemId/realisasi',
  authMiddleware,
  rbacMiddleware(['pm', 'admin']),
  realisasiController.createRealisasi
)

router.patch(
  '/realisasi/:id',
  authMiddleware,
  rbacMiddleware(['pm', 'admin']),
  realisasiController.updateRealisasi
)

router.delete(
  '/realisasi/:id',
  authMiddleware,
  rbacMiddleware(['pm', 'admin']),
  realisasiController.deleteRealisasi
)

module.exports = router
