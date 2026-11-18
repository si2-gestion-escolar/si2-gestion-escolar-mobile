import { isAxiosError } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  formatoMonto, generarQR, listarCuotasPendientes, verificarQR, type CuotaPendiente, type SolicitudQR,
} from '../api/pagos'

const INTERVALO_VERIFICACION_MS = 6000

const mensajeError = (error: unknown, respaldo: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      const texto = Object.values(data as Record<string, unknown>).flat().join(' ')
      if (texto) return texto
    }
  }
  return respaldo
}

export default function PagosScreen() {
  const [cuotas, setCuotas] = useState<CuotaPendiente[]>([])
  const [seleccion, setSeleccion] = useState<number[]>([])
  const [solicitud, setSolicitud] = useState<SolicitudQR | null>(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const verificando = useRef(false)

  const cargar = useCallback(() => listarCuotasPendientes()
    .then((pendientes) => {
      setCuotas(pendientes)
      setSeleccion([])
    })
    .catch(() => setError('No fue posible cargar las cuotas. Verifique su conexión.'))
    .finally(() => setCargando(false)), [])

  useEffect(() => { void cargar() }, [cargar])

  const verificar = useCallback(async (id: number, silencioso = false) => {
    if (verificando.current) return
    verificando.current = true
    if (!silencioso) {
      setEnviando(true)
      setError('')
    }
    try {
      const { data } = await verificarQR(id)
      setSolicitud((actual) => actual?.id === id ? data : actual)
    } catch (e) {
      if (!silencioso) setError(mensajeError(e, 'No fue posible consultar el pago.'))
    } finally {
      verificando.current = false
      if (!silencioso) setEnviando(false)
    }
  }, [])

  // La pantalla se actualiza cuando la pasarela confirma el pago.
  useEffect(() => {
    if (solicitud?.estado !== 'PENDIENTE') return
    const temporizador = setInterval(() => void verificar(solicitud.id, true), INTERVALO_VERIFICACION_MS)
    return () => clearInterval(temporizador)
  }, [solicitud?.estado, solicitud?.id, verificar])

  const estudianteElegido = cuotas.find((cuota) => seleccion.includes(cuota.id))?.estudiante
  const alternar = (cuota: CuotaPendiente) => {
    setError('')
    if (estudianteElegido && estudianteElegido !== cuota.estudiante) {
      setError('Pague por separado las cuotas de cada estudiante.')
      return
    }
    setSeleccion((actual) => (actual.includes(cuota.id) ? actual.filter((id) => id !== cuota.id) : [...actual, cuota.id]))
  }
  const total = cuotas.filter((cuota) => seleccion.includes(cuota.id)).reduce((suma, cuota) => suma + Number(cuota.saldo), 0)

  const pagar = async () => {
    if (!estudianteElegido) return
    setEnviando(true)
    setError('')
    try {
      const { data } = await generarQR(estudianteElegido, seleccion)
      setSolicitud(data)
    } catch (e) {
      setError(mensajeError(e, 'No fue posible generar el QR. Intente de nuevo.'))
    } finally {
      setEnviando(false)
    }
  }
  const volver = () => {
    setSolicitud(null)
    setCargando(true)
    setError('')
    void cargar()
  }

  if (cargando) {
    return <View style={estilos.centro}><ActivityIndicator size="large" color="#059669" /></View>
  }

  if (solicitud) {
    const pendiente = solicitud.estado === 'PENDIENTE'
    return (
      <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.qrContenido}>
        <Text style={estilos.nombre}>{solicitud.estudiante_nombre}</Text>
        <Text style={estilos.detalle}>{solicitud.conceptos.join(', ')}</Text>
        <Text style={estilos.monto}>{formatoMonto(solicitud.monto)}</Text>
        {pendiente ? (
          <>
            <Image accessibilityLabel="Código QR del pago" source={{ uri: solicitud.qr_url }} style={estilos.qr} resizeMode="contain" />
            <Text style={estilos.detalle}>
              {solicitud.simulado
                ? 'Pago de demostración. Solicite a Tesorería que confirme el cobro desde el portal web.'
                : 'Escanee el QR desde la app de su banco.'}
              {' '}Válido hasta las {new Date(solicitud.expira_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.
            </Text>
            <Pressable style={estilos.boton} disabled={enviando} onPress={() => void verificar(solicitud.id)}>
              {enviando ? <ActivityIndicator size="small" color="#fff" /> : (
                <Text style={estilos.botonTexto}>{solicitud.simulado ? 'Comprobar confirmación' : 'Ya pagué, verificar'}</Text>
              )}
            </Pressable>
          </>
        ) : solicitud.estado === 'PAGADA' ? (
          <View style={estilos.exito}>
            <Text style={estilos.exitoTitulo}>Pago confirmado</Text>
            <Text style={estilos.exitoTexto}>Recibo N.º {String(solicitud.numero_recibo ?? 0).padStart(6, '0')}</Text>
          </View>
        ) : (
          <View style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>
              {solicitud.estado === 'EXPIRADA'
                ? 'El QR expiró sin registrarse el pago. Genere uno nuevo.'
                : solicitud.estado === 'OBSERVADA'
                  ? 'El pago quedó en revisión. La secretaría del colegio lo conciliará.'
                  : 'El QR fue anulado.'}
            </Text>
          </View>
        )}
        {!!error && <Text style={estilos.error}>{error}</Text>}
        <Pressable style={estilos.secundario} disabled={enviando} onPress={volver}>
          <Text style={estilos.secundarioTexto}>Volver a mis cuotas</Text>
        </Pressable>
      </ScrollView>
    )
  }

  return (
    <View style={estilos.contenedor}>
      <ScrollView contentContainerStyle={estilos.listaContenido}>
        {cuotas.length === 0 && !error && <Text style={estilos.vacio}>No tiene cuotas pendientes de pago.</Text>}
        {cuotas.map((cuota) => {
          const marcada = seleccion.includes(cuota.id)
          return (
            <Pressable key={cuota.id} style={[estilos.tarjeta, marcada && estilos.tarjetaMarcada]} onPress={() => alternar(cuota)}>
              <View style={estilos.fila}>
                <Text style={estilos.nombre}>{cuota.concepto}</Text>
                <Text style={estilos.saldo}>{formatoMonto(cuota.saldo)}</Text>
              </View>
              <Text style={estilos.detalle}>{cuota.estudiante_nombre} · {cuota.plan_nombre}</Text>
              <Text style={cuota.vencida ? estilos.vencida : estilos.detalle}>
                {cuota.vencida ? 'Vencida el ' : 'Vence el '}{cuota.fecha_vencimiento}
              </Text>
            </Pressable>
          )
        })}
        {!!error && <Text style={estilos.error}>{error}</Text>}
      </ScrollView>
      {cuotas.length > 0 && (
        <Pressable style={[estilos.boton, seleccion.length === 0 && estilos.botonInactivo]} disabled={seleccion.length === 0 || enviando} onPress={() => void pagar()}>
          {enviando ? <ActivityIndicator size="small" color="#fff" /> : (
            <Text style={estilos.botonTexto}>
              {seleccion.length === 0 ? 'Seleccione las cuotas a pagar' : `Pagar ${formatoMonto(total)} con QR`}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  contenedor: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
  listaContenido: { gap: 12, paddingBottom: 24 },
  qrContenido: { gap: 12, alignItems: 'center', paddingBottom: 24 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 4 },
  tarjetaMarcada: { borderColor: '#059669', borderWidth: 2, backgroundColor: '#ecfdf5' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  nombre: { fontWeight: '700', color: '#1e293b', flexShrink: 1 },
  saldo: { fontWeight: '700', color: '#1e293b' },
  detalle: { color: '#64748b', textAlign: 'left' },
  vencida: { color: '#dc2626', fontWeight: '600' },
  monto: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  qr: { width: 260, height: 260, backgroundColor: '#fff', borderRadius: 12 },
  boton: { backgroundColor: '#059669', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', alignSelf: 'stretch' },
  botonInactivo: { backgroundColor: '#94a3b8' },
  botonTexto: { color: '#fff', fontWeight: '700' },
  secundario: { padding: 12 },
  secundarioTexto: { color: '#1d4ed8', fontWeight: '600' },
  exito: { backgroundColor: '#ecfdf5', borderRadius: 12, padding: 20, alignItems: 'center', alignSelf: 'stretch', gap: 4 },
  exitoTitulo: { color: '#047857', fontWeight: '800', fontSize: 18 },
  exitoTexto: { color: '#047857' },
  aviso: { backgroundColor: '#fffbeb', borderRadius: 12, padding: 16, alignSelf: 'stretch' },
  avisoTexto: { color: '#92400e', textAlign: 'center' },
  vacio: { color: '#94a3b8', fontStyle: 'italic' },
  error: { color: '#dc2626', textAlign: 'center' },
})
