![Agro Exportaciones F.V. — Software de gestión](public/image/banner.png)

<p align="center">
  <strong>El centro de operaciones digital de Agro Exportaciones F.V.</strong><br>
  Campañas agrícolas, relaciones comerciales y seguimiento operativo en una misma experiencia web.
</p>

<p align="center">
  <img src="public/image/stack.svg" width="920" alt="React 19 · TypeScript 6 · Vite 8 · Tailwind CSS 4 · shadcn/ui · pnpm">
</p>

<p align="center">
  <a href="#el-sistema">El sistema</a> ·
  <a href="#modulos">Módulos</a> ·
  <a href="#inicio-local">Inicio local</a> ·
  <a href="#arquitectura">Arquitectura</a> ·
  <a href="#identidad-visual">Identidad visual</a>
</p>

---

<a id="el-sistema"></a>
## 🌱 Del origen agrícola a la gestión digital

**Agro Exportaciones F.V.** reúne en este frontend la planificación de campañas, la información de proveedores y el seguimiento de clientes. La campaña funciona como punto de encuentro: fechas, fruta, variedades, requerimientos comerciales, cosecha, certificaciones y participantes se presentan en una vista de detalle.

La experiencia combina tablas y tarjetas, filtros, formularios en modales y una identidad visual inspirada en el campo. El objetivo es facilitar la lectura de la operación y mantener una navegación coherente entre áreas.

> **Estado del proyecto · Frontend en desarrollo**
>
> La integración con el backend está en curso: campañas, relaciones de campaña y listados de proveedores/clientes consumen algunas APIs; el CRUD de transporte también quedó conectado. Otras vistas siguen parciales o usan datos de demostración. El acceso aún simula una sesión en IndexedDB y no valida credenciales contra el backend. Consulta el [mapa de integración frontend/backend](docs/backend-api-integration.md) para ver el estado por vista y lo pendiente.

<a id="modulos"></a>
## 🧭 Un sistema organizado por áreas

| Área | Qué encontrarás | Estado actual |
| :--- | :--- | :--- |
| 🌾 **Gestión de campañas** | Campañas, fruta/derivadas, relaciones con proveedores/clientes y certificados. | Integración parcial; pagos a transportistas sin API backend |
| 🤝 **Gestión de proveedores** | Directorio, filtros, detalle y entrevista. | Listado conectado; CRUD, certificados, exámenes y frutas pendientes |
| 🏢 **Planificación comercial** | Directorio y gestión de clientes/contratos. | Listado API parcial; edición y vistas comerciales pendientes |
| 🚚 **Gestión de transporte** | Empresas, vehículos, choferes y pagos. | CRUD de empresas/vehículos/choferes conectado; trazabilidad pendiente; pagos sin API backend |
| 🛡️ **Gestión de calidad** | Certificaciones de campañas y proveedores. | Certificados de campaña parcialmente conectados; certificados/exámenes de proveedor pendientes |

### Una campaña, varias perspectivas

<table>
  <tr>
    <td width="33%" valign="top">
      <strong>📅 Planificar</strong><br><br>
      Fechas, duración, fruta, variedades y requerimiento comercial para contextualizar cada campaña.
    </td>
    <td width="33%" valign="top">
      <strong>🌿 Dar seguimiento</strong><br><br>
      Kilos estimados y cosechados, avance de cosecha y vigencia de certificaciones.
    </td>
    <td width="33%" valign="top">
      <strong>🔗 Conectar</strong><br><br>
      Proveedores, clientes, contactos y pagos relacionados con la operación.
    </td>
  </tr>
</table>

Los recursos visuales de campaña se adaptan a **mango, palta, arándano, fresa, banana y maracuyá**. Si la fruta no se identifica, se utiliza una imagen agrícola de respaldo.

<details>
<summary><strong>🗺️ Explorar las rutas de la aplicación</strong></summary>

Las rutas de trabajo requieren la sesión local de demostración.

| Ruta | Vista |
| :--- | :--- |
| `/login` | Acceso, confirmación y recuperación de cuenta en la interfaz |
| `/modules` | Selector de áreas |
| `/campaigns` | Gestión de campañas |
| `/campaigns/:id` | Detalle de una campaña |
| `/campaigns/:id/providers` | Proveedores de una campaña |
| `/campaigns/:id/carrier-payments` | Pagos a transportistas |
| `/proveedores` | Directorio de proveedores |
| `/planificacion-comercial` | Directorio de clientes |

</details>

<a id="inicio-local"></a>
## ⚡ Ejecutar en local

Necesitas **Node.js 22.12 o superior** y **pnpm** compatible con el lockfile v9 del repositorio. El proyecto utiliza `pnpm-lock.yaml` como referencia de dependencias.

Desde la raíz del proyecto:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abre la dirección que indique Vite en la terminal, normalmente `http://localhost:5173`.

**Recorrido de demostración:** entra en `/login`, pulsa **Ingresar** y luego **Confirmar**. El flujo actual permite explorar los módulos sin credenciales reales; los campos de usuario y código aún no se verifican con un servicio.

### Configuración de API

Copia [`.env.example`](.env.example) como `.env` cuando configures un backend y completa:

```dotenv
VITE_API_BASE_URL=
```

La variable alimenta al [cliente Axios compartido](src/shared/api/client.ts). Puede permanecer vacía para recorrer las pantallas de muestra. Las variables `VITE_*` se incluyen en el frontend: no deben contener secretos.

### Comandos del proyecto

