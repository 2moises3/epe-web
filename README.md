# EPE Web

Frontend de EPE construido con React, TypeScript, Vite y Tailwind CSS.

## Requisitos

- Node.js 22+
- npm 10+
- Docker 24+ (solo para ejecutar con contenedor)

## Configuración local

1. Instala dependencias:

   ```bash
   npm ci
   ```

2. Crea el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

   En Windows PowerShell puedes usar `Copy-Item .env.example .env`.

3. Define `VITE_API_BASE_URL` en `.env` si el frontend consume el backend.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Vite mostrará la URL local, normalmente `http://localhost:5173`.

## Comandos útiles

```bash
npm run build   # Verifica tipos y genera dist/
npm run lint    # Ejecuta ESLint
npm run preview # Sirve localmente el build generado
```

## Ejecutar con Docker

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

## Despliegue

Publica la imagen en un registry y despliega el puerto `80`:

```bash
docker tag epe-web registry.example.com/epe-web:latest
docker push registry.example.com/epe-web:latest
docker pull registry.example.com/epe-web:latest
docker run -d --name epe-web -p 80:80 registry.example.com/epe-web:latest
```

En plataformas administradas, configura el contenedor para escuchar en el puerto `80` y define `VITE_API_BASE_URL` como argumento de build en el pipeline, no como variable de runtime.

## Estructura

- `src/modules/`: funcionalidades agrupadas por dominio.
- `src/shared/`: componentes, layout y utilidades transversales.
- `src/shared/api/client.ts`: cliente HTTP compartido.
