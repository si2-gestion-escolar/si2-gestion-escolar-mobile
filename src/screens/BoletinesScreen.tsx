import * as Sharing from 'expo-sharing'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { descargarBoletin, listarMisBoletines, type BoletinEmitido } from '../api/documentos'

export default function BoletinesScreen() {
  const [boletines, setBoletines] = useState<BoletinEmitido[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [descargandoId, setDescargandoId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const { data } = await listarMisBoletines()
      setBoletines(data)
    } catch {
      setError('No fue posible cargar los boletines. Verifique su conexión.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  const abrir = async (boletin: BoletinEmitido) => {
    setDescargandoId(boletin.id)
    try {
      const nombreArchivo = `boletin_${boletin.id}_v${boletin.version}.pdf`
      const uri = await descargarBoletin(boletin.id, nombreArchivo)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Boletín' })
      }
    } catch {
      setError('No fue posible descargar el boletín. Intente de nuevo.')
    } finally {
      setDescargandoId(null)
    }
  }

  if (cargando) {
    return <View style={estilos.centro}><ActivityIndicator size="large" color="#7c3aed" /></View>
  }

  if (error) {
    return <View style={estilos.centro}><Text style={estilos.error}>{error}</Text></View>
  }

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.listaContenido}>
      {boletines.length === 0 && (
        <Text style={estilos.vacio}>Todavía no hay boletines emitidos.</Text>
      )}
      {boletines.map((boletin) => (
        <View key={boletin.id} style={estilos.tarjeta}>
          <Text style={estilos.nombre}>{boletin.estudiante_nombre}</Text>
          <Text style={estilos.detalle}>
            {boletin.periodo_nombre ?? 'Anual'} · gestión {boletin.gestion_anio}
          </Text>
          <Pressable
            style={estilos.boton}
            disabled={descargandoId === boletin.id}
            onPress={() => void abrir(boletin)}
          >
            {descargandoId === boletin.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={estilos.botonTexto}>Descargar / abrir PDF</Text>
            )}
          </Pressable>
        </View>
      ))}
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  contenedor: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
  listaContenido: { gap: 12, paddingBottom: 24 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 6 },
  nombre: { fontWeight: '700', color: '#1e293b' },
  detalle: { color: '#64748b' },
  boton: { backgroundColor: '#7c3aed', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  botonTexto: { color: '#fff', fontWeight: '600' },
  vacio: { color: '#94a3b8', fontStyle: 'italic' },
  error: { color: '#dc2626', textAlign: 'center' },
})
