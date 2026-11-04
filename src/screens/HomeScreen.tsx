import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import type { RootStackParamList } from '../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth()

  return (
    <View style={estilos.contenedor}>
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

      <Pressable style={estilos.salir} onPress={() => void logout()}>
        <Text style={estilos.salirTexto}>Cerrar sesión</Text>
      </Pressable>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 24, gap: 12, backgroundColor: '#f8fafc' },
  saludo: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#1e293b' },
  opcion: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  opcionTexto: { fontWeight: '600', color: '#1e293b' },
  salir: { marginTop: 'auto', padding: 14, alignItems: 'center' },
  salirTexto: { color: '#dc2626', fontWeight: '600' },
})
