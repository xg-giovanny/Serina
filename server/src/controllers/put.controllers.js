import supabase from '../database.js'

export const updateNomina = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('nomina')
      .update(updates)
      .eq('id', id)
      .eq('id_usuario', req.userId)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: 'Registro no encontrado' })
    }

    res.json({ success: true, data: data[0] })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
