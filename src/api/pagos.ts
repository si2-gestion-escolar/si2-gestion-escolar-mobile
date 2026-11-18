import axiosInstance from './axiosInstance'

export interface CuotaPendiente {
  id: number
  estudiante: number
  estudiante_nombre: string
  concepto: string
  plan_nombre: string
  saldo: string
  fecha_vencimiento: string
  vencida: boolean
}

export interface SolicitudQR {
  id: number
  estudiante_nombre: string
  conceptos: string[]
  monto: string
  qr_url: string
  expira_at: string
  estado: 'PENDIENTE' | 'PAGADA' | 'EXPIRADA' | 'OBSERVADA' | 'ANULADA'
  simulado?: boolean
  numero_recibo: number | null
  observacion: string
}

export const listarCuotasPendientes = async () => {
  const { data } = await axiosInstance.get<{ results: CuotaPendiente[] }>('/finanzas/obligaciones/', {
    params: { estado: 'PENDIENTE', page_size: 100 },
  })
  return data.results.filter((cuota) => Number(cuota.saldo) > 0)
}

export const generarQR = (estudiante: number, obligaciones: number[]) =>
  axiosInstance.post<SolicitudQR>('/finanzas/solicitudes-qr/', { estudiante, obligaciones })

export const verificarQR = (id: number) =>
  axiosInstance.post<SolicitudQR>(`/finanzas/solicitudes-qr/${id}/verificar/`)

export const formatoMonto = (valor: string | number) => `Bs ${Number(valor).toFixed(2)}`

// HU-28: bandeja de avisos de pago (pagos, becas y recordatorios de cuotas).
export interface AvisoPago {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha: string
}

export const listarAvisosPago = async () => {
  const { data } = await axiosInstance.get<{ results: AvisoPago[] }>('/finanzas/avisos/', { params: { page_size: 50 } })
  return data.results
}

export const contarAvisosPagoSinLeer = async () => {
  const { data } = await axiosInstance.get<{ no_leidas: number }>('/finanzas/avisos/resumen/')
  return data.no_leidas
}

export const leerAvisoPago = (id: number) => axiosInstance.post<AvisoPago>(`/finanzas/avisos/${id}/leer/`)

export const leerTodosLosAvisosPago = () => axiosInstance.post('/finanzas/avisos/leer-todas/')
