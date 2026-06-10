const kursService = require('../services/kurs.service')

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data })
}

function errorResponse(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message }
  })
}

function mapServiceError(error) {
  return {
    status: error.status || 500,
    code: error.code || 'KURS_ERROR',
    message: error.message
  }
}

async function getKurs(req, res) {
  const mataUang = req.query.mata_uang || 'USD'

  try {
    const [latest, history] = await Promise.all([
      kursService.getLatestKurs(mataUang),
      kursService.listKursHistory(mataUang)
    ])

    return success(res, { latest, history })
  } catch (error) {
    const mapped = mapServiceError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function updateKurs(req, res) {
  const { mata_uang = 'USD', kurs_idr, berlaku_mulai } = req.body

  if (berlaku_mulai !== undefined && (typeof berlaku_mulai !== 'string' || berlaku_mulai.trim() === '')) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'berlaku_mulai wajib berupa tanggal string')
  }

  try {
    const data = await kursService.createKurs({
      mata_uang,
      kurs_idr,
      berlaku_mulai,
      dibuat_oleh: req.user.id
    })

    return success(res, data, 201)
  } catch (error) {
    const mapped = mapServiceError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

module.exports = {
  getKurs,
  updateKurs
}
