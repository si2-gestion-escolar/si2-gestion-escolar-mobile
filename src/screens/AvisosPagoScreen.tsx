import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { leerAvisoPago, leerTodosLosAvisosPago, listarAvisosPago, type AvisoPago } from '../api/pagos'

const ETIQUETAS: Record<string, string> = {
  COMUNICADO: 'Comunicado', PAGO: 'Pago', BECA: 'Beca', MOROSIDAD: 'Cuotas vencidas',
  RECORDATORIO_PAGO: 'Recordatorio', BOLETIN: 'Boletín',
}

const fechaCorta = (iso: string) => {
  const fecha = new Date(iso)
  return `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString().slice(0, 5)}`
}

export default function AvisosPagoScreen() {
  const [avisos, setAvisos] = useState<AvisoPago[]>([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setError('')
    try {
      setAvisos(await listarAvisosPago())
    } catch {
      setError('No fue posible cargar los avisos. Verifique su conexión.')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  const abrir = async (aviso: AvisoPago) => {
    if (aviso.leida) return
    setAvisos((actuales) => actuales.map((a) => (a.id === aviso.id ? { ...a, leida: true } : a)))
    try {
      await leerAvisoPago(aviso.id)
    } catch {
      setAvisos((actuales) => actuales.map((a) => (a.id === aviso.id ? { ...a, leida: false } : a)))
    }
  }

  const leerTodos = async () => {
    try {
      await leerTodosLosAvisosPago()
      setAvisos((actuales) => actuales.map((a) => ({ ...a, leida: true })))
    } catch {
      setError('No fue posible marcar los avisos como leídos.')
    }
  }

  if (cargando) {
    return <View style={estilos.centro}><ActivityIndicator size="large" color="#0284c7" /></View>
  }

  const sinLeer = avisos.filter((aviso) => !aviso.leida).length
  return (
    <ScrollView
      style={estilos.contenedor}
      contentContainerStyle={estilos.listaContenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); void cargar() }} />}
    >
      {!!error && <Text style={estilos.error}>{error}</Text>}
      {sinLeer > 0 && (
        <Pressable onPress={() => void leerTodos()}>
          <Text style={estilos.enlace}>Marcar los {sinLeer} como leídos</Text>
        </Pressable>
      )}
      {avisos.length === 0 && !error && <Text style={estilos.vacio}>No tiene avisos de pago todavía.</Text>}
      {avisos.map((aviso) => (
        <Pressable key={aviso.id} style={[estilos.tarjeta, !aviso.leida && estilos.sinLeer]} onPress={() => void abrir(aviso)}>
          <View style={estilos.fila}>
            <Text style={estilos.etiqueta}>{ETIQUETAS[aviso.tipo] ?? aviso.tipo}</Text>
            <Text style={estilos.fecha}>{fechaCorta(aviso.fecha)}</Text>
          </View>
          <Text style={[estilos.titulo, !aviso.leida && estilos.tituloSinLeer]}>{aviso.titulo}</Text>
          <Text style={estilos.mensaje}>{aviso.mensaje}</Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  contenedor: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
  listaContenido: { gap: 12, paddingBottom: 24 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 4 },
  sinLeer: { borderColor: '#0284c7', backgroundColor: '#f0f9ff' },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  etiqueta: { color: '#0369a1', fontSize: 12, fontWeight: '700' },
  fecha: { color: '#94a3b8', fontSize: 12 },
  titulo: { color: '#1e293b', fontWeight: '600' },
  tituloSinLeer: { fontWeight: '800' },
  mensaje: { color: '#475569' },
  enlace: { color: '#1d4ed8', fontWeight: '600', textAlign: 'right' },
  vacio: { color: '#94a3b8', fontStyle: 'italic' },
  error: { color: '#dc2626', textAlign: 'center' },
})
