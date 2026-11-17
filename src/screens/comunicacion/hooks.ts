import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useRef, useState } from 'react'
import type { Pagina } from '../../api/comunicacion'

type Respuesta<T> = Promise<{ data: T }>

export function useDetalle<T>(cargar: () => Respuesta<T>) {
  const [dato, setDato] = useState<T | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const secuencia = useRef(0)
  const refrescar = useCallback(async () => {
    const solicitud = ++secuencia.current
    setCargando(true)
    setError('')
    setDato(null)
    try {
      const { data } = await cargar()
      if (solicitud === secuencia.current) setDato(data)
    } catch {
      if (solicitud === secuencia.current) setError('No se pudo consultar el servidor. Verifique su conexión y que tenga acceso a esta información.')
    } finally {
      if (solicitud === secuencia.current) setCargando(false)
    }
  }, [cargar])
  useFocusEffect(useCallback(() => {
    void refrescar()
    return () => { secuencia.current++ }
  }, [refrescar]))
  return { dato, setDato, cargando, error, refrescar }
}

export function useLista<T extends { id: number }>(cargar: (page: number) => Respuesta<Pagina<T>>) {
  const [filas, setFilas] = useState<T[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [hayMas, setHayMas] = useState(false)
  const pagina = useRef(1)
  const secuencia = useRef(0)
  const ocupado = useRef(false)
  const consultar = useCallback(async (reiniciar: boolean) => {
    if (!reiniciar && ocupado.current) return
    const solicitud = ++secuencia.current
    ocupado.current = true
    const siguiente = reiniciar ? 1 : pagina.current + 1
    setCargando(true)
    setError('')
    if (reiniciar) { setFilas([]); setHayMas(false) }
    try {
      // Never follow absolute `next` URLs with the authenticated Axios client.
      const { data } = await cargar(siguiente)
      if (solicitud !== secuencia.current) return
      setFilas(previas => reiniciar ? data.results : [...previas, ...data.results.filter(f => !previas.some(p => p.id === f.id))])
      pagina.current = siguiente
      setHayMas(Boolean(data.next))
    } catch {
      if (solicitud === secuencia.current) setError('No fue posible cargar la lista. Verifique su conexión y vuelva a sincronizar.')
    } finally {
      if (solicitud === secuencia.current) { setCargando(false); ocupado.current = false }
    }
  }, [cargar])
  const refrescar = useCallback(() => consultar(true), [consultar])
  useFocusEffect(useCallback(() => {
    void refrescar()
    return () => { secuencia.current++; ocupado.current = false }
  }, [refrescar]))
  return { filas, cargando, error, hayMas, refrescar, cargarMas: () => consultar(false) }
}
