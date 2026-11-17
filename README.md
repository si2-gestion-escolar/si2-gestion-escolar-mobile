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
- Navegación: `Login` → `Home` → `Notas` / `Boletines` / `Asistencia`.
- **HU27/HU28**: desde Inicio se accede a Comunicados, Alertas y Preferencias.
  Los listados admiten paginación, sincronización manual y gesto para refrescar.
  La bandeja permite filtrar categoría y avisos sin leer; Inicio y la bandeja
  consultan el total sin leer al recuperar el foco. Cada comunicado tiene
  detalle protegido y botón explícito para confirmar lectura. Leer una alerta
  no confirma el comunicado asociado. No se realiza gestión administrativa móvil.
- **Notas**: consume `GET /api/estudiantes/mis-resultados/` (desglose de
  calificaciones en texto). Si el usuario es tutor con varios hijos y no se
  especifica cuál, el backend responde 400 con la lista de hijos; la
  pantalla la usa para mostrar un selector.
- **Boletines**: consume `GET /api/estudiantes/documentos-academicos/`
  (ya viene filtrado por el backend a solo los boletines propios/de los
  hijos del tutor) y permite descargar/abrir el PDF real de cada uno
  (`.../{id}/descargar/`) con `expo-file-system` + `expo-sharing`. A
  diferencia de Notas, no hace falta elegir hijo primero: la lista ya trae
  el nombre del estudiante en cada fila.
- **Asistencia**: consume `GET /api/asistencia/detalles/resumen/`, que ya
  devuelve una fila por cada hijo a cargo del tutor (o la propia del
  estudiante) sin necesidad de elegir.
- Sin pantallas de gestión/administración — eso se queda en `frontend` (web).

- **Notificaciones push**: al iniciar sesión (o restaurar sesión), la app
  pide permiso y registra el token del dispositivo contra
  `/api/usuarios/dispositivos/registrar/`. El backend avisa automáticamente
  por push cuando se genera un boletín nuevo (al estudiante y a sus
  tutores). Usa el servicio de push de **Expo**, respaldado por un
  proyecto de **Firebase propio** (FCM V1, credenciales subidas a EAS como
  variable de entorno segura — ver abajo). Probado de punta a punta: login
  real → registro de dispositivo → push → notificación emergente en el
  celular. **Ojo**: desde el SDK 53, Expo Go ya no entrega notificaciones
  push remotas (solo quedó soportado en un *development build*).
  Login/Notas/Boletines/Asistencia siguen funcionando normal en Expo Go;
  solo la entrega real del push necesita un development build (`eas
  build --profile development`). El canal de Android usado es
  `default-v2` con importancia `HIGH` (para que se vea como notificación
  emergente, no solo un ícono en la barra de estado); el backend manda el
  `channelId` en cada push para que coincida. Si falla el registro (sin
  permiso, sin red, o corriendo en Expo Go sin development build), queda
  en `console.warn` y la app sigue funcionando igual.

