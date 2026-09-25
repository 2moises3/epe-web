# Identidad de Agro Exportaciones F.V. — guía para producto digital

Fuente de verdad para cualquier persona o IA que produzca interfaz, contenido, ilustraciones o documentación visual para **Agro Exportaciones F.V.** Debe leerse junto con `.agents/UX_SYSTEM.md`.

## Esencia de la empresa

Agro Exportaciones F.V. conecta producción agrícola, gestión operativa, calidad, comercialización y exportación. La experiencia debe transmitir control, crecimiento, confianza y cercanía con el campo, sin perder una presencia tecnológica contemporánea.

La marca no es rústica ni artesanal. Es una empresa agroexportadora organizada, moderna y orientada a datos.

## Personalidad

- Confiable.
- Profesional.
- Cercana.
- Eficiente.
- Optimista sin ser infantil.
- Tecnológica sin sentirse fría.
- Agrícola sin recurrir a clichés excesivos.

Palabras guía: **cultivo, progreso, trazabilidad, confianza, conexión, calidad, oportunidad y futuro**.

## Promesa visual

“Del campo al mundo” resume la relación entre origen agrícola y alcance comercial. La interfaz debe combinar:

- Naturaleza: hojas, cultivos, luz, paisajes y formas orgánicas.
- Gestión: datos, métricas, documentos, estados y flujos claros.
- Exportación: conexión, recorrido, coordinación y calidad.

No convertir esta frase en un eslogan obligatorio dentro de todas las pantallas. Usarla solo donde aporte contexto o emoción.

## Logo y branding

- Utilizar los logos existentes en `src/assets/image/`.
- No reconstruir, deformar, rotar ni recolorear el logo arbitrariamente.
- Mantener espacio libre alrededor del logo.
- En fondos intensos, usar una variante que conserve contraste; no improvisar una nueva marca.
- No incorporar nombres personales, nombres de estudiantes ni branding ajeno.
- En banners o cabeceras institucionales, priorizar logo, nombre de empresa y un descriptor breve.

## Color

La fuente de verdad son los tokens de `src/index.css`; no copiar colores aproximados si existe un token.

Tokens principales:

- `--brand`: verde principal de interacción.
- `--brand-dark`: verde profundo para texto o contraste.
- `--brand-surface`: superficie verde muy clara.
- `--brand-border`: bordes de marca.
- `--brand-gradient`: degradado protagonista.
- `--brand-gradient-mid`: tono intermedio para iconos y acentos.
- `--ink`, `--ink-body`, `--ink-muted`: jerarquía de texto.
- `--surface-page`: fondo general.

Reglas:

- El degradado verde es el acento principal en CTA, estados activos, títulos destacados y piezas institucionales.
- Los verdes vivos deben dominar sobre verdes apagados o excesivamente oscuros.
- `--brand-dark` se usa para contraste, no como gran masa de fondo salvo que la composición lo justifique.
- Reservar rojo, naranja y amarillo para estados semánticos.
- No introducir azules, morados o neones como colores protagonistas.
- Evitar saturar una pantalla con degradados; deben señalar jerarquía, no decorar todo.

## Tipografía

- Familia principal: **Plus Jakarta Sans Variable**.
- Títulos: peso fuerte, tracking ligeramente cerrado y frases cortas.
- Texto operativo: claro, directo y de tamaño legible.
- Etiquetas: consistentes; evitar mayúsculas extendidas salvo pequeñas categorías o eyebrow labels.
- No usar tipografías manuscritas en contenido funcional. Pueden aparecer únicamente como recurso decorativo controlado en imágenes institucionales.

## Forma y composición

- Bordes redondeados, limpios y consistentes.
- Tarjetas blancas sobre `--surface-page` con bordes suaves y sombras contenidas.
- Espacio generoso, alineación precisa y jerarquía evidente.
- Formas orgánicas inspiradas en hojas o curvas pueden aparecer como fondos secundarios.
- No llenar las pantallas con ornamentos agrícolas.
- La información operativa siempre tiene prioridad sobre la decoración.

## Iconografía

- Lucide es el lenguaje funcional principal.
- Mantener trazos redondeados y consistentes.
- Colocar iconos en superficies de marca claras cuando se necesite jerarquía.
- No usar simultáneamente múltiples estilos —outline, filled, 3D— dentro del mismo bloque.
- Los iconos no reemplazan etiquetas cuando la acción pueda ser ambigua.

## Fotografía

Las imágenes agrícolas deben sentirse auténticas y de alta calidad:

