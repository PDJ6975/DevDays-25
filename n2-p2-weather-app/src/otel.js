import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { metrics } from '@opentelemetry/api';

// Crear PrometheusExporter (crear servidor HTTP independiente en puerto 9464)
const prometheusExporter = new PrometheusExporter({
	port: 9464,
});

// Creamos el gestor de Meter global, que permite conectar nuestros meter con exportadores
const meterProvider = new MeterProvider({
	readers: [prometheusExporter],
});

// Lo registramos globalmente
metrics.setGlobalMeterProvider(meterProvider);

// Creamos el meter de nuestra app
const meter = metrics.getMeter('weather-api');

// Histograma para medir el tiempo de respuesta de cada endpoint
export const httpRequestDuration = meter.createHistogram('http_request_durations_seconds', {
	description: 'Duration of HTTP requests in seconds',
	unit: 'seconds',
	advice: {
		explicitBucketBoundaries: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10, 20, 30], // ajustamos buckets para rango más apropiado
	},
});
