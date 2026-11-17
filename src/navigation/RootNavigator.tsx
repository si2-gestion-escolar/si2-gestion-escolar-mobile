import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Notifications from 'expo-notifications'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Platform, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { destinoDesdePush, type DestinoPush } from '../notifications/communicationRouting'
import AsistenciaScreen from '../screens/AsistenciaScreen'
import BoletinesScreen from '../screens/BoletinesScreen'
import HomeScreen from '../screens/HomeScreen'
import LoginScreen from '../screens/LoginScreen'
import NotasScreen from '../screens/NotasScreen'
import { ComunicadosScreen, ComunicadoDetalleScreen } from '../screens/comunicacion/ComunicadosScreen'
import { NotificacionesScreen, NotificacionDetalleScreen } from '../screens/comunicacion/NotificacionesScreen'
import PreferenciasScreen from '../screens/comunicacion/PreferenciasScreen'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  Notas: undefined
  Boletines: undefined
  Asistencia: undefined
  Comunicados: undefined
  ComunicadoDetalle: { id: number }
  Notificaciones: undefined
  NotificacionDetalle: { id: number }
  Preferencias: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const { user, loading } = useAuth()
  const navigation = useNavigationContainerRef<RootStackParamList>()
  const [listo, setListo] = useState(false)
  const [pendiente, setPendiente] = useState<DestinoPush | null>(null)
  const usuarioAnterior = useRef<number | null>(null)

  useEffect(() => {
    if (Platform.OS === 'web') return
    const procesadas = new Set<string>()
    const recibir = (respuesta: Notifications.NotificationResponse | null) => {
      if (!respuesta || respuesta.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return
      const clave = respuesta.notification.request.identifier
      if (procesadas.has(clave)) return
      procesadas.add(clave)
      const destino = destinoDesdePush(respuesta.notification.request.content.data)
      if (destino) setPendiente(destino)
      // Consume native response once, retaining only validated IDs until login.
      try { Notifications.clearLastNotificationResponse() }
      catch { /* Native response cleanup must not interrupt authenticated navigation. */ }
    }
    const listener = Notifications.addNotificationResponseReceivedListener(recibir)
    try { recibir(Notifications.getLastNotificationResponse()) }
    catch { /* Unsupported notification runtime: HTTP inbox remains available. */ }
    return () => listener.remove()
  }, [])

  useEffect(() => {
    if (usuarioAnterior.current !== null && usuarioAnterior.current !== user?.id) setPendiente(null)
    usuarioAnterior.current = user?.id ?? null
  }, [user?.id])

  useEffect(() => {
    if (!user || loading || !listo || !navigation.isReady() || !pendiente) return
    if (pendiente.screen === 'NotificacionDetalle') navigation.navigate('NotificacionDetalle', pendiente.params)
    else navigation.navigate('ComunicadoDetalle', pendiente.params)
    setPendiente(null)
  }, [user, loading, listo, navigation, pendiente])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    )
  }

  return (
    <NavigationContainer ref={navigation} onReady={() => setListo(true)}>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="Notas" component={NotasScreen} options={{ title: 'Notas' }} />
            <Stack.Screen name="Boletines" component={BoletinesScreen} options={{ title: 'Boletines' }} />
            <Stack.Screen name="Asistencia" component={AsistenciaScreen} options={{ title: 'Asistencia' }} />
            <Stack.Screen name="Comunicados" component={ComunicadosScreen} options={{ title: 'Comunicados' }} />
            <Stack.Screen name="ComunicadoDetalle" component={ComunicadoDetalleScreen} options={{ title: 'Comunicado' }} getId={({ params }) => String(params.id)} />
            <Stack.Screen name="Notificaciones" component={NotificacionesScreen} options={{ title: 'Alertas' }} />
            <Stack.Screen name="NotificacionDetalle" component={NotificacionDetalleScreen} options={{ title: 'Detalle de alerta' }} getId={({ params }) => String(params.id)} />
            <Stack.Screen name="Preferencias" component={PreferenciasScreen} options={{ title: 'Preferencias' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
