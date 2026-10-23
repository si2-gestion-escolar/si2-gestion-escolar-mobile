import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { obtenerMisResultados, type HijoDisponible, type MisResultados } from '../api/resultados'

export default function NotasScreen() {
  const [datos, setDatos] = useState<MisResultados | null>(null)
  const [hijosDisponibles, setHijosDisponibles] = useState<HijoDisponible[] | null>(null)
  const [estudianteId, setEstudianteId] = useState<number | undefined>(undefined)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async (id?: number) => {
    setCargando(true)
    setError('')
    try {
      const { data } = await obtenerMisResultados(id)
      setDatos(data)
    } catch (e) {
      const respuesta = axios.isAxiosError(e) ? e.response : undefined
      if (respuesta?.status === 400 && Array.isArray(respuesta.data?.hijos)) {
        setHijosDisponibles(respuesta.data.hijos)
        setDatos(null)
      } else {
        setError('No fue posible cargar las notas. Verifique su conexión.')
      }
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { void cargar(estudianteId) }, [cargar, estudianteId])

  if (cargando) {
    return <View style={estilos.centro}><ActivityIndicator size="large" color="#7c3aed" /></View>
  }

  if (!datos && hijosDisponibles) {
    return (
      <View style={estilos.contenedor}>
        <Text style={estilos.titulo}>¿De cuál estudiante quieres ver las notas?</Text>
        {hijosDisponibles.map((hijo) => (
          <Pressable key={hijo.estudiante} style={estilos.opcion} onPress={() => setEstudianteId(hijo.estudiante)}>
            <Text style={estilos.opcionTexto}>{hijo.estudiante_nombre}</Text>
          </Pressable>
        ))}
      </View>
    )
  }

  if (error) {
    return <View style={estilos.centro}><Text style={estilos.error}>{error}</Text></View>
  }

  if (!datos) return null

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.listaContenido}>
      <Text style={estilos.titulo}>{datos.estudiante_nombre}</Text>
      <Text style={estilos.subtitulo}>{datos.curso}</Text>
      {hijosDisponibles && hijosDisponibles.length > 1 && (
        <Pressable onPress={() => setEstudianteId(undefined)}>
          <Text style={estilos.cambiar}>Ver notas de otro estudiante</Text>
        </Pressable>
      )}

      {datos.materias.length === 0 && (
        <Text style={estilos.vacio}>Todavía no hay materias registradas.</Text>
      )}

      {datos.materias.map((materia) => (
        <View key={materia.materia} style={estilos.tarjeta}>
          <Text style={estilos.materiaNombre}>{materia.materia_nombre}</Text>
          {materia.trimestrales.length === 0 ? (
            <Text style={estilos.vacio}>Sin notas registradas todavía.</Text>
          ) : (
            materia.trimestrales.map((trimestre) => (
              <View key={trimestre.periodo} style={estilos.fila}>
                <Text style={estilos.filaTexto}>{trimestre.periodo_nombre}</Text>
                <Text style={[estilos.filaValor, trimestre.condicion === 'APROBADO' ? estilos.aprobado : estilos.reprobado]}>
                  {trimestre.resultado} ({trimestre.condicion})
                </Text>
              </View>
            ))
          )}
          {materia.anual && (
            <View style={[estilos.fila, estilos.filaAnual]}>
              <Text style={estilos.filaTextoAnual}>Promedio anual</Text>
              <Text style={[estilos.filaValor, materia.anual.condicion === 'APROBADO' ? estilos.aprobado : estilos.reprobado]}>
                {materia.anual.resultado} ({materia.anual.condicion})
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  contenedor: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
  listaContenido: { gap: 12, paddingBottom: 24 },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  subtitulo: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  cambiar: { color: '#7c3aed', fontWeight: '600', marginBottom: 12 },
  opcion: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 10 },
  opcionTexto: { fontWeight: '600', color: '#1e293b' },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 6 },
  materiaNombre: { fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  filaAnual: { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 4, paddingTop: 8 },
  filaTexto: { color: '#475569' },
  filaTextoAnual: { color: '#1e293b', fontWeight: '600' },
  filaValor: { fontWeight: '600' },
  aprobado: { color: '#15803d' },
  reprobado: { color: '#dc2626' },
  vacio: { color: '#94a3b8', fontStyle: 'italic' },
  error: { color: '#dc2626', textAlign: 'center' },
})
