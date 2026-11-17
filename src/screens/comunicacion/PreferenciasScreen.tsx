import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, Switch, Text, View } from 'react-native'
import { actualizarPreferencias, categorias, obtenerPreferencias, type Categoria } from '../../api/comunicacion'
import { registrarParaNotificacionesPush } from '../../notifications/pushNotifications'
import { useDetalle } from './hooks'
import { Boton, Estado, estilos } from './shared'

export default function PreferenciasScreen() {
  const cargar = useCallback(() => obtenerPreferencias(), [])
  const { dato, setDato, cargando, error, refrescar } = useDetalle(cargar)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [errorGuardar, setErrorGuardar] = useState('')
  const [registrando, setRegistrando] = useState(false)
  const cambiar = async (categoria: Categoria, value: boolean) => {
    setGuardando(true)
    setMensaje('')
    setErrorGuardar('')
    try { const { data } = await actualizarPreferencias({ [categoria]: value }); setDato(data); setMensaje('Preferencia guardada.') }
    catch { setErrorGuardar('No se guardó el cambio. Verifique su conexión y vuelva a intentarlo.') }
    finally { setGuardando(false) }
  }
  const activarPush = async () => {
    setRegistrando(true)
    const resultado = await registrarParaNotificacionesPush()
    setMensaje(resultado === 'registrado' ? 'Este dispositivo está registrado para recibir notificaciones.'
      : resultado === 'denegado' ? 'Permiso de notificaciones desactivado. Puede habilitarlo en los ajustes del dispositivo.'
        : 'No se pudo registrar el dispositivo. Compruebe su conexión y utilice la aplicación de desarrollo configurada para push.')
    setRegistrando(false)
  }
  return <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}
    refreshControl={<RefreshControl enabled={!guardando} refreshing={cargando} onRefresh={() => { if (!guardando) void refrescar() }} />}>
    <Text style={estilos.titulo}>Preferencias de notificaciones</Text>
    <Text style={estilos.texto}>Elija las categorías que desea recibir por push. Todas las alertas seguirán disponibles en su bandeja, aunque desactive sus notificaciones.</Text>
    <Boton titulo="Sincronizar preferencias" disabled={cargando || guardando} onPress={() => void refrescar()} />
    <Estado cargando={cargando || guardando} error={error || errorGuardar} />
    {!!mensaje && <Text accessibilityLiveRegion="polite" style={estilos.texto}>{mensaje}</Text>}
    {dato && (Object.keys(categorias) as Categoria[]).map(categoria => <View key={categoria} style={[estilos.tarjeta, estilos.fila]}>
      <Text style={estilos.texto}>{categorias[categoria]}</Text>
      <Switch accessibilityLabel={`Recibir ${categorias[categoria].toLowerCase()} por push`} value={dato[categoria]}
        disabled={guardando || cargando} onValueChange={value => void cambiar(categoria, value)} />
    </View>)}
    <Boton titulo={registrando ? 'Comprobando permisos…' : 'Activar notificaciones en este dispositivo'} disabled={registrando} onPress={() => void activarPush()} />
  </ScrollView>
}
