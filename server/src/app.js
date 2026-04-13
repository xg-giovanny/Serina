import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

// rutas de la api
import getRoutes from './routes/get.routes.js'
import postRoutes from './routes/post.routes.js'
import putRoutes from './routes/put.routes.js'
import cleanRoutes from './routes/delete.routes.js'

const app = express()

// Middlewares
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rutas EnelSigc Style
app.use(getRoutes)
app.use(postRoutes)
app.use(putRoutes)
app.use(cleanRoutes)

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  })
})

export default app
