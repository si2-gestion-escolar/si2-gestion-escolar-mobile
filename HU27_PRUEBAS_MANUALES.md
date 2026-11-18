# HU-27: validacion manual integrada

Estas verificaciones requieren backend con las migraciones `comunicaciones` aplicadas, web levantada y una build movil Expo Go compatible con SDK 58. Expo Go debe reiniciarse despues de instalar las dependencias.

## Recorrido principal

1. Iniciar sesion como Director y crear un borrador con titulo, contenido, imagen y PDF adjuntos.
2. Publicar el comunicado y revisar el detalle de destinatarios. Cada usuario debe aparecer una sola vez aunque coincida por tutor y estudiante o por varios filtros.
3. Iniciar sesion como Tutor en web y confirmar que solo ve los comunicados asignados a su cuenta. Abrir uno y verificar que cambia a leido.
4. Volver como Director y consultar destinatarios; confirmar la lectura registrada.
5. Iniciar sesion como Estudiante en movil, abrir el comunicado y confirmar que la lectura queda registrada.
6. Abrir la imagen y comprobar que se previsualiza dentro de la pantalla.
7. Pulsar el PDF. Debe descargarse con la sesion autenticada y abrir el menu nativo para abrirlo en una app compatible o guardarlo. Al cerrar el menu, el archivo temporal se elimina.

## Aislamiento y sesion

8. Con un usuario no destinatario, solicitar el detalle y un adjunto de otro usuario; la API debe responder 404 sin revelar existencia ni metadatos.
9. Repetir con un usuario de otro colegio; debe responder 404.
10. Simular 403 en la bandeja movil; debe conservar access, refresh y usuario, sin refresh ni logout.

## Automatizacion disponible

El backend cuenta con pruebas API de publicacion, deduplicacion, lectura, permisos, aislamiento de tenant/unidad, adjuntos privados y auditoria. La guia describe el recorrido UI en web y movil porque el repositorio movil no tiene runner de pruebas automatizadas.
