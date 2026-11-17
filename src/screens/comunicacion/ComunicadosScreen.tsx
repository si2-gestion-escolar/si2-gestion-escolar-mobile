import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, ScrollView, Text, View, Pressable } from 'react-native'
import { confirmarLecturaComunicado, listarComunicados, obtenerComunicado } from '../../api/comunicacion'
import type { RootStackParamList } from '../../navigation/RootNavigator'
import { useDetalle, useLista } from './hooks'
import { Boton, Estado, estilos, fecha } from './shared'

export function ComunicadosScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Comunicados'>) {
  const cargar = useCallback((page: number) => listarComunicados(page), [])
  const lista = useLista(cargar)
  return <FlatList style={estilos.pantalla} contentContainerStyle={estilos.contenido}
    data={lista.filas} keyExtractor={item => String(item.id)}
    refreshControl={<RefreshControl refreshing={lista.cargando} onRefresh={() => void lista.refrescar()} />}
    ListHeaderComponent={<View style={{ gap: 12 }}>
      <Text style={estilos.titulo}>Comunicados</Text>
      <Boton titulo="Sincronizar comunicados" disabled={lista.cargando} onPress={() => void lista.refrescar()} />
      <Estado cargando={lista.cargando} error={lista.error} />
    </View>}
    ListEmptyComponent={!lista.cargando && !lista.error ? <Text style={estilos.texto}>No hay comunicados disponibles.</Text> : undefined}
    renderItem={({ item }) => <Pressable accessibilityRole="button" style={estilos.tarjeta}
      onPress={() => navigation.navigate('ComunicadoDetalle', { id: item.id })}>
      <Text style={estilos.subtitulo}>{item.titulo}</Text>
      {item.prioridad === 'URGENTE' && <Text style={estilos.urgente}>Urgente</Text>}
      <Text style={estilos.secundario}>{fecha(item.publicado_at ?? item.created_at)}</Text>
      <Text style={item.leido_at ? estilos.leido : estilos.secundario}>{item.leido_at ? 'Lectura confirmada' : 'Lectura pendiente'}</Text>
    </Pressable>}
    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    ListFooterComponent={lista.hayMas ? <Boton titulo="Cargar más" disabled={lista.cargando} onPress={() => void lista.cargarMas()} /> : undefined}
  />
}

export function ComunicadoDetalleScreen({ route }: NativeStackScreenProps<RootStackParamList, 'ComunicadoDetalle'>) {
  const cargar = useCallback(() => obtenerComunicado(route.params.id), [route.params.id])
  const { dato, setDato, cargando, error, refrescar } = useDetalle(cargar)
  const [guardando, setGuardando] = useState(false)
  const [errorLectura, setErrorLectura] = useState('')
  const confirmar = async () => {
    setGuardando(true)
    setErrorLectura('')
    try { const { data } = await confirmarLecturaComunicado(route.params.id); setDato(data) }
    catch { setErrorLectura('No se confirmó la lectura. Vuelva a intentarlo cuando tenga conexión.') }
    finally { setGuardando(false) }
  }
  return <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}
    refreshControl={<RefreshControl refreshing={cargando} onRefresh={() => { if (!guardando) void refrescar() }} />}>
    <Boton titulo="Sincronizar detalle" disabled={cargando || guardando} onPress={() => { setErrorLectura(''); void refrescar() }} />
    <Estado cargando={cargando} error={error || errorLectura} />
    {dato && <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{dato.titulo}</Text>
      {dato.prioridad === 'URGENTE' && <Text style={estilos.urgente}>Urgente</Text>}
      <Text style={estilos.secundario}>{fecha(dato.publicado_at ?? dato.created_at)}</Text>
      <Text style={estilos.secundario}>{dato.curso ? 'Dirigido a su curso' : 'Comunicado institucional'}</Text>
      <Text style={estilos.cuerpo}>{dato.cuerpo}</Text>
      {dato.estado === 'ARCHIVADO' && <Text style={estilos.secundario}>Comunicado archivado</Text>}
      {dato.leido_at ? <Text style={estilos.leido}>Lectura confirmada: {fecha(dato.leido_at)}</Text>
        : dato.es_destinatario && dato.estado === 'PUBLICADO' && <>
          <Text style={estilos.texto}>{dato.requiere_confirmacion ? 'Se requiere su confirmación de lectura.' : 'Puede confirmar que leyó este comunicado.'}</Text>
          <Boton titulo={guardando ? 'Confirmando…' : 'Confirmar que leí el comunicado'} disabled={guardando} onPress={() => void confirmar()} />
        </>}
    </View>}
  </ScrollView>
}
