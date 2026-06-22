import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('divre_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401 || status === 403) {
      localStorage.removeItem('divre_token')
      localStorage.removeItem('divre_user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export const masterAPI = {
  getCoa(params) {
    return api.get('/api/master/coa', { params })
  },
  createCoa(payload) {
    return api.post('/api/master/coa', payload)
  },
  updateCoa(kodeSeg5, payload) {
    return api.patch(`/api/master/coa/${kodeSeg5}`, payload)
  },
  getCabang(params) {
    return api.get('/api/master/cabang', { params })
  },
  createCabang(payload) {
    return api.post('/api/master/cabang', payload)
  },
  updateCabang(id, payload) {
    return api.patch(`/api/master/cabang/${id}`, payload)
  },
  getUsers(params) {
    return api.get('/api/master/user', { params })
  },
  createUser(payload) {
    return api.post('/api/master/user', payload)
  },
  updateUser(id, payload) {
    return api.patch(`/api/master/user/${id}`, payload)
  },
  getSeg7(params) {
    return api.get('/api/master/seg7', { params })
  },
  getSeg8(params) {
    return api.get('/api/master/seg8', { params })
  },
  getSeg9(params) {
    return api.get('/api/master/seg9', { params })
  }
}

export const proyekAPI = {
  getProyek(params) {
    return api.get('/api/proyek', { params })
  },
  getProyekById(id) {
    return api.get(`/api/proyek/${id}`)
  },
  createProyek(payload) {
    return api.post('/api/proyek', payload)
  },
  updateProyek(id, payload) {
    return api.patch(`/api/proyek/${id}`, payload)
  },
  archiveProyek(id) {
    return api.delete(`/api/proyek/${id}`)
  }
}

export const rabAPI = {
  getRab(projectId) {
    return api.get(`/api/proyek/${projectId}/rab`)
  },
  createRab(projectId, payload) {
    return api.post(`/api/proyek/${projectId}/rab`, payload)
  },
  updateRab(itemId, payload) {
    return api.patch(`/api/rab/${itemId}`, payload)
  },
  deleteRab(itemId) {
    return api.delete(`/api/rab/${itemId}`)
  }
}

export const realisasiAPI = {
  getRealisasi(projectId) {
    return api.get(`/api/proyek/${projectId}/realisasi`)
  },
  createRealisasi(itemId, payload) {
    return api.post(`/api/rab/${itemId}/realisasi`, payload)
  },
  updateRealisasi(id, payload) {
    return api.patch(`/api/realisasi/${id}`, payload)
  },
  deleteRealisasi(id) {
    return api.delete(`/api/realisasi/${id}`)
  }
}

export const dashboardAPI = {
  getSummary(params) {
    return api.get('/api/dashboard/summary', { params })
  },
  getByCabang(params) {
    return api.get('/api/dashboard/by-cabang', { params })
  }
}

export const auditAPI = {
  getAuditLogs(params) {
    return api.get('/api/audit-log', { params })
  }
}

export default api
