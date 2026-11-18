import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { contarAvisosPagoSinLeer } from '../api/pagos'
import { useAuth } from '../context/AuthContext'
import type { RootStackParamList } from '../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth()
  const [sinLeer, setSinLeer] = useState(0)

  // Se recuenta cada vez que se vuelve al inicio, por si se leyeron avisos de pago.
  useFocusEffect(useCallback(() => {
    contarAvisosPagoSinLeer().then(setSinLeer).catch(() => setSinLeer(0))
  }, []))

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.saludo}>Hola, {user?.nombre ?? 'usuario'}</Text>

      <Pressable style={[estilos.opcion, estilos.fila]} onPress={() => navigation.navigate('AvisosPago')}>
        <Text style={estilos.opcionTexto}>Avisos de pago</Text>
        {sinLeer > 0 && <Text style={estilos.contador}>{sinLeer}</Text>}
      </Pressable>
      <Pressable style={estilos.opcion} onPress={() => navigation.navigate('Notas')}>
        <Text style={estilos.opcionTexto}>Notas</Text>
      </Pressable>
      <Pressable style={estilos.opcion} onPress={() => navigation.navigate('Boletines')}>
        <Text style={estilos.opcionTexto}>Boletines</Text>
      </Pressable>
      <Pressable style={estilos.opcion} onPress={() => navigation.navigate('Asistencia')}>
        <Text style={estilos.opcionTexto}>Asistencia</Text>
      </Pressable>
      <Pressable style={estilos.opcion} onPress={() => navigation.navigate('Pagos')}>
        <Text style={estilos.opcionTexto}>Pensiones y pagos</Text>
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
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contador: { backgroundColor: '#dc2626', color: '#fff', fontWeight: '700', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  salir: { marginTop: 'auto', padding: 14, alignItems: 'center' },
  salirTexto: { color: '#dc2626', fontWeight: '600' },
})
