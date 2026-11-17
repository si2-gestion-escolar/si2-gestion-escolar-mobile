import * as Notifications from 'expo-notifications'
import { AndroidImportance } from 'expo-notifications'
import { Platform } from 'react-native'
import { registrarDispositivo, type PlataformaDispositivo } from '../api/notificaciones'

// El push remoto requiere un development build con credenciales FCM/APNs.
// La bandeja HTTP funciona también sin permisos o cuando el registro falla.
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
    if (Platform.OS === 'web') return 'no_disponible' as const
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default-v2', {
        name: 'General',
        importance: AndroidImportance.HIGH,
      })
    }

    const permisoActual = await Notifications.getPermissionsAsync()
    let estado = permisoActual.status
    if (estado !== 'granted' && permisoActual.canAskAgain) {
      const solicitado = await Notifications.requestPermissionsAsync()
      estado = solicitado.status
    }
    if (estado !== 'granted') return 'denegado' as const

    const { data: token } = await Notifications.getExpoPushTokenAsync()
    await registrarDispositivo(token, plataformaActual())
    return 'registrado' as const
  } catch {
    // No es critico: sin permiso, sin red, o sin proyecto EAS configurado
    // todavia, la app debe seguir funcionando igual sin notificaciones.
    console.warn('No fue posible registrar el dispositivo para notificaciones push.')
    return 'error' as const
  }
}
