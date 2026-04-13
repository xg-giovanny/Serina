import supabase from '../database.js'

export const getNomina = async (req, res) => {
  try {
    let query = supabase
      .from('nomina')
      .select('*')
      .eq('id_usuario', req.userId)
      .order('created_at', { ascending: false })

    const { categoria, fechaInicio, fechaFin, busqueda } = req.query

    if (categoria) query = query.eq('categoria', categoria)
    if (fechaInicio && fechaFin) query = query.gte('fecha', fechaInicio).lte('fecha', fechaFin)
    if (busqueda) query = query.ilike('nombre', `%${busqueda}%`)

    const { data, error } = await query
    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getNominaStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nomina')
      .select('precio, categoria, metodo_pago, fecha, created_at')
      .eq('id_usuario', req.userId)

    if (error) throw error

    const totalGastos = data.reduce((sum, item) => sum + (item.precio || 0), 0)

    const gastosPorCategoria = data.reduce((acc, item) => {
      const cat = item.categoria || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + (item.precio || 0)
      return acc
    }, {})

    const gastosPorMetodo = data.reduce((acc, item) => {
      const metodo = item.metodo_pago || 'Sin método'
      acc[metodo] = (acc[metodo] || 0) + (item.precio || 0)
      return acc
    }, {})

    res.json({
      success: true,
      stats: {
        totalGastos,
        cantidadRegistros: data.length,
        gastosPorCategoria,
        gastosPorMetodo,
        ultimosMovimientos: data.slice(0, 5)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getCartas = async (req, res) => {
  try {
    let query = supabase
      .from('cartas')
      .select('*')
      .eq('id_usuario', req.userId)
      .order('character', { ascending: true })

    const { serie, calidad, busqueda } = req.query

    if (serie) query = query.eq('series', serie)
    if (calidad) query = query.eq('quality', calidad)
    if (busqueda) query = query.ilike('character', `%${busqueda}%`)

    const { data, error } = await query
    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getCartasStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cartas')
      .select('series, quality, burnValue')
      .eq('id_usuario', req.userId)

    if (error) throw error

    const porSerie = data.reduce((acc, item) => {
      if (item.series) acc[item.series] = (acc[item.series] || 0) + 1
      return acc
    }, {})

    const porCalidad = data.reduce((acc, item) => {
      if (item.quality) acc[item.quality] = (acc[item.quality] || 0) + 1
      return acc
    }, {})

    const totalBurnValue = data.reduce((sum, item) => sum + (parseFloat(item.burnValue) || 0), 0)

    res.json({
      success: true,
      stats: {
        totalCartas: data.length,
        porSerie,
        porCalidad,
        totalBurnValue
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
