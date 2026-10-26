import * as FileSystem from 'expo-file-system/legacy'
import axiosInstance, { apiBaseUrl } from './axiosInstance'
import { getAccessToken } from './auth'

export interface BoletinEmitido {
  id: number
  tipo: 'BOLETIN' | 'CENTRALIZADOR'
  estudiante_nombre: string | null
  periodo_nombre: string | null
  gestion_anio: number
  version: number
  emitido_at: string
}

export const listarMisBoletines = () =>
  axiosInstance.get<BoletinEmitido[]>('/estudiantes/documentos-academicos/')

export async function descargarBoletin(id: number, nombreArchivo: string) {
  const token = await getAccessToken()
  const destino = `${FileSystem.cacheDirectory}${nombreArchivo}`
  const resultado = await FileSystem.downloadAsync(
    `${apiBaseUrl}/estudiantes/documentos-academicos/${id}/descargar/`,
    destino,
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
  )
  return resultado.uri
}
