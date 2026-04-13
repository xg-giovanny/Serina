import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'serina-dev-secret-change-in-production'

/**
 * Genera un JWT seguro
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

/**
 * Verifica un JWT
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

/**
 * Middleware: Protege rutas extrayendo userId del JWT
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado' })
  }

  // Inyectar datos del usuario en el request
  req.userId = decoded.id
  req.username = decoded.username
  next()
}
