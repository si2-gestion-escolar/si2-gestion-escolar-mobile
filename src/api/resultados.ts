import axiosInstance from './axiosInstance'

export interface ResultadoPeriodo {
  periodo: number
  periodo_nombre: string
  resultado: string
  condicion: string
}

export interface ResultadoAnual {
  resultado: string
  condicion: string
}

export interface MateriaResultado {
  materia: number
  materia_nombre: string
  trimestrales: ResultadoPeriodo[]
  anual: ResultadoAnual | null
}

export interface MisResultados {
  estudiante: number
  estudiante_nombre: string
  curso: string
  materias: MateriaResultado[]
}

export interface HijoDisponible {
  estudiante: number
  estudiante_nombre: string
}

export const obtenerMisResultados = (estudianteId?: number) =>
  axiosInstance.get<MisResultados>('/estudiantes/mis-resultados/', {
    params: estudianteId ? { estudiante: estudianteId } : undefined,
  })
