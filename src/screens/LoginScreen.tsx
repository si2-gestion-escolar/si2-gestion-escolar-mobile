import axios from 'axios'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const entrar = async () => {
    if (!identificador || !password) {
      setError('Complete usuario y contraseña.')
      return
    }
    setCargando(true)
    setError('')
    try {
      await login(identificador, password)
    } catch (e) {
      setError(
        axios.isAxiosError(e) && e.response?.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : 'No fue posible iniciar sesión. Verifique su conexión.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>EduGestión Cloud</Text>
      <Text style={estilos.subtitulo}>Portal de tutores y estudiantes</Text>

      <TextInput
        style={estilos.campo}
        placeholder="Usuario o correo"
        autoCapitalize="none"
        value={identificador}
        onChangeText={setIdentificador}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={estilos.error}>{error}</Text> : null}

      <Pressable style={estilos.boton} onPress={() => void entrar()} disabled={cargando}>
        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>Entrar</Text>}
      </Pressable>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc', gap: 12 },
  titulo: { fontSize: 24, fontWeight: '700', color: '#1e3a8a', textAlign: 'center' },
  subtitulo: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 12 },
  campo: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, backgroundColor: '#fff' },
  boton: { backgroundColor: '#1d4ed8', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  botonTexto: { color: '#fff', fontWeight: '600' },
  error: { color: '#dc2626', textAlign: 'center' },
})
