import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useRef, useState } from 'react'
import { FlatList, Pressable, RefreshControl, ScrollView, Switch, Text, View } from 'react-native'
import { categorias, listarNotificaciones, marcarNotificacionLeida, obtenerNotificacion, obtenerResumenNotificaciones, type Categoria } from '../../api/comunicacion'
import type { RootStackParamList } from '../../navigation/RootNavigator'
import { useDetalle, useLista } from './hooks'
import { Boton, Estado, estilos, fecha } from './shared'

export function NotificacionesScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Notificaciones'>) {
  const [tipo, setTipo] = useState<Categoria | undefined>()
  const [noLeidas, setNoLeidas] = useState(false)
  const [resumen, setResumen] = useState<number | null>(null)
  const [errorResumen, setErrorResumen] = useState('')
  const consultaResumen = useRef(0)
  const actualizarResumen = useCallback(async () => {
    const solicitud = ++consultaResumen.current
    try {
      const { data } = await obtenerResumenNotificaciones()
      if (solicitud === consultaResumen.current) { setResumen(data.no_leidas); setErrorResumen('') }
    } catch {
      if (solicitud === consultaResumen.current) { setResumen(null); setErrorResumen('No se pudo actualizar el total de avisos sin leer.') }
    }
  }, [])
  useFocusEffect(useCallback(() => {
    void actualizarResumen()
    return () => { consultaResumen.current++ }
  }, [actualizarResumen]))
  const cargar = useCallback((page: number) => listarNotificaciones({ page, tipo, no_leidas: noLeidas || undefined }), [tipo, noLeidas])
  const lista = useLista(cargar)
  const sincronizar = () => { void lista.refrescar(); void actualizarResumen() }
  return <FlatList style={estilos.pantalla} contentContainerStyle={estilos.contenido}
    data={lista.filas} keyExtractor={item => String(item.id)}
    refreshControl={<RefreshControl refreshing={lista.cargando} onRefresh={sincronizar} />}
    ListHeaderComponent={<View style={{ gap: 14 }}>
      <Text style={estilos.titulo}>Bandeja de alertas{resumen !== null ? ` · ${resumen} sin leer` : ''}</Text>
      <Boton titulo="Preferencias de notificaciones" onPress={() => navigation.navigate('Preferencias')} />
      <View style={estilos.fila}>
        <Text style={estilos.texto}>Solo sin leer</Text>
        <Switch accessibilityLabel="Mostrar solo notificaciones sin leer" value={noLeidas} onValueChange={setNoLeidas} />
      </View>
      <View style={estilos.filtros}>
        {[undefined, ...Object.keys(categorias) as Categoria[]].map(categoria => <Pressable key={categoria ?? 'todas'}
          accessibilityRole="button" accessibilityState={{ selected: tipo === categoria }}
          style={[estilos.filtro, tipo === categoria && estilos.filtroActivo]} onPress={() => setTipo(categoria)}>
          <Text style={estilos.secundario}>{categoria ? categorias[categoria] : 'Todas'}</Text>
        </Pressable>)}
      </View>
      <Boton titulo="Sincronizar bandeja" disabled={lista.cargando} onPress={sincronizar} />
      <Estado cargando={lista.cargando} error={lista.error || errorResumen} />
    </View>}
    ListEmptyComponent={!lista.cargando && !lista.error ? <Text style={estilos.texto}>No hay alertas para estos filtros.</Text> : undefined}
    renderItem={({ item }) => <Pressable accessibilityRole="button" style={estilos.tarjeta}
      onPress={() => navigation.navigate('NotificacionDetalle', { id: item.id })}>
      <Text style={estilos.subtitulo}>{item.titulo}</Text>
      <Text style={estilos.secundario}>{categorias[item.tipo] ?? item.tipo} · {fecha(item.created_at)}</Text>
      <Text style={item.leida_at ? estilos.leido : estilos.urgente}>{item.leida_at ? 'Leída' : 'Sin leer'}</Text>
    </Pressable>}
    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    ListFooterComponent={lista.hayMas ? <Boton titulo="Cargar más" disabled={lista.cargando} onPress={() => void lista.cargarMas()} /> : undefined}
  />
}

export function NotificacionDetalleScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'NotificacionDetalle'>) {
  const cargar = useCallback(() => obtenerNotificacion(route.params.id), [route.params.id])
  const { dato, setDato, cargando, error, refrescar } = useDetalle(cargar)
  const [guardando, setGuardando] = useState(false)
  const [errorLectura, setErrorLectura] = useState('')
  const marcar = async () => {
    setGuardando(true)
    setErrorLectura('')
    try { const { data } = await marcarNotificacionLeida(route.params.id); setDato(data) }
    catch { setErrorLectura('No se pudo marcar la alerta como leída. Vuelva a intentarlo.') }
    finally { setGuardando(false) }
  }
  return <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}
    refreshControl={<RefreshControl refreshing={cargando} onRefresh={() => { if (!guardando) void refrescar() }} />}>
    <Boton titulo="Sincronizar detalle" disabled={cargando || guardando} onPress={() => { setErrorLectura(''); void refrescar() }} />
    <Estado cargando={cargando} error={error || errorLectura} />
    {dato && <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{dato.titulo}</Text>
      <Text style={estilos.secundario}>{categorias[dato.tipo] ?? dato.tipo} · {fecha(dato.created_at)}</Text>
      <Text style={estilos.cuerpo}>{dato.cuerpo}</Text>
      {dato.leida_at ? <Text style={estilos.leido}>Leída: {fecha(dato.leida_at)}</Text>
        : <Boton titulo={guardando ? 'Guardando…' : 'Marcar alerta como leída'} disabled={guardando} onPress={() => void marcar()} />}
      {dato.comunicado !== null && <>
        <Text style={estilos.secundario}>La confirmación de lectura del comunicado se realiza en su detalle.</Text>
        <Boton titulo="Ver comunicado" onPress={() => navigation.navigate('ComunicadoDetalle', { id: dato.comunicado! })} />
      </>}
    </View>}
  </ScrollView>
}
