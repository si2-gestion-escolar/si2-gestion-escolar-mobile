import axiosInstance from './axiosInstance'

export type PlataformaDispositivo = 'ANDROID' | 'IOS' | 'WEB'

export const registrarDispositivo = (token: string, plataforma: PlataformaDispositivo) =>
  axiosInstance.post('/usuarios/dispositivos/registrar/', { token, plataforma })

export const desregistrarDispositivo = (token: string) =>
  axiosInstance.post('/usuarios/dispositivos/desregistrar/', { token })
