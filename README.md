
RentOS es una plataforma SaaS diseñada para la gestión integral de alquiler de vehículos y flotas. Este repositorio contiene la base técnica, la infraestructura y el diseño inicial del sistema.

## 🛠️ Guía de Inicio desde Cero

Si usted es un usuario nuevo y no tiene herramientas instaladas, siga estos pasos en orden:

### 1. Instalación de Herramientas Básicas
1. **Node.js (v20+):** Descárguelo de [nodejs.org](https://nodejs.org/). Esto incluye `npm`, que usaremos para manejar el proyecto.
2. **Docker Desktop:** Descárguelo de [docker.com](https://www.docker.com/products/docker-desktop/). 
   - *Importante:* En Windows, reinicie el equipo tras la instalación.
3. **Git:** Descárguelo de [git-scm.com](https://git-scm.com/).

### 2. Preparación del Proyecto
Abra su terminal (PowerShell o CMD) dentro de la carpeta del proyecto y ejecute:

```bash
# Instalar dependencias del proyecto
npm install
```

### 3. Ejecución local

```bash
npm run dev
```

### 4. Verificación rápida

```bash
npm run test
npm run build
```

## Instrucciones de Ejecución (Docker)
1. Asegúrese de tener Docker instalado.
2. Ejecute el comando: `docker-compose up --build` o si ya realizó la construcción inicial, puede simplemente ejecutar:
 `docker compose up`
3. Acceda a: `http://localhost:3000`

## Justificaciones Técnicas
* **Next.js & TypeScript:** Elegidos para asegurar escalabilidad y tipado fuerte, reduciendo errores en tiempo de ejecución.
* **i18n & a11y:** Internacionalización y accesibilidad implementadas a nivel de aplicación con contexto y etiquetas ARIA.
* **Docker:** Garantiza que el entorno de desarrollo sea idéntico al de producción. 




* Borrar
docker compose down
docker system prune -f
docker compose up --build
docker compose build --no-cache
docker compose up