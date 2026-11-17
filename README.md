# Agenda PRO — proyecto independiente

Agenda de reuniones en HTML, CSS y JavaScript. No modifica el repositorio Agenda-Virtual.

## Funciones
- Crear, editar y eliminar reuniones
- Alarmas en pantalla con sonido electrónico durante 30 segundos, apagar y posponer 5 minutos
- Aviso previo configurable: 5, 15 o 30 minutos
- Respaldo e importación JSON
- PWA con caché para consulta sin conexión

## Publicar
1. Este proyecto ya se encuentra en el repositorio Agenda-PRO.
2. Activa GitHub Pages en Settings → Pages → Deploy from branch → main / root.
3. Abre la URL HTTPS y pulsa «Activar sonido».

## Limitaciones importantes
La versión web **no garantiza alarmas cuando la app está cerrada, suspendida o el teléfono está bloqueado**. El sonido depende del volumen y de las políticas del navegador; el botón de activación es necesario. No se pueden imponer volumen máximo ni ignorar modo silencio.

Para alarmas confiables con pantalla bloqueada se necesita una app móvil nativa. Android: AlarmManager, permisos de alarmas exactas cuando proceda, notificaciones y UI de alarma. iPhone: UNUserNotificationCenter para avisos locales, con restricciones del sistema sobre duración de sonido y ejecución; no se garantiza tono continuo de 30 segundos.

Los datos están en localStorage del navegador de cada dispositivo. No existe sincronización remota ni inicio de sesión.

## Pruebas
Crea una reunión para 2 minutos después, pulsa «Activar sonido», deja la aplicación abierta y comprueba el aviso de inicio. El botón «Probar alarma» permite ensayar el sonido sin esperar.