- **Ícono y splash**: gorro de graduación simple sobre el azul de la marca
  (`#1d4ed8`), generado en `scripts/generar_assets.mjs` — no había ningún
  logo existente en el proyecto para reutilizar (solo el nombre "EduGestión
  Cloud" en `frontend/src/app/config/branding.ts`). Si luego hay un logo de
  verdad, basta con reemplazar los PNG en `assets/` (o editar el script y
  volver a correrlo con `node scripts/generar_assets.mjs`).

## API de comunicación y verificación local

Se reutilizan Axios con JWT, renovación y SecureStore. Con base `/api`, la app usa:

| Operación | Ruta |
| --- | --- |
| Listar comunicados, página de 20 | `GET /comunicacion/comunicados/?page=N` |
| Obtener detalle autenticado | `GET /comunicacion/comunicados/{id}/` |
| Confirmar lectura expresamente | `POST /comunicacion/comunicados/{id}/leer/` |
| Bandeja paginada y filtros opcionales | `GET /comunicacion/notificaciones/?page=N&no_leidas=true&tipo=FALTA` |
| Detalle de alerta | `GET /comunicacion/notificaciones/{id}/` |
| Marcar alerta como leída | `POST /comunicacion/notificaciones/{id}/leer/` |
| Total sin leer | `GET /comunicacion/notificaciones/resumen/` |
| Consultar y cambiar preferencias por categoría | `GET/PATCH /comunicacion/preferencias/` |

Las preferencias controlan push; desactivarlas conserva la bandeja. La categoría
PAGO recibe alertas emitidas desde el servicio administrativo autorizado del
backend; esta app no implementa cobros ni tesorería.

Al tocar un push se aceptan únicamente referencias enteras positivas
`notificacion_id` o `comunicado_id` (también `comunicado` por compatibilidad).
Si existen ambas, se abre la alerta y desde ella su comunicado. Se espera a que
la sesión y el navegador estén listos, tanto al arrancar desde una notificación
como al tocarla con la app abierta. El contenido se vuelve a solicitar a la API
autenticada; nunca se presenta texto privado ni se abren URLs del payload.
Los errores de acceso/red ofrecen sincronización manual. El botón de permisos
en Preferencias permite reintentar el registro del dispositivo; si el sistema
denegó permisos, indica que deben habilitarse desde sus ajustes.

```powershell
npm ci
npm test
npm run typecheck
npm run lint
```

Las pruebas usan Node, TypeScript y Axios ya instalados, con transporte HTTP
controlado y sin push real. Cubren rutas, filtros, métodos de lectura,
preferencias, propagación de errores y validación de referencias push.
ESLint y su configuración Expo son herramientas de desarrollo, sin cambios
a dependencias nativas ni a la configuración de builds.

Pendiente de verificación en dispositivo: login/restauración con cuentas de
tutor y estudiante, permisos concedidos/denegados, push en frío y en segundo
plano, cambio de cuenta, actualización del total tras confirmar lectura, filtros,
reintento sin conexión y paginación con más de veinte avisos. La entrega remota
exige el development build y credenciales EAS/FCM/APNs del proyecto; no se
generaron ni publicaron builds como parte de HU27/HU28.

## Generar un build de prueba con EAS

Ya se hizo (development build de Android, probado con notificaciones push
reales). Pasos para quien necesite repetirlo:

```powershell
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

El perfil `development` (ya definido en `eas.json`) genera un *development
build* instalable como APK — es el que hace falta para probar las
notificaciones push de verdad (Expo Go ya no las entrega, ver abajo).
`preview` genera un APK para compartir sin cuenta de desarrollador; antes de
un build `production` para las tiendas hace falta revisar `bundleIdentifier`/
`package` en `app.json` (hoy tienen un valor provisional
`com.si2gestionescolar.mobile`).

**`google-services.json`** (credenciales de Firebase) nunca se sube al repo
(ver `.gitignore`). Para que `eas build` en la nube lo encuentre, se subió
como variable de entorno de tipo archivo en EAS (`eas env:create`, nombre
`GOOGLE_SERVICES_JSON`, visibilidad `Secret`, entornos development/preview/
production). `app.config.js` lee esa variable en tiempo de build y, si no
existe (build local), cae de vuelta al archivo en disco. Quien necesite
regenerar el build desde cero necesita su propio archivo
`google-services.json` (Firebase Console → proyecto → Android app) y
repetir ese `eas env:create`, o pedir acceso al proyecto de EAS ya
configurado.

## Roadmap

1. **Fase 0 (backend, hecho)**: permisos de autoservicio para tutor/estudiante
   sobre boletines, endpoint JSON de resultados (`mis-resultados`), y cierre
   de un hueco de seguridad real en la API de asistencia (HU-13) que no
   filtraba por pertenencia.
2. **Fase 1 (hecho)**: esqueleto de la app — auth, navegación, pantallas base.
3. **Fase 2 (hecho)**: "Notas" y "Asistencia" conectadas a datos reales.
4. **Fase 3 (hecho)**: notificaciones push vía el servicio de Expo, disparadas
   al generar un boletín.
5. **Fase 4 (hecho)**: ícono/splash, development build con EAS, proyecto de
   Firebase propio (FCM V1) configurado y probado de punta a punta con una
   notificación real en el celular.
6. **Fase 5 (hecho)**: pantalla **Boletines** — listar y descargar/abrir el
   PDF real de cada boletín emitido (antes solo se veían las notas en
   texto). Requiere un nuevo development build (agregó `expo-file-system`
   y `expo-sharing`, módulos nativos) antes de poder probarse.
