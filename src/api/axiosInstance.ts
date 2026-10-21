import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearSession, getAccessToken, getRefreshToken, updateTokens } from './auth'

// Ver .env.example: el valor correcto depende de donde corra la app
// (emulador Android, simulador iOS o celular fisico con Expo Go).
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8000/api'

const apiConfig = {
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
}

export const authAxios = axios.create(apiConfig)
const axiosInstance = axios.create(apiConfig)

interface RetryableRequest extends InternalAxiosRequestConfig { _retry?: boolean }
interface RefreshResponse { access: string; refresh?: string }

let refreshPromise: Promise<string> | null = null

const endpointPath = (url?: string) => url?.split('?')[0] ?? ''
const isPublicAuthEndpoint = (url?: string) => {
  const path = endpointPath(url)
  return path.endsWith('/usuarios/login/') || path.endsWith('/usuarios/refresh/')
}
const mustNotRetry = (url?: string) => isPublicAuthEndpoint(url) || endpointPath(url).endsWith('/usuarios/logout/')

const renewAccessToken = async () => {
  const refresh = await getRefreshToken()
  if (!refresh) throw new Error('No existe un token de renovación.')
  const response = await authAxios.post<RefreshResponse>('/usuarios/refresh/', { refresh })
  if (!response.data.access) throw new Error('El servidor no devolvió un token de acceso.')
  await updateTokens(response.data.access, response.data.refresh)
  return response.data.access
}

axiosInstance.interceptors.request.use(async (config) => {
  if (!isPublicAuthEndpoint(config.url)) {
    const access = await getAccessToken()
    if (access) config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined
    if (error.response?.status !== 401 || !request || request._retry || mustNotRetry(request.url)) {
      return Promise.reject(error)
    }

    request._retry = true
    if (!refreshPromise) {
      refreshPromise = renewAccessToken().finally(() => { refreshPromise = null })
    }

    try {
      const access = await refreshPromise
      request.headers.Authorization = `Bearer ${access}`
      return axiosInstance(request)
    } catch (refreshError) {
      await clearSession()
      return Promise.reject(refreshError)
    }
  },
)

export default axiosInstance
