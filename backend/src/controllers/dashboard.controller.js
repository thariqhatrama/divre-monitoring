const dashboardModel = require('../models/dashboard.model')
const {
  calculateProjectValueIdr,
  calculateRealisasiMargin,
  getMarginStatus
} = require('../services/margin.service')

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data })
}

function errorResponse(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message }
  })
}

function toNumber(value) {
  const numberValue = Number(value || 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function average(numbers = []) {
  const validNumbers = numbers.filter((number) => Number.isFinite(number))
  if (!validNumbers.length) return null

  const total = validNumbers.reduce((sum, number) => sum + number, 0)
  return Math.round((total / validNumbers.length) * 100) / 100
}

function groupByProjectId(items = []) {
  return items.reduce((grouped, item) => {
    if (!grouped[item.project_id]) {
      grouped[item.project_id] = []
    }

    grouped[item.project_id].push(item)
    return grouped
  }, {})
}

function buildBranchMap(branches = []) {
  return branches.reduce((mapped, branch) => {
    mapped[branch.id] = branch
    return mapped
  }, {})
}

function enrichProjects(projects = [], rabItems = [], realisasiItems = [], branches = []) {
  const rabByProject = groupByProjectId(rabItems)
  const realisasiByProject = groupByProjectId(realisasiItems)
  const branchMap = buildBranchMap(branches)

  return projects.map((project) => {
    const projectRabItems = rabByProject[project.id] || []
    const projectRealisasiItems = realisasiByProject[project.id] || []
    const margin = calculateRealisasiMargin(project, projectRabItems, projectRealisasiItems)
    const marginRab = margin.margin_rab || {}
    const branch = branchMap[project.cabang_id] || null
    const statusMargin = margin.status_margin || marginRab.status_margin || getMarginStatus(marginRab.margin_persen)

    return {
      ...project,
      cabang: branch,
      nilai_proyek_idr: calculateProjectValueIdr(project),
      total_rab_idr: toNumber(marginRab.total_rab_idr),
      total_realisasi_idr: toNumber(margin.total_realisasi_idr),
      margin_rab: marginRab.margin_persen,
      margin_realisasi: margin.margin_realisasi,
      delta_margin: margin.delta_margin,
      indikator_delta: margin.indikator_delta,
      status_margin: statusMargin,
      rab_locked: false
    }
  })
}

function applyStatusMarginFilter(projects = [], statusMargin) {
  if (!statusMargin) {
    return projects
  }

  if (statusMargin === 'kritis_rugi') {
    return projects.filter((project) => ['kritis', 'rugi'].includes(project.status_margin))
  }

  return projects.filter((project) => project.status_margin === statusMargin)
}

function resolveDashboardFilters(req) {
  const filters = { ...req.query }

  if (req.user.role === 'pm') {
    if (!req.user.cabang_id) {
      const error = new Error('PM belum memiliki cabang_id')
      error.status = 403
      error.code = 'FORBIDDEN'
      throw error
    }

    filters.cabang_id = req.user.cabang_id
  }

  return filters
}

async function getDashboardData(filters = {}) {
  const projects = await dashboardModel.listDashboardProjects(filters)
  const projectIds = projects.map((project) => project.id)
  const [branches, rabItems, realisasiItems] = await Promise.all([
    dashboardModel.listBranches(),
    dashboardModel.listRabItemsByProjectIds(projectIds),
    dashboardModel.listRealisasiItemsByProjectIds(projectIds)
  ])

  const enrichedProjects = enrichProjects(projects, rabItems, realisasiItems, branches)
  const filteredProjects = applyStatusMarginFilter(enrichedProjects, filters.status_margin)

  return {
    projects: filteredProjects,
    branches
  }
}

async function getSummary(req, res) {
  try {
    const filters = resolveDashboardFilters(req)
    const { projects, branches } = await getDashboardData(filters)
    const activeProjects = projects.filter((project) => project.status === 'aktif')
    const criticalLossProjects = projects.filter((project) => ['kritis', 'rugi'].includes(project.status_margin))

    return success(res, {
      total_proyek_aktif: activeProjects.length,
      total_nilai_proyek: projects.reduce((sum, project) => sum + toNumber(project.nilai_proyek_idr), 0),
      rata_margin_rab: average(projects.map((project) => project.margin_rab)),
      rata_margin_realisasi: average(projects.map((project) => project.margin_realisasi)),
      jumlah_proyek_kritis_rugi: criticalLossProjects.length,
      branches,
      projects
    })
  } catch (error) {
    return errorResponse(res, error.status || 500, error.code || 'DASHBOARD_ERROR', error.message)
  }
}

async function getByCabang(req, res) {
  try {
    const filters = resolveDashboardFilters(req)
    const { projects, branches } = await getDashboardData(filters)
    const branchMap = buildBranchMap(branches)
    const grouped = new Map()

    for (const project of projects) {
      const branchId = project.cabang_id || 'tanpa-cabang'
      const current = grouped.get(branchId) || {
        cabang_id: project.cabang_id,
        kode_seg23: branchMap[project.cabang_id]?.kode_seg23 || '-',
        nama_cabang: branchMap[project.cabang_id]?.nama || 'Tanpa cabang',
        total_proyek: 0,
        total_nilai_proyek: 0,
        margin_rab_values: [],
        margin_realisasi_values: [],
        jumlah_kritis_rugi: 0
      }

      current.total_proyek += 1
      current.total_nilai_proyek += toNumber(project.nilai_proyek_idr)
      if (Number.isFinite(project.margin_rab)) current.margin_rab_values.push(project.margin_rab)
      if (Number.isFinite(project.margin_realisasi)) current.margin_realisasi_values.push(project.margin_realisasi)
      if (['kritis', 'rugi'].includes(project.status_margin)) current.jumlah_kritis_rugi += 1
      grouped.set(branchId, current)
    }

    const data = Array.from(grouped.values()).map((item) => ({
      cabang_id: item.cabang_id,
      kode_seg23: item.kode_seg23,
      nama_cabang: item.nama_cabang,
      total_proyek: item.total_proyek,
      total_nilai_proyek: item.total_nilai_proyek,
      rata_margin_rab: average(item.margin_rab_values),
      rata_margin_realisasi: average(item.margin_realisasi_values),
      jumlah_kritis_rugi: item.jumlah_kritis_rugi
    }))

    return success(res, data)
  } catch (error) {
    return errorResponse(res, error.status || 500, error.code || 'DASHBOARD_ERROR', error.message)
  }
}

module.exports = {
  getSummary,
  getByCabang
}
