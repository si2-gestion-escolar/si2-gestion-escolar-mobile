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

## Estado actual (esqueleto)

- Login contra `/usuarios/login/` (JWT) con refresco automático de token,
  reutilizando el mismo flujo que `frontend/src/api`, adaptado a
  `expo-secure-store` (almacenamiento async en vez de `sessionStorage`).
- Navegación: `Login` → `Home` → `Notas` / `Asistencia` (estas dos últimas
  son pantallas placeholder, todavía no llaman a ningún endpoint).
- Sin pantallas de gestión/administración — eso se queda en `frontend` (web).

## Por qué "Notas" y "Asistencia" no muestran datos todavía

El backend actual no permite que un tutor o estudiante lea sus propias notas,
boletines o asistencia:

- `documentos-academicos` (boletines) y los resultados de HU-16/17 solo son
  accesibles para profesor/admin/superadmin.
- HU-13 (Asistencia) solo tiene los modelos de base de datos
  (`SesionClase`, `AsistenciaEstudiante`); no tiene serializers/views/urls.

Ese trabajo de backend (Fase 0 del plan) tiene que hacerse antes de conectar
estas pantallas a datos reales.

## Roadmap

1. **Fase 0 (backend)**: permisos de autoservicio para tutor/estudiante +
   endpoint JSON de resultados + API de HU-13 + registro de dispositivo para
   notificaciones.
2. **Fase 1 (hecho)**: esqueleto de la app — auth, navegación, pantallas base.
3. **Fase 2**: conectar "Notas y boletines" y "Asistencia" a datos reales.
4. **Fase 3**: notificaciones push (Firebase Cloud Messaging vía
   `expo-notifications`).
5. **Fase 4**: ícono/splash y build de prueba con EAS.
