import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

export function Boton({ titulo, onPress, disabled = false }: { titulo: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    style={[estilos.boton, disabled && estilos.deshabilitado]} onPress={onPress}>
    <Text style={estilos.botonTexto}>{titulo}</Text>
  </Pressable>
}

export function Estado({ cargando, error }: { cargando: boolean; error: string }) {
  return <View accessibilityLiveRegion="polite">
    {cargando && <ActivityIndicator accessibilityLabel="Cargando información" color="#1d4ed8" />}
    {!!error && <Text accessibilityRole="alert" style={estilos.error}>{error}</Text>}
  </View>
}

export const fecha = (valor: string | null) => valor ? new Date(valor).toLocaleString('es-BO') : 'Sin fecha'

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#f8fafc' },
  contenido: { padding: 20, gap: 14, paddingBottom: 40 },
  tarjeta: { backgroundColor: '#fff', borderColor: '#cbd5e1', borderWidth: 1, borderRadius: 10, padding: 16, gap: 8 },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  subtitulo: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  texto: { color: '#334155', fontSize: 16, lineHeight: 24 },
  secundario: { color: '#475569', fontSize: 14 },
  cuerpo: { color: '#1e293b', fontSize: 16, lineHeight: 25 },
  error: { color: '#b91c1c', lineHeight: 22 },
  urgente: { color: '#b91c1c', fontWeight: '700' },
  leido: { color: '#166534', fontWeight: '600' },
  boton: { borderWidth: 1, borderColor: '#1d4ed8', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  botonTexto: { color: '#1d4ed8', fontWeight: '600' },
  deshabilitado: { opacity: 0.45 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filtro: { borderRadius: 18, borderWidth: 1, borderColor: '#64748b', paddingVertical: 10, paddingHorizontal: 14 },
  filtroActivo: { backgroundColor: '#dbeafe', borderColor: '#1d4ed8' },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
})
