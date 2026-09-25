# Sistema de experiencia de usuario — epe-web

Documento normativo para cualquier persona o IA que diseñe, implemente o revise una vista de **Agro Exportaciones F.V.** Debe leerse junto con `.agents/BRAND_IDENTITY.md` y `AGENTS.md` antes de crear o rediseñar un módulo.

## Objetivo

La aplicación debe sentirse corporativa, confiable, clara y fluida. La percepción premium debe venir de la continuidad, la respuesta inmediata y la consistencia; no de llenar la interfaz de efectos.

Cada interacción debe responder estas preguntas:

1. ¿El usuario entiende qué puede hacer?
2. ¿El sistema reconoce inmediatamente la acción?
3. ¿El usuario sabe si está cargando, terminó o falló?
4. ¿El cambio conserva el contexto espacial?
5. ¿La experiencia sigue siendo accesible y rápida?

## Reglas obligatorias

- Reutilizar primero los componentes existentes de `src/shared/components/` y `src/shared/components/ui/`.
- La lógica específica de negocio permanece dentro de `src/modules/<domain>/`.
- No crear variantes visuales aisladas si el patrón se repite en dos o más módulos: consolidarlo en un componente compartido.
- No añadir una librería de animación mientras CSS, Tailwind y React resuelvan el caso de forma mantenible.
- Toda animación debe respetar `prefers-reduced-motion` mediante las variantes `motion-reduce:*` o una comprobación equivalente.
- Nunca usar animación para retrasar una acción ni ocultar una operación lenta.
- No mostrar un control activo que no haga nada. Implementarlo, deshabilitarlo con explicación o marcarlo como “Próximamente”.
- No usar skeletons para filtrar datos que ya están en memoria. Reservarlos para carga inicial, navegación diferida o solicitudes remotas.
- No sustituir contenido conocido por un spinner de página completa.
- Los formularios deben prevenir envíos duplicados y conservar los datos si una solicitud falla.

## Escala de movimiento

Usar esta escala como referencia para que todos los módulos compartan el mismo ritmo:

| Nivel | Duración | Uso |
| --- | ---: | --- |
| Instantáneo | 100–160 ms | Presión de botón, iconos, checkbox, hover |
| Rápido | 180–240 ms | Tooltip, menú, toast, aparición de error |
| Estándar | 240–320 ms | Cambio tabla/grilla, filtros, filas, popovers |
| Espacial | 350–500 ms | Accordions, entrada de sección, panel lateral |
| Estructural | 600–800 ms | Cambio importante de altura, como `AppModal` |

Curvas recomendadas:

- Entrada natural: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Movimiento progresivo de tamaño: `cubic-bezier(0.45, 0, 0.25, 1)`.
- Salida breve: `cubic-bezier(0.4, 0, 1, 1)`.
- Evitar rebotes fuertes, rotaciones grandes y desplazamientos superiores a 12 px en UI operativa.

## Jerarquía de iconos e ilustraciones

### Iconos funcionales

- **Lucide es la biblioteca principal.** Usarla en navegación, botones, filtros, tablas, formularios, estados y acciones.
- Mantener normalmente `strokeWidth` entre `2` y `2.5`.
- Tamaños orientativos: 16–18 px en controles compactos, 20 px en botones y 24–28 px en encabezados/tarjetas.
- No mezclar bibliotecas dentro de una misma familia de controles.
- Tabler puede usarse excepcionalmente si Lucide no ofrece el concepto requerido y el icono mantiene la misma geometría visual.
- Phosphor duotono solo se admite en estados expresivos grandes si no existe una ilustración propia; nunca para sustituir indiscriminadamente a Lucide.

### Ilustraciones propias

- Preferir ilustraciones propias de Agro F.V. en estados vacíos, onboarding, errores y esperas prolongadas.
- Guardarlas en `src/assets/ux/` con nombres semánticos en kebab-case.
- Usar WebP con transparencia para composiciones raster; usar SVG por capas cuando se necesite movimiento interno.
- No incrustar texto en las imágenes.
- No usar personajes infantiles, emojis 3D, estilos caricaturescos exagerados ni bancos visuales genéricos.
- Reutilizar una misma familia de personajes, proporciones, iluminación y paleta.
- Animar el contenedor con movimientos discretos: flotación de 2–3 px, escala máxima de `1.015`, halo o sombra suave.

## Estados de carga

Elegir el patrón según el contexto:

### Arranque de aplicación

- Mientras se recupera la sesión, mostrar una pantalla de preparación con logo, degradado de marca y texto breve.
- No mostrarla si la respuesta llega antes de unos 200 ms.
- Si aparece, mantenerla alrededor de 400 ms como mínimo para evitar parpadeo.

### Carga de página

- Mantener `TopNavBar` visible y estable.
- Usar un skeleton con la misma geometría aproximada de la vista final.
- No centrar un spinner solitario en una página con estructura conocida.

### Acción puntual

- El botón cambia a un estado pendiente: icono spinner + verbo en gerundio (`Guardando…`, `Adjuntando…`, `Exportando…`).
- Deshabilitar el botón y las acciones incompatibles durante la solicitud.
- No cerrar el modal hasta recibir confirmación satisfactoria.

### Espera prolongada o proceso especial

- Si supera aproximadamente un segundo y no existe una estructura final predecible, puede usarse una ilustración propia con progreso o explicación.
- Nunca inventar porcentajes si el backend no proporciona progreso real.

## Feedback y resultados

