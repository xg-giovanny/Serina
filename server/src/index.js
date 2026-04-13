import dotenv from 'dotenv'
// En Docker las variables llegan via env_file en docker-compose
// dotenv solo se usa para desarrollo local sin Docker
dotenv.config({ path: '.env' })
dotenv.config({ path: '../.env' })

import app from './app.js'

const PORT = process.env.PORT || 4000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serina API corriendo en puerto ${PORT}`)
})