- Producto en planta o campo, no frutas aisladas sobre fondos artificiales salvo una necesidad concreta.
- Luz natural, profundidad y color realista.
- Mostrar cultivos saludables, procesos ordenados y escala productiva.
- Evitar clichés visuales de banco, manos irreales, frutas deformes o saturación extrema.
- Seleccionar la fruta correcta según la campaña: mango, palta, arándano, fresa, banana o maracuyá.
- Incluir texto sobre fotografía solo si existe contraste suficiente y la composición fue diseñada para ello.

## Ilustraciones y personajes

Las ilustraciones de experiencia deben constituir una familia propia, no una colección de estilos distintos.

Dirección recomendada:

- Personajes adultos vinculados a operaciones agrícolas y administrativas.
- Construcción minimalista, geométrica y corporativa.
- Proporciones naturales simplificadas; no cabezas excesivamente grandes.
- Ropa de trabajo limpia y contemporánea.
- Paleta basada en verdes de marca, blanco, crema y tonos tierra discretos.
- Detalles de hojas, cajas, documentos, parcelas o dispositivos como apoyo narrativo.
- Sombras difusas y profundidad moderada.
- Fondo transparente para poder integrarlas en tarjetas y estados.

Evitar:

- Estética infantil o de videojuego.
- Personajes 3D plásticos genéricos.
- Emojis como ilustración principal.
- Rasgos estereotipados.
- Exceso de elementos en una misma escena.
- Texto, logotipos inventados o marcas de terceros dentro de la ilustración.

## Familia inicial de recursos UX

Cuando se implementen, guardar en `src/assets/ux/`:

- `empty-campaigns.webp`: persona observando una planta o calendario agrícola.
- `empty-search.webp`: persona buscando información entre hojas o registros.
- `loading-data.webp`: persona organizando cajas/datos en tránsito.
- `upload-documents.webp`: documento o certificado entrando en un flujo digital.
- `connection-error.webp`: persona revisando una conexión interrumpida.
- `empty-certifications.webp`: certificado y cultivo esperando validación.
- `coming-soon.webp`: construcción ordenada de un nuevo módulo.

Todas deben compartir paleta, iluminación, perspectiva y lenguaje corporal.

## Movimiento de marca

El movimiento debe sugerir crecimiento y continuidad:

- Ascenso suave.
- Expansión progresiva.
- Hojas que se inclinan ligeramente.
- Líneas o puntos que conectan etapas.
- Datos que aparecen de forma ordenada.

Evitar movimientos nerviosos, rebotes repetitivos, giros continuos o efectos que compitan con el trabajo del usuario.

## Voz y redacción

La voz es directa, útil y humana.

Preferir:

- “Aún no hay campañas registradas”.
- “Guardando cambios…”.
- “No pudimos cargar los proveedores. Intenta nuevamente”.
- “La campaña se creó correctamente”.

Evitar:

- “Oops”.
- “Algo mágico está ocurriendo”.
- Mensajes excesivamente técnicos.
- Frases promocionales dentro de flujos operativos.
- Culpar al usuario por un error.

Usar español claro y consistente. Mantener tildes, unidades y formatos locales. Los verbos de botones deben describir la acción: `Guardar`, `Vincular`, `Adjuntar`, `Exportar`, `Reintentar`.

## Plantilla para generar una ilustración

Cuando una IA deba crear un nuevo recurso, puede partir de esta estructura y adaptarla al estado concreto:

> Ilustración corporativa minimalista para Agro Exportaciones F.V., personaje adulto relacionado con agroexportación realizando [acción], formas geométricas suaves, proporciones naturales simplificadas, paleta verde de marca con blanco, crema y tonos tierra discretos, iluminación limpia, sombras difusas, detalles agrícolas sutiles, composición despejada, fondo transparente, sin texto, sin logos inventados, sin marcas de terceros, estilo coherente con un software empresarial premium.

La IA debe revisar los recursos existentes antes de generar uno nuevo y describir qué elementos conservará para mantener continuidad.

## Revisión antes de aprobar una pieza

- [ ] Representa correctamente el contexto agroexportador.
- [ ] Usa los tokens y verdes de marca.
- [ ] Mantiene contraste y legibilidad.
- [ ] No introduce branding personal.
- [ ] No mezcla estilos incompatibles.
- [ ] La decoración no compite con la información.
- [ ] La imagen corresponde a la fruta o proceso mostrado.
- [ ] El texto usa la voz de la empresa.
- [ ] La pieza funciona en móvil y escritorio.
- [ ] Se conserva la identidad aunque se retire el logo.

## Principio final

Cada pantalla debe sentirse parte del mismo sistema: una plataforma que convierte el trabajo del campo en información clara, decisiones confiables y operaciones conectadas.
