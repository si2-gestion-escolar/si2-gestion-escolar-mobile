import axiosInstance from './axiosInstance'

export const categorias = {
  COMUNICADO: 'Comunicados', FALTA: 'Faltas', ATRASO: 'Atrasos',
  NOTA_BAJA: 'Notas bajas', PAGO: 'Pagos', CONTINGENCIA: 'Contingencias',
  CITACION: 'Citaciones', BOLETIN: 'Boletines',
} as const
export type Categoria = keyof typeof categorias
export type Preferencias = Record<Categoria, boolean>
export interface Pagina<T> { count: number; next: string | null; previous: string | null; results: T[] }
export interface Comunicado {
  id: number; titulo: string; cuerpo: string; unidad_educativa: number; curso: number | null
  prioridad: 'NORMAL' | 'URGENTE'; requiere_confirmacion: boolean
  estado: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO'; created_at: string; publicado_at: string | null
  leido_at: string | null; puede_gestionar: boolean; es_destinatario: boolean
  estadisticas: null | { destinatarios: number; leidos: number; porcentaje_lectura: number }
}
export interface Notificacion {
  id: number; tipo: Categoria; titulo: string; cuerpo: string; created_at: string
  leida_at: string | null; comunicado: number | null; datos: Record<string, unknown>
}
export interface FiltrosNotificaciones { page?: number; no_leidas?: boolean; tipo?: Categoria }

const base = '/comunicacion'
export const listarComunicados = (page = 1) =>
  axiosInstance.get<Pagina<Comunicado>>(`${base}/comunicados/`, { params: { page } })
export const obtenerComunicado = (id: number) => axiosInstance.get<Comunicado>(`${base}/comunicados/${id}/`)
export const confirmarLecturaComunicado = (id: number) => axiosInstance.post<Comunicado>(`${base}/comunicados/${id}/leer/`)
export const listarNotificaciones = (params: FiltrosNotificaciones = {}) =>
  axiosInstance.get<Pagina<Notificacion>>(`${base}/notificaciones/`, { params })
export const obtenerNotificacion = (id: number) => axiosInstance.get<Notificacion>(`${base}/notificaciones/${id}/`)
export const marcarNotificacionLeida = (id: number) => axiosInstance.post<Notificacion>(`${base}/notificaciones/${id}/leer/`)
export const obtenerResumenNotificaciones = () => axiosInstance.get<{ no_leidas: number }>(`${base}/notificaciones/resumen/`)
export const obtenerPreferencias = () => axiosInstance.get<Preferencias>(`${base}/preferencias/`)
export const actualizarPreferencias = (data: Partial<Preferencias>) => axiosInstance.patch<Preferencias>(`${base}/preferencias/`, data)
