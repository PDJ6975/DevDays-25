# Guía de Ejecución - DevDays 2025

Este documento proporciona instrucciones detalladas para ejecutar y reproducir cada uno de los entregables implementados en el workshop.

---

## Índice

### Entregables de Nivel 1
- [N1-1: Función recursiva - Paginación de datos de la API de GitHub](#n1-1-función-recursiva---paginación-de-datos-de-la-api-de-github)
- [N1-2: Creación de métricas personalizadas](#n1-2-creación-de-métricas-personalizadas)
- [N1-3: Integración de LLM providers](#n1-3-integración-de-llm-providers)

### Propuesta de Nivel 2 Realizada
- [N2-P2-A: Auditoría sobre datos meteorológicos](#n2-p2-a-auditoría-sobre-datos-meteorológicos)
- [N2-P2-B: Audio resumen del tiempo pasado con IA](#n2-p2-b-audio-resumen-del-tiempo-pasado-con-ia)
- [N2-P2-C: Instrumentación y observabilidad con Prometheus/Grafana](#n2-p2-c-instrumentación-y-observabilidad-con-prometheusgrafana)

---

## Prerequisitos Generales

Antes de ejecutar los entregables, es necesario tener las aplicaciones levantadas según las instrucciones del README

---

# ENTREGABLES DE NIVEL 1

## N1-1: Función recursiva - Paginación de datos de la API de GitHub

### Ejecución

La función recursiva de paginación está integrada en tres endpoints diferentes del backend principal (`2025-workshop-backend`).

#### Endpoint 1: Genérico

**Petición:**
```bash
POST http://localhost:3000/api/v1/github/fetch
Content-Type: application/json

{
  "url": "/repos/tj/git-extras/commits",
  "params": { "per_page": 10 }
}
```

**Descripción:** Este endpoint acepta cualquier ruta de la API de GitHub y parámetros personalizados. La función paginará automáticamente todos los resultados.

#### Endpoint 2: Pull Requests (módulo nuevo)

**Petición:**
```bash
POST http://localhost:3000/api/v1/pullrequests/fetch
Content-Type: application/json

{
  "repository": {
    "owner": "tj",
    "name": "git-extras"
  }
}
```

**Descripción:** Obtiene todos los pull requests del repositorio especificado y los guarda en la base de datos.

**Verificación:**
- La respuesta incluye todos los PRs paginados
- Los datos se almacenan en la base de datos
- Se puede verificar con: `GET http://localhost:3000/api/v1/pullrequests`

#### Endpoint 3: Issues (adaptado para usar la función genérica)

**Petición:**
```bash
POST http://localhost:3000/api/v1/issues/fetch
Content-Type: application/json

{
  "repository": {
    "owner": "glzr-io",
    "name": "glazewm"
  }
}
```

**Descripción:** Similar al endpoint de PRs, obtiene y almacena todos los issues del repositorio.

### Consideraciones

- **Swagger:** El endpoint genérico puede presentar problemas de carga en Swagger con grandes volúmenes de datos. Se recomienda usar Postman o curl para las pruebas.
- **Rate Limit:** GitHub limita peticiones sin autenticación. Para pruebas extensivas, configurar un token en las variables de entorno.

---

## N1-2: Creación de métricas personalizadas

### Ejecución

Las métricas personalizadas se registran automáticamente en el servicio de paginación de GitHub y se muestran por consola cada 5 segundos mediante el exportador configurado en `otel.js`.

#### Métrica 1: Inter-Page Latency (Histograma)

**Verificación:**
1. Realizar una petición al endpoint de GitHub que requiera paginación:
   ```bash
   POST http://localhost:3000/api/v1/github/fetch
   {
     "url": "/repos/tj/git-extras/commits",
     "params": { "per_page": 10 }
   }
   ```
2. Observar la consola del backend
3. Buscar en la salida las métricas `github.api.inter_page_latency`
4. Verificar que aparecen valores para diferentes páginas con el atributo `page`

#### Métrica 2: Error Rate (Observable Gauge)

**Verificación:**
1. Realizar varias peticiones exitosas al endpoint de GitHub
2. Realizar alguna petición que falle (URL incorrecta, repositorio inexistente):
   ```bash
   POST http://localhost:3000/api/v1/github/fetch
   {
     "url": "/repos/owner-inexistente/repo-inexistente/issues"
   }
   ```
3. Observar la consola del backend
4. Buscar en la salida la métrica `github.api.error_rate`
5. Verificar que el valor refleja el porcentaje de errores

---

## N1-3: Integración de LLM providers

### Prerequisitos

- **Ollama instalado** en el sistema
- **Modelo configurado** disponible localmente

### Verificación de requisitos

Ejecutar el script de verificación:

```bash
cd 2025-workshop-backend
node src/scripts/check-ollama.js
```

### Cambio de provider

El cambio ya está implementado en el código. Para verificar:

**Archivo:** `2025-workshop-backend/src/controllers/ai.controller.js`

Verificar que la importación sea:
```javascript
import { generateSummary } from '../services/ollama.service.js';
```

En lugar de:
```javascript
import { generateSummary } from '../services/openai.service.js';
```

### Ejecución

**Petición de prueba:**
```bash
POST http://localhost:3000/api/v1/ai/summary
Content-Type: application/json

{
  "text": "Este es un texto de ejemplo para generar un resumen usando Ollama localmente."
}
```

**Verificación:**
- La respuesta debe contener un resumen generado por el modelo local de Ollama

---

# PROPUESTA DE NIVEL 2 REALIZADA

## N2-P2-A: Auditoría sobre datos meteorológicos

### Prerequisitos

- **MongoDB** corriendo
- **Variables de entorno** configuradas (ver `.env.example` en `n2-p2-weather-app`)

### Flujo completo de ejecución

#### Paso 1: Obtener datos meteorológicos de OpenMeteo

**Petición:**
```bash
POST http://localhost:3001/api/v1/weather/fetch
Content-Type: application/json

{
  "city": "Zaragoza",
  "countryCode": "ES",
  "weeksBack": 3
}
```

**Descripción:**
- Obtiene datos históricos de las últimas 3 semanas
- Almacena datos en MongoDB

#### Paso 2: Crear auditoría sobre los datos

**Petición:**
```bash
POST http://localhost:3001/api/v1/audits
Content-Type: application/json

{
  "city": "Zaragoza",
  "countryCode": "ES",
  "dateFrom": "2025-12-26",
  "dateTo": "2026-01-01",
  "thresholdTemp": 7.3
}
```

**Respuesta esperada:**
```json
{
  "auditId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "city": "Zaragoza",
  "countryCode": "ES",
  "dateFrom": "2025-12-26",
  "dateTo": "2026-01-01",
  "thresholdTemp": 7.3,
  "compliant": true,
  "metadata": {
    "totalWeeks": 2,
    "weeksCompliant": 2,
    "weeksNonCompliant": 0,
    "complianceRate": 100,
    "rule": "Average weekly temperature >= 7.3°C"
  },
  "evidences": [
    {
      "weekNumber": 1,
      "weekStart": "2025-12-23",
      "weekEnd": "2025-12-29",
      "avgTemp": 8.5,
      "daysInWeek": 4,
      "compliant": true
    },
    ...
  ]
}
```

### Error común: Datos incompletos

Si faltan datos meteorológicos, la respuesta será:

```json
{
  "message": "No weather data found for Zaragoza, ES between 2025-12-26 and 2026-01-01...",
  "details": {
    "fetchRequest": {
      "method": "POST",
      "endpoint": "/api/v1/weather/fetch",
      "body": {
        "city": "Zaragoza",
        "countryCode": "ES",
        "weeksBack": 3
      }
    }
  }
}
```

**Solución:** Ejecutar primero la petición sugerida en `details.fetchRequest`.

### Endpoints CRUD adicionales para pruebas

**Obtener auditoría por ID:**
```bash
GET http://localhost:3001/api/v1/audits/{auditId}
```

**Listar todas las auditorías:**
```bash
GET http://localhost:3001/api/v1/audits?limit=20&skip=0&sort={"createdAt":-1}
```

**Auditorías por ciudad:**
```bash
GET http://localhost:3001/api/v1/audits/Zaragoza/ES?dateFrom=2025-01-01&dateTo=2025-12-31
```

**Parámetros de paginación:**
- `limit`: Número máximo de resultados (default: 50)
- `skip`: Elementos a saltar (default: 0)
- `sort`: Objeto JSON para ordenación (ej: `{"createdAt": -1}`)

---

## N2-P2-B: Audio resumen del tiempo pasado con IA

### Prerequisitos

- **OpenAI API Key** configurada en `.env`
- **Datos meteorológicos** de la última semana disponibles en BD

### Flujo de ejecución

#### Paso 1: Asegurar datos meteorológicos

Verificar que existen datos de los últimos 7 días:

```bash
POST http://localhost:3001/api/v1/weather/fetch
Content-Type: application/json

{
  "city": "Sevilla",
  "countryCode": "ES",
  "weeksBack": 1
}
```

#### Paso 2: Generar audio resumen

**Petición:**
```bash
POST http://localhost:3001/api/v1/ai/audio-summary
Content-Type: application/json

{
  "city": "Sevilla",
  "countryCode": "ES"
}
```

**Respuesta:**
- **Content-Type:** `audio/mpeg`
- **Archivo:** MP3 descargable
- **Duración:** Aproximadamente 30-60 segundos

### Reproducción del audio

**Con Postman:**
1. Enviar la petición
2. En la respuesta, podrás escuchar el audio directamente sin necesidad de descargarlo

### Acceso a la transcripción

La transcripción del audio se encuentra en la cabecera HTTP `X-Transcript`:

**Con Postman:**
- Revisar la pestaña "Headers" de la respuesta
- Buscar `X-Transcript`
- Decodificar URL (el valor está codificado con `encodeURIComponent`)

### Error común: Datos incompletos

Si faltan datos de la última semana:

```json
{
  "message": "No complete data was found for the last 7 days for Sevilla, ES...",
  "details": {
    "fetchRequest": {
      "method": "POST",
      "endpoint": "/api/v1/weather/fetch",
      "body": {
        "city": "Sevilla",
        "countryCode": "ES",
        "weeksBack": 1
      }
    }
  }
}
```

**Solución:** Ejecutar la petición sugerida para obtener los datos.

---

## N2-P2-C: Instrumentación y observabilidad con Prometheus/Grafana

### Prerequisitos

- **Docker y Docker Compose** instalados
- **Servicios levantados** según instrucciones del README
- Todos los contenedores de `n2-p2-weather-app` corriendo

### Acceso a servicios

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Weather API | `http://localhost:3001` | - |
| Métricas OpenTelemetry | `http://localhost:9464/metrics` | - |
| Prometheus | `http://localhost:9090` | - |
| Grafana | `http://localhost:3003` | admin/admin |

### Verificación de métricas

#### 1. Generar tráfico en la aplicación

Realizar peticiones a los diferentes endpoints para generar métricas.

#### 2. Verificar métricas en OpenTelemetry

Acceder a `http://localhost:9464/metrics` y verificar que se estén recopilando las métricas:

```
# HELP http_request_durations_seconds Duration of HTTP requests in seconds
# TYPE http_request_durations_seconds histogram
http_request_durations_seconds_bucket{method="POST",route="/api/v1/weather/fetch",status_code="200",le="0.1"} 5
http_request_durations_seconds_bucket{method="POST",route="/api/v1/weather/fetch",status_code="200",le="0.5"} 8
...
http_request_durations_seconds_sum{method="POST",route="/api/v1/weather/fetch",status_code="200"} 2.345
http_request_durations_seconds_count{method="POST",route="/api/v1/weather/fetch",status_code="200"} 10
```

### Acceso a Grafana

#### 1. Login inicial

1. Acceder a `http://localhost:3003`
2. Usuario: `admin`
3. Contraseña: `admin`

#### 2. Dashboard provisionado

El dashboard "Dashboard Weather API" se carga automáticamente gracias al provisioning.

**Paneles disponibles:**
1. Latencia Media para Endpoints Rápidos
2. Latencia Media Endpoint IA
3. Requests por Segundo
4. Percentil 99 de latencia
5. Total de Peticiones

#### 3. Verificar dashboards

1. Navegar al dashboard
2. Observar que las gráficas muestran datos en tiempo real

### Sistema de alertas

#### Configuración de email (opcional)

Para recibir alertas por email, configurar en `.env`:

```env
GRAFANA_SMTP_ENABLED=true
GRAFANA_SMTP_USER=tu-email@gmail.com
GRAFANA_SMTP_PASSWORD=tu-app-password
GRAFANA_SMTP_FROM_ADDRESS=tu-email@gmail.com
```

**Nota:** Usar App Password de Gmail, no la contraseña real.

#### Probar alerta de latencia IA

La alerta se dispara cuando la latencia del endpoint de IA supera 20 segundos durante 5 minutos consecutivos.

**Pasos para probar:**

1. Generar múltiples peticiones lentas al endpoint de IA.
2. Acceder a Grafana → Alerting → Alert rules
3. Verificar el estado de "Latencia de IA excesiva"
4. Si la latencia supera el umbral durante 5 minutos, cambiará a estado "Firing"
5. Si el email está configurado, se recibirá notificación

#### Verificar contact points

**Ubicación:** Alerting → Contact points → email-notifications

**Contenido:**
- **Type:** Email
- **Addresses:** Email configurado

#### Verificar políticas de notificación

**Ubicación:** Alerting → Notification policies

**Configuración:**
- **Group by:** `alertname`, `grafana_folder`
- **Group wait:** 30s 
- **Group interval:** 5m 
- **Repeat interval:** 4h 

Si todo funciona, el provisioning está correcto y cualquier persona puede replicar el entorno.
