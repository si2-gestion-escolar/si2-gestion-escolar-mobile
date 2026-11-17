import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { obtenerResumenNotificaciones } from '../api/comunicacion'
import { useAuth } from '../context/AuthContext'
import type { RootStackParamList } from '../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth()
  const [sinLeer, setSinLeer] = useState<number | null>(null)
  useFocusEffect(useCallback(() => {
    let activo = true
    void obtenerResumenNotificaciones().then(({ data }) => { if (activo) setSinLeer(data.no_leidas) })
      .catch(() => { if (activo) setSinLeer(null) })
    return () => { activo = false }
  }, []))

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={estilos.contenedor}>
      <Text style={estilos.saludo}>Hola, {user?.nombre ?? 'usuario'}</Text>

      <Pressable style={estilos.opcion} onPress={() => navigation.navigate('Notas')}>
        <Text style={estilos.opcionTexto}>Notas</Text>
      </Pressable>
      <Pressable style={estilos.opcion} onPress={() => navigation.navigate('Boletines')}>
        <Text style={estilos.opcionTexto}>Boletines</Text>
      </Pressable>
      <Pressable style={estilos.opcion} onPress={() => navigation.navigate('Asistencia')}>
        <Text style={estilos.opcionTexto}>Asistencia</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={estilos.opcion} onPress={() => navigation.navigate('Comunicados')}>
        <Text style={estilos.opcionTexto}>Comunicados</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={estilos.opcion} onPress={() => navigation.navigate('Notificaciones')}>
        <Text style={estilos.opcionTexto}>Alertas{sinLeer !== null ? ` · ${sinLeer} sin leer` : ''}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={estilos.opcion} onPress={() => navigation.navigate('Preferencias')}>
        <Text style={estilos.opcionTexto}>Preferencias de notificaciones</Text>
      </Pressable>

      <Pressable style={estilos.salir} onPress={() => void logout()}>
        <Text style={estilos.salirTexto}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  contenedor: { flexGrow: 1, padding: 24, gap: 12, backgroundColor: '#f8fafc' },
  saludo: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#1e293b' },
  opcion: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  opcionTexto: { fontWeight: '600', color: '#1e293b' },
  salir: { marginTop: 'auto', padding: 14, alignItems: 'center' },
  salirTexto: { color: '#dc2626', fontWeight: '600' },
})
