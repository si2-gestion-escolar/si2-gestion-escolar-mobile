import { isAxiosError } from 'axios'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const entrar = async () => {
    if (!identificador.trim() || !password) {
      setError('Complete usuario y contrase\u00f1a.')
      return
    }
    setCargando(true)
    setError('')
    try {
      await login(identificador, password)
    } catch (cause) {
      if (isAxiosError(cause)) {
        if (!cause.response) {
          setError('No se pudo conectar con el servidor. Verifique su conexi\u00f3n e intente nuevamente.')
        } else if (cause.response.status === 401) {
          setError('Usuario o contrase\u00f1a incorrectos.')
        } else if (cause.response.status === 400) {
          const data = cause.response.data as { error?: string; detail?: string }
          setError(data?.error ?? data?.detail ?? 'Revise los datos ingresados e int\u00e9ntelo nuevamente.')
        } else if (cause.response.status === 403) {
          setError('El servidor rechaz\u00f3 la solicitud de inicio de sesi\u00f3n.')
        } else {
          setError(`El servidor respondi\u00f3 con un error (${cause.response.status}). Int\u00e9ntelo nuevamente m\u00e1s tarde.`)
        }
      } else {
        setError('No se pudo completar el inicio de sesi\u00f3n. Int\u00e9ntelo nuevamente.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>EduGesti\u00f3n Cloud</Text>
      <Text style={estilos.subtitulo}>Portal de tutores y estudiantes</Text>

      <TextInput
        style={estilos.campo}
        placeholder="Usuario o correo"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        autoCorrect={false}
        value={identificador}
        onChangeText={setIdentificador}
        editable={!cargando}
        accessibilityLabel="Usuario o correo"
      />
      <View style={estilos.passwordContenedor}>
        <TextInput
          style={[estilos.campo, estilos.campoPassword]}
          placeholder="Contrase\u00f1a"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!mostrarPassword}
          value={password}
          onChangeText={setPassword}
          editable={!cargando}
          accessibilityLabel="Contrase\u00f1a"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mostrarPassword ? 'Ocultar contrase\u00f1a' : 'Mostrar contrase\u00f1a'}
          accessibilityState={{ selected: mostrarPassword }}
          hitSlop={10}
          style={estilos.botonVisibilidad}
          onPress={() => setMostrarPassword((visible) => !visible)}
          disabled={cargando}
        >
          <View style={estilos.iconoOjo}>
            <View style={estilos.pupila} />
            {!mostrarPassword && <View style={estilos.lineaOjo} />}
          </View>
        </Pressable>
      </View>

      {error ? <Text accessibilityRole="alert" style={estilos.error}>{error}</Text> : null}

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
  campo: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, backgroundColor: '#fff', color: '#0f172a' },
  passwordContenedor: { position: 'relative', justifyContent: 'center' },
  campoPassword: { paddingRight: 52 },
  botonVisibilidad: { position: 'absolute', right: 14, height: 44, width: 30, alignItems: 'center', justifyContent: 'center' },
  iconoOjo: { width: 22, height: 14, borderWidth: 2, borderColor: '#64748b', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pupila: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#64748b' },
  lineaOjo: { position: 'absolute', width: 26, height: 2, backgroundColor: '#64748b', transform: [{ rotate: '-35deg' }] },
  boton: { backgroundColor: '#1d4ed8', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  botonTexto: { color: '#fff', fontWeight: '600' },
  error: { color: '#dc2626', textAlign: 'center' },
})
