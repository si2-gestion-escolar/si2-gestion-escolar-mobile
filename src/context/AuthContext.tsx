import * as Notifications from 'expo-notifications'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import axiosInstance, { authAxios } from '../api/axiosInstance'
import { clearSession, getAccessToken, saveSession, type Usuario } from '../api/auth'
import { desregistrarDispositivo } from '../api/notificaciones'
import { registrarParaNotificacionesPush } from '../notifications/pushNotifications'

interface LoginResponse { access: string; refresh: string; user: Usuario }

interface AuthContextType {
  user: Usuario | null
  loading: boolean
  login: (identificador: string, password: string) => Promise<Usuario>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('AuthProvider no está disponible.') },
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let activo = true
    const restaurarSesion = async () => {
      const token = await getAccessToken()
      if (!token) {
        if (activo) setLoading(false)
        return
      }
      try {
        const { data } = await axiosInstance.get<Usuario>('/usuarios/perfil/')
        if (activo) setUser(data)
        void registrarParaNotificacionesPush()
      } catch {
        await clearSession()
        if (activo) setUser(null)
      } finally {
        if (activo) setLoading(false)
      }
    }
    void restaurarSesion()
    return () => { activo = false }
  }, [])

  const login = async (identificador: string, password: string) => {
    const credenciales = identificador.includes('@')
      ? { email: identificador.trim(), password }
      : { username: identificador.trim(), password }
    const { data } = await authAxios.post<LoginResponse>('/usuarios/login/', credenciales)
    await saveSession(data)
    setUser(data.user)
    void registrarParaNotificacionesPush()
    return data.user
  }

  const logout = async () => {
    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync()
      await desregistrarDispositivo(token)
    } catch {
      // Sin permiso o sin token registrado: no hay nada que desregistrar.
    }
    await clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
