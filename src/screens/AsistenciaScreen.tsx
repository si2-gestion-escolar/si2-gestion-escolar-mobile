import { StyleSheet, Text, View } from 'react-native'

// Fase 2 del plan movil. Depende de la Fase 0 (backend): HU-13 Asistencia
// solo tiene el modelo de base de datos (SesionClase, AsistenciaEstudiante),
// todavia no tiene serializers/views/urls ni permisos para tutor/estudiante.
export default function AsistenciaScreen() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>
        Pendiente de backend: la API de asistencia (HU-13) todavía no existe,
        solo el modelo de base de datos.
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 24, justifyContent: 'center' },
  texto: { textAlign: 'center', color: '#64748b' },
})
