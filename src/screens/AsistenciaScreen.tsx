import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { obtenerResumenAsistencia, type ResumenAsistencia } from '../api/asistencia'

export default function AsistenciaScreen() {
  const [resumen, setResumen] = useState<ResumenAsistencia[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const { data } = await obtenerResumenAsistencia()
      setResumen(data)
    } catch {
      setError('No fue posible cargar la asistencia. Verifique su conexión.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  if (cargando) {
    return <View style={estilos.centro}><ActivityIndicator size="large" color="#d97706" /></View>
  }
  if (error) {
    return <View style={estilos.centro}><Text style={estilos.error}>{error}</Text></View>
  }
  if (resumen.length === 0) {
    return <View style={estilos.centro}><Text style={estilos.vacio}>Todavía no hay registros de asistencia.</Text></View>
  }

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.listaContenido}>
      {resumen.map((fila) => (
        <View key={fila.estudiante} style={estilos.tarjeta}>
          <Text style={estilos.nombre}>{fila.nombre} {fila.apellido}</Text>
          {fila.curso && <Text style={estilos.curso}>{fila.curso}</Text>}
          <Text style={estilos.porcentaje}>{fila.porcentaje_asistencia}% de asistencia</Text>
          <View style={estilos.detalleFila}>
            <Detalle etiqueta="Presentes" valor={fila.presentes} />
            <Detalle etiqueta="Ausentes" valor={fila.ausentes} />
            <Detalle etiqueta="Atrasos" valor={fila.tardes} />
            <Detalle etiqueta="Licencias" valor={fila.licencias} />
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

function Detalle({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <View style={estilos.detalleItem}>
      <Text style={estilos.detalleValor}>{valor}</Text>
      <Text style={estilos.detalleEtiqueta}>{etiqueta}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  contenedor: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
  listaContenido: { gap: 12, paddingBottom: 24 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 6 },
  nombre: { fontWeight: '700', fontSize: 16, color: '#1e293b' },
  curso: { color: '#64748b' },
  porcentaje: { fontWeight: '700', color: '#d97706', fontSize: 15, marginTop: 4 },
  detalleFila: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  detalleItem: { alignItems: 'center', flex: 1 },
  detalleValor: { fontWeight: '700', color: '#1e293b', fontSize: 16 },
  detalleEtiqueta: { color: '#94a3b8', fontSize: 12 },
  vacio: { color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' },
  error: { color: '#dc2626', textAlign: 'center' },
})
