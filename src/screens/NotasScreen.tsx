import { StyleSheet, Text, View } from 'react-native'

// Fase 2 del plan movil: aqui se mostraran los promedios por materia/trimestre
// y el boletin del estudiante. Depende de la Fase 0 (backend): hoy
// /estudiantes/documentos-academicos/ y los resultados de HU-17 solo son
// accesibles para admin/profesor, no para tutor/estudiante.
export default function NotasScreen() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>
        Pendiente de backend: falta habilitar el acceso de tutores y estudiantes
        a sus propias notas y boletines (Fase 0 del plan móvil).
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 24, justifyContent: 'center' },
  texto: { textAlign: 'center', color: '#64748b' },
})
