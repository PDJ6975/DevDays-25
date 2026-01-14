# ¿Cómo levantar cada una de las apps?

## Estructura del Proyecto

El proyecto consta de tres aplicaciones independientes:

- **2025-workshop-backend**: Backend base modificado realizado en el taller
- **n2-p2-weather-app** (creada desde cero): API meteorológica con OpenTelemetry, Prometheus y Grafana en la que se desarrolla la propuesta de nivel 2
- **dev-days-25-frontend**: Frontend Next.js elaborado en el taller

## Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd DevDays-25
```

### 2. Configurar variables de entorno

Copiar los archivos `.env.example` a `.env` en cada aplicación y configurar las variables necesarias:

**2025-workshop-backend:**
```bash
cd 2025-workshop-backend
cp .env.example .env
```

**n2-p2-weather-app:**
```bash
cd n2-p2-weather-app
cp .env.example .env
```

### 3. Instalar dependencias

Instalar dependencias en cada aplicación:

```bash
# Backend principal
cd 2025-workshop-backend
npm install

# Weather app
cd ../n2-p2-weather-app
npm install

# Frontend
cd ../dev-days-25-frontend
npm install
```

## Levantamiento de Aplicaciones

Los repositorios comparten una red Docker (`devdays-network`) para usar un único contenedor de MongoDB. El docker-compose de `n2-p2-weather-app` es el principal y debe levantarse primero.

### Paso 1: Levantar infraestructura principal (n2-p2-weather-app)

```bash
cd n2-p2-weather-app/infrastructure
docker-compose up -d
```

Esto levanta:
- **MongoDB** (puerto 27017) - Compartido por todos los proyectos
- **Weather API** (puerto 3001)
- **Prometheus** (puerto 9090)
- **Grafana** (puerto 3003)

### Paso 2: Levantar backend principal (2025-workshop-backend)

Una vez que la infraestructura de weather-app está corriendo:

```bash
cd 2025-workshop-backend/infrastructure
docker-compose -f docker-compose-local.yml up -d
```

Esto levanta:
- **DevDays App** (puerto 3000) - Se conecta al MongoDB compartido
- **Proxy Nginx** (puerto 80)
- **Frontend Nginx** (puerto 8080)

### Paso 3: Levantar frontend (dev-days-25-frontend)

```bash
cd dev-days-25-frontend
npm run dev
```

### Desarrollo local

Si prefieres ejecutar las aplicaciones localmente en lugar de en contenedores:

**Weather App en local:**
```bash
# 1. Levantar solo infraestructura
cd n2-p2-weather-app/infrastructure
docker-compose up -d mongodb prometheus grafana

# 2. Modificar prometheus.yml para apuntar a host.docker.internal:9464

# 3. Reiniciar Prometheus
docker-compose restart prometheus

# 4. Ejecutar app localmente
cd ..
npm run dev
```

**Backend principal en local:**
```bash
# Asegúrate de que weather-app infrastructure esté corriendo primero
cd 2025-workshop-backend
npm run dev
```

### Bases de datos en MongoDB

Con esta configuración, en MongoDB Compass (`localhost:27017`) verás:
- `weather-db` - Base de datos de la Weather API
- `isadevdays2025` - Base de datos del backend principal del taller

## Verificación de Servicios

Una vez levantadas las aplicaciones, verificar el acceso:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Backend Principal | http://localhost:3000 | - |
| Backend Principal (Docs) | http://localhost:3000/docs | - |
| Weather API | http://localhost:3001 | - |
| Weather API (Docs) | http://localhost:3001/docs | - |
| Frontend | http://localhost:3000 | - |
| Métricas Weather App | http://localhost:9464/metrics | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3003 | admin/admin |

## Comandos Útiles

**Detener todos los contenedores (orden inverso):**
```bash
# Primero backend
cd 2025-workshop-backend/infrastructure
docker-compose -f docker-compose-local.yml down

# Luego weather-app
cd ../../n2-p2-weather-app/infrastructure
docker-compose down
```

**Detener y eliminar volúmenes:**
```bash
cd n2-p2-weather-app/infrastructure
docker-compose down -v
```

**Ver logs de un servicio:**
```bash
# Weather-app services
cd n2-p2-weather-app/infrastructure
docker-compose logs -f [servicio]  # mongodb, weather-app, prometheus, grafana

# Backend services
cd 2025-workshop-backend/infrastructure
docker-compose -f docker-compose-local.yml logs -f [servicio]  # devdays-app, devdays-proxy
```

**Reiniciar un servicio:**
```bash
docker-compose restart [servicio]
```

## Estructura de Directorios

```
DevDays-25/
├── 2025-workshop-backend/      # Backend principal del workshop
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── scripts/
│   └── package.json
├── n2-p2-weather-app/          # API meteorológica creada para la propuesta 2
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── docs/images/
│   └── infrastructure/
│       ├── docker-compose.yml
│       ├── prometheus.yml
│       └── grafana/provisioning/
├── dev-days-25-frontend/       # Frontend Next.js del workshop
│   ├── app/
│   ├── components/
│   └── package.json
├── DELIVERABLES.md             # Documentación de entregables
├── EXECUTION.md                # Guía de ejecución
└── README.md                   # Este archivo
```