- Usar toast para acciones pequeñas y no bloqueantes: exportar, copiar, limpiar filtros, adjuntar o errores recuperables.
- Usar `SuccessModal` para altas, ediciones o procesos relevantes que requieran una decisión posterior.
- Un error debe indicar qué ocurrió, qué se conservó y cómo reintentar.
- Los mensajes no deben depender únicamente del color; incluir icono y texto.
- Las operaciones de red deben contemplar `idle`, `pending`, `success` y `error`.
- Evitar pantallas completas para notificaciones breves como “Conexión restaurada”; usar un aviso flotante.

## Transiciones de navegación y contenido

### Páginas

- La barra superior permanece fija.
- El contenido de la ruta puede entrar con opacidad y desplazamiento vertical de 6–8 px durante 220–280 ms.
- No animar toda la página cuando solo cambia una fila o un filtro.
- Al volver desde una subvista, conservar el contexto cuando sea posible: filtros, pestaña, página y posición.

### Tabs y controles segmentados

- El indicador se desplaza; no debe reaparecer desde cero.
- El contenido cambia con un fundido corto y puede adaptar suavemente su altura.
- Mantener el foco y anunciar el tab activo mediante atributos accesibles.

### Tablas y grillas

- El cambio tabla/grilla usa fundido cruzado de 180–240 ms.
- Una fila creada o actualizada puede resaltarse suavemente durante 1–2 segundos.
- Al paginar, enfocar o desplazar al encabezado de resultados sin movimiento brusco.
- Mantener estable la altura durante una actualización para evitar saltos.

### Modales

- Usar `AppModal` como carcasa compartida: título, descripción, cierre y animación estructural.
- El contenido de dominio se entrega como `children`; no introducir lógica de negocio en `AppModal`.
- No duplicar el cierre superior con un footer que solo contenga “Cerrar”.
- Ocultar visualmente el scrollbar si puede conservarse el desplazamiento con rueda, teclado y tacto.
- Mantener el foco dentro del modal y devolverlo al control que lo abrió.

## Formularios

- Validar al salir del campo o al intentar enviar; no castigar al usuario desde la primera pulsación.
- Mostrar el error cerca del campo con una transición breve de altura y opacidad.
- Tras un envío inválido, llevar el foco al primer error.
- Mostrar claramente campos obligatorios y formatos esperados.
- Si existen cambios sin guardar, solicitar confirmación antes de abandonar cuando la pérdida sea material.
- Adjuntos: validar tipo y tamaño, mostrar archivo seleccionado, progreso real, vista previa y opción de reemplazo.

## Estados vacíos y errores

Un buen estado vacío contiene:

1. Ilustración o icono expresivo.
2. Título que describe el estado.
3. Explicación breve y útil.
4. Acción principal cuando exista una salida lógica.

Distinguir siempre:

- Sin datos todavía.
- Sin resultados por filtros.
- Error al cargar.
- Sin permisos.
- Funcionalidad próxima.
- Recurso no encontrado.

No redirigir silenciosamente una URL inválida; mostrar una vista clara con opción para volver.

## Accesibilidad

- Todo control interactivo debe ser `button`, `a`/`Link` o un elemento con semántica y teclado equivalentes.
- Mantener indicadores `focus-visible` consistentes.
- Iconos decorativos usan `aria-hidden`; botones de solo icono llevan `aria-label`.
- Los cambios importantes deben anunciarse con `role="status"` o `aria-live` sin repetir mensajes.
- Contraste suficiente en texto, badges, placeholders y estados deshabilitados.
- No depender de hover para revelar una acción esencial.

## Rendimiento percibido

- Preferir carga diferida por ruta para módulos grandes.
- Definir dimensiones de imágenes para evitar cambios de layout.
- Usar `loading="lazy"` fuera del primer viewport y placeholders difuminados en imágenes protagonistas.
- No ejecutar animaciones costosas de blur o sombras grandes en listas extensas.
- Importar iconos de forma estática para conservar tree-shaking.

## Componentes compartidos recomendados

Crear únicamente cuando llegue la fase de implementación correspondiente:

- `AppBootScreen`: preparación inicial de sesión.
- `PageTransition`: transición breve del contenido de ruta.
- `AsyncButton`: estados pendiente/éxito/error de una acción.
- `TableSkeleton`: estructura reutilizable de listados.
- `MetricSkeleton`: métricas y tarjetas de resumen.
- `ErrorState`: error recuperable con reintento.
- `ComingSoonState`: funcionalidad visible pero todavía no disponible.

No crear wrappers que solo cambien clases de un componente shadcn; extender directamente el componente de `shared/components/ui/` cuando corresponda, según `AGENTS.md`.

## Checklist para cada módulo nuevo

Antes de dar un módulo por terminado, comprobar:

- [ ] Carga inicial y skeleton.
- [ ] Estado vacío real.
- [ ] Cero resultados por filtros.
- [ ] Error y reintento.
- [ ] Estado pendiente de cada operación.
- [ ] Confirmación de éxito proporcional.
- [ ] Controles sin implementar deshabilitados o marcados.
- [ ] Navegación hacia atrás conserva contexto.
- [ ] Responsive móvil, tablet y escritorio.
- [ ] Teclado, foco y etiquetas accesibles.
- [ ] `prefers-reduced-motion` respetado.
- [ ] Sin saltos de layout ni scrollbars transitorios.
- [ ] Iconos coherentes con Lucide.
- [ ] Textos alineados con la identidad de marca.
- [ ] ESLint y build correctos.

## Criterio final

Una pantalla no está terminada solo porque “se ve bonita”. Está terminada cuando el usuario puede entenderla, operar sin incertidumbre, recuperarse de errores y percibir continuidad en cada cambio.
