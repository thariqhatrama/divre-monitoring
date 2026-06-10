const auditModel = require('../models/audit.model')

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data })
}

function errorResponse(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message }
  })
}

async function listAuditLogs(req, res) {
  try {
    const data = await auditModel.listAuditLogs(req.query)
    return success(res, data)
  } catch (error) {
    return errorResponse(res, 500, 'AUDIT_LOG_ERROR', error.message)
  }
}

module.exports = {
  listAuditLogs
}
