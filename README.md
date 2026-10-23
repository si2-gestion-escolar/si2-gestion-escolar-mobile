# App móvil — Portal de tutores y estudiantes

Cliente React Native (Expo + TypeScript) para el mismo backend Django/DRF que
consume `frontend`. Público objetivo: tutores y estudiantes (consulta de
notas, boletines y asistencia), no el personal administrativo.

## Requisitos

- Node.js 18+ y npm.
- App **Expo Go** en tu celular (Android/iOS), o un emulador/simulador.
- El backend (`../backend`) corriendo y accesible en tu red.

## Puesta en marcha

```powershell
cd mobile
npm install
copy .env.example .env
```

Edita `.env` según dónde vayas a probar (ver comentarios dentro del archivo:
emulador Android, simulador iOS o celular físico por IP de red).

```powershell
npm run start
```

Escanea el QR con Expo Go, o presiona `a`/`i` en la terminal para abrir en un
emulador/simulador.

## Estado actual

- Login contra `/usuarios/login/` (JWT) con refresco automático de token,
  reutilizando el mismo flujo que `frontend/src/api`, adaptado a
  `expo-secure-store` (almacenamiento async en vez de `sessionStorage`).
- Navegación: `Login` → `Home` → `Notas` / `Asistencia`.
- **Notas**: consume `GET /api/estudiantes/mis-resultados/`. Si el usuario es
  tutor con varios hijos y no se especifica cuál, el backend responde 400 con
  la lista de hijos; la pantalla la usa para mostrar un selector.
- **Asistencia**: consume `GET /api/asistencia/detalles/resumen/`, que ya
  devuelve una fila por cada hijo a cargo del tutor (o la propia del
  estudiante) sin necesidad de elegir.
- Sin pantallas de gestión/administración — eso se queda en `frontend` (web).

- **Notificaciones push**: al iniciar sesión (o restaurar sesión), la app
  pide permiso y registra el token del dispositivo contra
  `/api/usuarios/dispositivos/registrar/`. El backend avisa automáticamente
  por push cuando se genera un boletín nuevo (al estudiante y a sus
  tutores). Usa el servicio de push de **Expo** (no Firebase/APNs
  directo) — pero **ojo**: desde el SDK 53, Expo Go ya no entrega
  notificaciones push remotas (solo quedó soportado en un *development
  build*). Login/Notas/Asistencia siguen funcionando normal en Expo Go;
  solo la entrega real del push necesita un development build (`eas
  build --profile development`, o build local con `expo-dev-client`).
  Si falla el registro (sin permiso, sin red, o corriendo en Expo Go sin
  development build), queda en `console.warn` y la app sigue
  funcionando igual.

## Roadmap

1. **Fase 0 (backend, hecho)**: permisos de autoservicio para tutor/estudiante
   sobre boletines, endpoint JSON de resultados (`mis-resultados`), y cierre
   de un hueco de seguridad real en la API de asistencia (HU-13) que no
   filtraba por pertenencia.
2. **Fase 1 (hecho)**: esqueleto de la app — auth, navegación, pantallas base.
3. **Fase 2 (hecho)**: "Notas y boletines" y "Asistencia" conectadas a datos
   reales.
4. **Fase 3 (hecho)**: notificaciones push vía el servicio de Expo, disparadas
   al generar un boletín. **Importante**: desde el SDK 53 de Expo, la
   entrega real de push remoto ya NO funciona en Expo Go — hace falta un
   *development build* (`eas build --profile development`) para probarlo
   de verdad. Un build standalone para producción (Android) además va a
   necesitar más adelante un proyecto de Firebase propio
   (`google-services.json`).
5. **Fase 4**: ícono/splash y build de prueba con EAS.