| Comando | Función |
| :--- | :--- |
| `pnpm dev` | Inicia Vite con recarga durante el desarrollo |
| `pnpm build` | Comprueba TypeScript y genera el bundle en `dist/` |
| `pnpm preview` | Sirve el resultado de una compilación local |
| `pnpm lint` | Ejecuta ESLint sobre el proyecto |

### 🐳 Ejecutar con Docker

La imagen usa dos etapas: Node compila la aplicación y Nginx sirve los archivos estáticos. La configuración de Nginx incluye fallback para las rutas de React Router.

Construye la imagen pasando la URL del backend:

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.ejemplo.com -t epe-web .
```

Ejecuta el contenedor:

```bash
docker run --rm -p 8080:80 epe-web
```

Abre `http://localhost:8080`.

> `VITE_API_BASE_URL` queda incorporada en el bundle durante `docker build`; cambiar variables al ejecutar el contenedor no modifica una imagen ya construida. Para otro backend, vuelve a construir la imagen.

<details>
<summary><strong>🧩 Notas de ejecución y publicación</strong></summary>

- **Rutas:** la aplicación utiliza `BrowserRouter`. El hosting debe servir `index.html` para las rutas de la SPA.
- **Caché:** se registra el service worker de [`public/sw.js`](public/sw.js), que utiliza una estrategia de caché primero. Si una actualización no aparece en local, elimina la caché del sitio y desregistra el service worker desde las herramientas del navegador.
- **Conectividad:** la app muestra una pantalla al perder conexión y un aviso al recuperarla. Esto no equivale a sincronización de operaciones de negocio sin conexión.
- **Persistencia:** conservar la sesión de demostración no implica guardar en un servidor los cambios realizados en los formularios.

</details>

<a id="arquitectura"></a>
## 🧱 Una base compartida, módulos por dominio

La organización sigue **Screaming Architecture**: las carpetas principales describen las áreas del negocio. Cada módulo mantiene sus páginas, componentes y datos; lo transversal vive en `shared/`.

```text
src/
├── modules/
│   ├── auth/                  Acceso y confirmación
│   ├── campaigns/             Campañas y su operación
│   ├── commercial-planning/   Clientes y planificación comercial
│   ├── providers/             Proveedores y evaluación
│   └── users/                 Centro de módulos
├── shared/
│   ├── api/                   Cliente HTTP único
│   ├── components/
│   │   └── ui/                Catálogo shadcn/ui
│   ├── hooks/                 Comportamientos reutilizables
│   ├── layout/                Navegación y estructura de páginas
│   ├── offline/               Persistencia de sesión local
│   ├── styles/                Degradados de marca
│   └── utils/                 Utilidades, incluida exportación CSV
├── assets/                    Logos, fotografías e imágenes
├── lib/                       Utilidades base
└── index.css                  Tokens e identidad visual

public/image/                 Banner, badges y otros recursos públicos
```

| Capa | Tecnología | Papel en el proyecto |
| :--- | :--- | :--- |
| Interfaz | **React 19 · TypeScript 6** | Componentes tipados y estado de las vistas |
| Desarrollo | **Vite 8 · SWC** | Servidor de desarrollo y compilación |
| Diseño | **Tailwind CSS 4 · shadcn/ui · Base UI** | Estilos, primitivas y componentes reutilizables |
| Navegación | **React Router 7** | Rutas del sistema y acceso a las vistas |
| Integración | **Axios** | Cliente HTTP centralizado para la futura API |
| Recursos visuales | **Lucide · Plus Jakarta Sans** | Iconografía y tipografía del sistema |

### Convenciones que mantienen la coherencia

- **Componentes por dominio:** `modules/<domain>/components` se mantiene plano, junto a sus páginas.
- **Imports internos:** usar `@/`; los relativos se reservan para el catálogo vendorizado de UI.
- **Composición:** `AppModal`, tablas, filtros y estados compartidos permiten mantener el mismo lenguaje visual entre módulos.
- **UI vendorizada:** los componentes de `shared/components/ui/` se actualizan mediante shadcn; la lógica de negocio pertenece a los módulos.
- **Integración futura:** API, DTO y mapper por dominio cuando se conecte al backend. Las páginas consumirán modelos de frontend, sin depender de DTOs ni de Axios directamente.

Consulta [AGENTS.md](AGENTS.md) para las decisiones de arquitectura y las reglas de trabajo del repositorio.

<a id="identidad-visual"></a>
## 🎨 Cultivando confianza, también en la interfaz

El sistema utiliza el **verde de marca**, su degradado principal, superficies claras y acentos agrícolas. Los títulos, controles, tarjetas y microinteracciones comparten esa identidad.

| Recurso | Fuente del proyecto |
| :--- | :--- |
| Colores, superficies y tipografía | [Tokens en `src/index.css`](src/index.css) |
| Degradados y superficies activas | [`brandGradients.ts`](src/shared/styles/brandGradients.ts) |
| Logo de Agro Exportaciones F.V. | [Logo original](src/assets/image/logo_empresa_only.webp) |
| Imágenes por fruta | [Configuración visual de campañas](src/modules/campaigns/campaignFruit.ts) |
| Cabecera del repositorio | [PNG](public/image/banner.png) · [SVG editable](public/image/banner.svg) |

Los gráficos de esta presentación están guardados en el repositorio. El banner presenta el logo real en blanco, centrado sobre un degradado verde de la identidad del sistema.

---

<p align="center">
  <strong>Agro Exportaciones F.V.</strong><br>
  <sub>Cultivando confianza · Del campo al mundo</sub>
</p>
