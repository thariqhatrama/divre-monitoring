const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')
const kursRoutes = require('./routes/kurs.routes')
const masterRoutes = require('./routes/master.routes')
const proyekRoutes = require('./routes/proyek.routes')
const rabRoutes = require('./routes/rab.routes')
const realisasiRoutes = require('./routes/realisasi.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const testRoutes = require('./routes/test.routes')

const app = express()
const PORT = process.env.PORT || 3001
const defaultCorsOrigin = process.env.NODE_ENV === 'production'
  ? 'https://divre-monitoring.vercel.app'
  : 'http://localhost:5173'
const corsOrigin = process.env.CORS_ORIGIN || defaultCorsOrigin

app.use(helmet())
app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'divre-api'
    }
  })
})

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Divre Monitoring API'
    }
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/master', masterRoutes)
app.use('/api/kurs', kursRoutes)
app.use('/api/proyek', proyekRoutes)
app.use('/api', rabRoutes)
app.use('/api', realisasiRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/test', testRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint tidak ditemukan'
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
