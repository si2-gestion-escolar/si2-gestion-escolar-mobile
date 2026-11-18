import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Directory, File, Paths } from 'expo-file-system'
import { isAvailableAsync, shareAsync } from 'expo-sharing'
import { descargarAdjunto, listarComunicados, marcarComunicadoLeido, obtenerComunicado, type Comunicado } from '../api/comunicaciones'

const lista = (data: { results?: Comunicado[] } | Comunicado[]) => Array.isArray(data) ? data : data.results ?? []
const base64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let encoded = ''
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0
    const second = bytes[index + 1] ?? 0
    const third = bytes[index + 2] ?? 0
    encoded += alphabet[first >> 2]
    encoded += alphabet[((first & 3) << 4) | (second >> 4)]
    encoded += index + 1 < bytes.length ? alphabet[((second & 15) << 2) | (third >> 6)] : '='
    encoded += index + 2 < bytes.length ? alphabet[third & 63] : '='
  }
  return encoded
}

export default function ComunicacionesScreen() {
  const [items, setItems] = useState<Comunicado[]>([])
  const [seleccionado, setSeleccionado] = useState<Comunicado | null>(null)
  const [preview, setPreview] = useState<{ id: number; uri: string; mime: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const cargar = useCallback(() => listarComunicados()
    .then(({ data }) => setItems(lista(data)))
    .catch((cause) => setError(cause?.response?.status === 403 ? 'No tiene permiso para ver comunicados.' : 'No fue posible cargar la bandeja.'))
    .finally(() => setLoading(false)), [])
  useEffect(() => { void cargar() }, [cargar])

  const volver = () => {
    setSeleccionado(null)
    setPreview(null)
    setLoading(true)
    setError('')
    void cargar()
  }

  const abrir = async (item: Comunicado) => {
    setError(''); setMensaje(''); setPreview(null); setOcupado(true)
    try {
      const { data } = await obtenerComunicado(item.id)
      setSeleccionado(data)
      if (!data.mi_leido_at) {
        await marcarComunicadoLeido(data.id)
        setSeleccionado({ ...data, mi_leido_at: new Date().toISOString() })
        setItems((current) => current.map((entry) => entry.id === data.id ? { ...entry, mi_leido_at: new Date().toISOString() } : entry))
      }
    } catch (cause) { setError((cause as { response?: { status?: number } })?.response?.status === 403 ? 'No tiene permiso para este comunicado.' : 'No fue posible abrir el comunicado.') }
    finally { setOcupado(false) }
  }
  const verAdjunto = async (id: number, mime: string) => {
    setError(''); setMensaje(''); setOcupado(true); setPreview(null)
    let pdf: File | null = null
    try {
      const { data } = await descargarAdjunto(id)
      if (mime === 'application/pdf') {
        const directory = new Directory(Paths.cache, 'comunicados')
        if (!directory.exists) directory.create({ intermediates: true, idempotent: true })
        pdf = new File(directory, `comunicado-${id}.pdf`)
        if (pdf.exists) pdf.delete()
        await pdf.write(data)
        if (!await isAvailableAsync()) throw new Error('SHARING_NOT_AVAILABLE')
        await shareAsync(pdf.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Abrir o guardar comunicado' })
        setMensaje('Se abri\u00f3 el men\u00fa del sistema para abrir o guardar el PDF.')
        return
      }
      if (!mime.startsWith('image/')) { setError('Este tipo de adjunto no est\u00e1 disponible en el m\u00f3vil.'); return }
      setPreview({ id, uri: `data:${mime};base64,${base64(data)}`, mime })
    } catch (cause) {
      const status = (cause as { response?: { status?: number } })?.response?.status
      setError(status === 403 ? 'No tiene permiso para este adjunto.' : status === 404 ? 'Este adjunto no est\u00e1 disponible.' : mime === 'application/pdf' ? 'No fue posible abrir o guardar el PDF.' : 'No fue posible descargar el adjunto.')
    } finally {
      try { if (pdf?.exists) pdf.delete() } catch { /* El sistema puede retener el archivo compartido temporalmente. */ }
      setOcupado(false)
    }
  }

  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.header}><Text style={styles.title}>Comunicados</Text><Pressable onPress={volver}><Text style={styles.link}>Actualizar / volver</Text></Pressable></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}{!!mensaje && <Text accessibilityRole="alert" style={styles.info}>{mensaje}</Text>}
    {loading ? <ActivityIndicator accessibilityLabel="Cargando comunicados"/> : seleccionado ? <View style={styles.card}>
      <Text style={styles.title}>{seleccionado.titulo}</Text><Text style={styles.meta}>{seleccionado.autor_nombre} · {seleccionado.publicado_at ? new Date(seleccionado.publicado_at).toLocaleDateString() : ''}</Text><Text style={styles.body}>{seleccionado.contenido}</Text>
      {seleccionado.adjuntos.map((item) => <Pressable key={item.id} style={styles.linkButton} disabled={ocupado} onPress={() => void verAdjunto(item.id, item.mime)}><Text style={styles.link}>{item.mime === 'application/pdf' ? 'Abrir o guardar' : 'Ver imagen'}: {item.nombre_visible} ({Math.ceil(item.tamano / 1024)} KB)</Text></Pressable>)}
      {preview && <Image accessibilityLabel="Vista previa del adjunto" source={{ uri: preview.uri }} resizeMode="contain" style={styles.preview}/>}
    </View> : items.length === 0 ? <Text style={styles.meta}>No hay comunicados para mostrar.</Text> : items.map((item) => <Pressable key={item.id} style={styles.card} onPress={() => void abrir(item)}><Text style={styles.itemTitle}>{item.titulo}</Text><Text style={styles.meta}>{item.mi_leido_at ? 'Leído' : 'No leído'} · {item.autor_nombre}</Text></Pressable>)}
  </ScrollView>
}

const styles = StyleSheet.create({ page: { padding: 20, gap: 12, backgroundColor: '#f8fafc', flexGrow: 1 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: '700', color: '#0f172a' }, itemTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' }, meta: { color: '#475569', marginTop: 6 }, body: { marginVertical: 18, color: '#1e293b', lineHeight: 23 }, card: { backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, padding: 16, gap: 8 }, linkButton: { paddingVertical: 8 }, link: { color: '#1d4ed8', fontWeight: '600' }, error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8 }, info: { backgroundColor: '#dbeafe', color: '#1e3a8a', padding: 12, borderRadius: 8 }, preview: { width: '100%', height: 320, marginTop: 12 } })
