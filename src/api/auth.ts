import * as SecureStore from 'expo-secure-store'

const ACCESS_KEY = 'auth_access_token'
const REFRESH_KEY = 'auth_refresh_token'
const USER_KEY = 'auth_user'

// Subconjunto minimo del Usuario del backend; se ira ampliando en la Fase 2
// a medida que las pantallas de notas/asistencia necesiten mas campos.
export interface Usuario {
  id: number
  nombre: string
  apellido: string
  username: string
  rol: { id: number; nombre: string }
}

export interface AuthSession {
  access: string
  refresh: string
  user: Usuario
}

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY)
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY)

export const getStoredUser = async (): Promise<Usuario | null> => {
  const value = await SecureStore.getItemAsync(USER_KEY)
  if (!value) return null
  try {
    return JSON.parse(value) as Usuario
  } catch {
    await SecureStore.deleteItemAsync(USER_KEY)
    return null
  }
}

export const saveSession = async ({ access, refresh, user }: AuthSession) => {
  await SecureStore.setItemAsync(ACCESS_KEY, access)
  await SecureStore.setItemAsync(REFRESH_KEY, refresh)
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
}

export const updateTokens = async (access: string, refresh?: string) => {
  await SecureStore.setItemAsync(ACCESS_KEY, access)
  if (refresh) await SecureStore.setItemAsync(REFRESH_KEY, refresh)
}

export const clearSession = async () => {
  await SecureStore.deleteItemAsync(ACCESS_KEY)
  await SecureStore.deleteItemAsync(REFRESH_KEY)
  await SecureStore.deleteItemAsync(USER_KEY)
}
