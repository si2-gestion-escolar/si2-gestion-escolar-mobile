import axiosInstance from './axiosInstance'

export interface ResumenAsistencia {
  estudiante: number
  nombre: string
  apellido: string
  curso: string | null
  total: number
  presentes: number
  ausentes: number
  tardes: number
  licencias: number
  porcentaje_asistencia: string
  porcentaje_faltas: string
}

// Sin filtro: para un estudiante devuelve su propia fila; para un tutor,
// una fila por cada hijo a su cargo (no hace falta elegir, a diferencia
// de mis-resultados que es un solo estudiante por respuesta).
export const obtenerResumenAsistencia = () =>
  axiosInstance.get<ResumenAsistencia[]>('/asistencia/detalles/resumen/')
