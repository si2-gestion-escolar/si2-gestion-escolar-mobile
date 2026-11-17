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
