const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')
const testRoutes = require('./routes/test.routes')

const app = express()
const PORT = process.env.PORT || 3001
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

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
