export type DestinoPush =
  | { screen: 'NotificacionDetalle'; params: { id: number } }
  | { screen: 'ComunicadoDetalle'; params: { id: number } }

function referencia(value: unknown): number | null {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^[1-9]\d*$/.test(value))) return null
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

// Only IDs are accepted. Push text/URLs never supply private screen content.
export function destinoDesdePush(data: unknown): DestinoPush | null {
  if (!data || typeof data !== 'object') return null
  const payload = data as Record<string, unknown>
  const notificacion = referencia(payload.notificacion_id)
  if (notificacion) return { screen: 'NotificacionDetalle', params: { id: notificacion } }
  const comunicado = referencia(payload.comunicado_id ?? payload.comunicado)
  if (comunicado) return { screen: 'ComunicadoDetalle', params: { id: comunicado } }
  return null
}
