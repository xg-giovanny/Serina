import supabase from '../database.js'

export const deleteNomina = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('nomina')
      .delete()
      .eq('id', id)
      .eq('id_usuario', req.userId)

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteCarta = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('cartas')
      .delete()
      .eq('id', id)
      .eq('id_usuario', req.userId)

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
