import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { registrarDispositivo, type PlataformaDispositivo } from '../api/notificaciones'

// Como se usa el servicio de push de Expo (ver backend/notificaciones.py),
// no hace falta configurar Firebase/APNs propios mientras se pruebe con
// Expo Go. Para un build standalone con EAS sí se necesitarán esas
// credenciales más adelante (Fase 4).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const plataformaActual = (): PlataformaDispositivo => {
  if (Platform.OS === 'android') return 'ANDROID'
  if (Platform.OS === 'ios') return 'IOS'
  return 'WEB'
}

export async function registrarParaNotificacionesPush() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default-v2', {
        name: 'General',
        importance: Notifications.AndroidImportance.HIGH,
      })
    }

    const permisoActual = await Notifications.getPermissionsAsync()
    let estado = permisoActual.status
    if (estado !== 'granted') {
      const solicitado = await Notifications.requestPermissionsAsync()
      estado = solicitado.status
    }
    if (estado !== 'granted') return

    const { data: token } = await Notifications.getExpoPushTokenAsync()
    await registrarDispositivo(token, plataformaActual())
  } catch (error) {
    // No es critico: sin permiso, sin red, o sin proyecto EAS configurado
    // todavia, la app debe seguir funcionando igual sin notificaciones.
    console.warn('No fue posible registrar el dispositivo para notificaciones push.', error)
  }
}
