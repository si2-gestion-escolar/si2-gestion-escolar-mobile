import axiosInstance from './axiosInstance'

export interface AdjuntoComunicado { id: number; nombre_visible: string; mime: string; tamano: number }
export interface Comunicado {
  id: number; titulo: string; contenido: string; autor_nombre: string; publicado_at: string | null
  adjuntos: AdjuntoComunicado[]; mi_leido_at: string | null
}
export const listarComunicados = () => axiosInstance.get<{ results?: Comunicado[] } | Comunicado[]>('/comunicaciones/bandeja/')
export const obtenerComunicado = (id: number) => axiosInstance.get<Comunicado>(`/comunicaciones/bandeja/${id}/`)
export const marcarComunicadoLeido = (id: number) => axiosInstance.post(`/comunicaciones/bandeja/${id}/marcar-leido/`, { canal: 'MOVIL' })
export const descargarAdjunto = (id: number) => axiosInstance.get<ArrayBuffer>(`/comunicaciones/adjuntos/${id}/descargar/`, { responseType: 'arraybuffer' })
