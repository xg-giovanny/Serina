import supabase from '../database.js'
import { generateToken } from '../middlewares/auth.js'

export const loginUsuario = async (req, res) => {
  try {
    const { username, password } = req.body
    console.log(`🔐 Intento de login: "${username}"`)

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' })
    }

    const { data: allowed, error: attemptsError } = await supabase.rpc('check_login_attempts', { p_username: username })
    
    if (allowed === false) {
      const { data: attemptData } = await supabase
        .from('login_attempts')
        .select('locked_until')
        .eq('username', username)
        .single()

      const minutesLeft = attemptData?.locked_until
        ? Math.ceil((new Date(attemptData.locked_until) - new Date()) / 60000)
        : 15

      return res.status(429).json({
        success: false,
        error: `Demasiados intentos. Intenta de nuevo en ${minutesLeft} minutos.`
      })
    }

    const { data, error } = await supabase.rpc('verify_credentials', {
      p_username: username,
      p_password: password
    })

    if (error) {
      await supabase.rpc('record_login_attempt', { p_username: username, p_success: false })
      return res.status(401).json({ success: false, error: 'Credenciales erróneas' })
    }

    if (data && data.length > 0) {
      const user = data[0]

      if (user.status !== 1) {
        await supabase.rpc('record_login_attempt', { p_username: username, p_success: false })
        return res.status(403).json({ success: false, error: 'Tu cuenta está inactiva.' })
      }

      await supabase.rpc('record_login_attempt', { p_username: username, p_success: true })

      const token = generateToken({
        id: user.id_usuario,
        username: user.username,
        status: user.status
      })

      return res.json({
        success: true,
        user: {
          id: user.id_usuario,
          username: user.username,
          status: user.status,
          created_at: user.created_at
        },
        token
      })
    }

    await supabase.rpc('record_login_attempt', { p_username: username, p_success: false })
    return res.status(401).json({ success: false, error: 'Credenciales erróneas' })
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export const registerUsuario = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ success: false, error: 'Usuario solo puede contener letras, números y guiones bajos' })
    }

    const { data, error } = await supabase.rpc('register_user', {
      p_username: username,
      p_password: password
    })

    if (error) {
      if (error.message.includes('ya existe')) {
        return res.status(409).json({ success: false, error: 'El usuario ya existe' })
      }
      throw error
    }

    return res.status(201).json({
      success: true,
      user: { id: data, username }
    })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' })
  }
}

export const createNomina = async (req, res) => {
  try {
    const { nombre, precio, categoria, metodo_pago, fecha } = req.body

    if (!nombre || precio === undefined) {
      return res.status(400).json({ success: false, error: 'Nombre y precio son requeridos' })
    }

    const { data, error } = await supabase
      .from('nomina')
      .insert([{ nombre, precio, categoria, metodo_pago, fecha, id_usuario: req.userId }])
      .select()

    if (error) throw error
    res.status(201).json({ success: true, data: data[0] })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const importCartasBulk = async (req, res) => {
  try {
    const { cartas } = req.body

    if (!Array.isArray(cartas) || cartas.length === 0) {
      return res.status(400).json({ success: false, error: 'Se requiere un array de cartas' })
    }

    const cartasWithUser = cartas.map(carta => ({
      ...carta,
      id_usuario: req.userId
    }))

    const { data, error } = await supabase
      .from('cartas')
      .insert(cartasWithUser)
      .select()

    if (error) throw error
    res.status(201).json({ success: true, data, count: data.length })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
