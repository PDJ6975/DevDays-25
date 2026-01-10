import axios from 'axios';
import { metrics } from '@opentelemetry/api';

// ============================================================================
// Configuración de OpenTelemetry
// ============================================================================

const meter = metrics.getMeter('github-service-meter');

/**
 * Timestamp de la última llamada a GitHub API (usado para calcular inter-page latency)
 * @type {number|null}
 */
let lastGithubApiCallTimestamp = null;

/**
 * Ventana deslizante que almacena los resultados de las últimas peticiones
 * @type {Array<'success'|'error'>}
 */
const recentGithubRequests = [];

/**
 * Tamaño máximo de la ventana deslizante para el cálculo de error rate
 * @type {number}
 */
const MAX_WINDOWS_SIZE = 100;

// ============================================================================
// Métricas de OpenTelemetry
// ============================================================================

/**
 * Histogram que mide la latencia entre peticiones consecutivas a GitHub API
 * @type {Histogram}
 */
const interPageLatencyHistogram = meter.createHistogram('github.api.inter_page_latency', {
	description: 'Time elapsed between consecutive GitHub API requests',
	unit: 'ms',
});

/**
 * Gauge observable que calcula la tasa de error de las últimas 100 peticiones
 * @type {ObservableGauge}
 */
const errorRateGauge = meter.createObservableGauge('github.api.error_rate', {
	description: 'Error rate of last 100 GitHub API requests',
	unit: '%',
});

/**
 * Callback del ObservableGauge que calcula y reporta el error rate actual.
 * Se ejecuta automáticamente cada intervalo de exportación configurado en otel.js
 */
errorRateGauge.addCallback(observableResult => {
	const errors = recentGithubRequests.filter(r => r === 'error').length;
	const errorRate =
		recentGithubRequests.length > 0 ? (errors / recentGithubRequests.length) * 100 : 0;

	observableResult.observe(errorRate, {
		window_size: recentGithubRequests.length,
	});
});

// ============================================================================
// Funciones auxiliares
// ============================================================================

/**
 * Registra el resultado de una petición en la ventana deslizante
 * @param {'success'|'error'} result - Resultado de la petición
 */
const recordRequestResult = result => {
	recentGithubRequests.push(result);
	if (recentGithubRequests.length > MAX_WINDOWS_SIZE) {
		recentGithubRequests.shift();
	}
};

/**
 * Construye la URL completa de GitHub API
 * @param {string} url - URL relativa o absoluta
 * @returns {string} URL completa
 */
const buildFullUrl = url => {
	return url.startsWith('http') ? url : `https://api.github.com${url}`;
};

/**
 * Construye los headers necesarios para las llamadas a la API
 * @returns {object} Headers de configuración
 */
const buildGithubHeaders = () => {
	return {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		...(process.env.GITHUB_TOKEN && {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		}),
	};
};

/**
 * Registra la métrica de latencia entre páginas consecutivas, almacenadno url y page para filtrado
 * @param {string} url - Endpoint de GitHub
 * @param {number} page - Número de página
 */
const recordInterPageLatency = (url, page) => {
	const now = Date.now();

	if (lastGithubApiCallTimestamp !== null) {
		const interPageLatency = now - lastGithubApiCallTimestamp;
		interPageLatencyHistogram.record(interPageLatency, {
			endpoint: url,
			page: page,
		});
	}

	lastGithubApiCallTimestamp = now;
};

/**
 * Resetea el contexto de medición de métricas
 * Se usa al finalizar una operación de paginación completa
 */
const resetMetricContext = () => {
	lastGithubApiCallTimestamp = null;
};

/**
 * Verifica si hay más páginas disponibles en la paginación
 * @param {string} linkHeader - Header 'Link' de la respuesta de GitHub
 * @returns {boolean} true si hay siguiente página
 */
const hasNextPage = linkHeader => {
	return linkHeader && linkHeader.includes('rel="next"');
};

// ============================================================================
// MÉTODO DE LLAMADA A LA API
// ============================================================================

/**
 * Obtiene todos los datos paginados de un endpoint de GitHub API mediante recursión.
 * Registra automáticamente las métricas de inter-page latency y error rate.
 *
 * @param {string} url - URL del endpoint (ej: '/repos/owner/repo/pulls')
 * @param {object} params - Parámetros de query adicionales (state, labels, etc.)
 * @param {number} [page=1] - Página actual (uso interno para recursión)
 * @param {Array} [accumulatedData=[]] - Datos acumulados (uso interno para recursión)
 * @returns {Promise<Array>} Array con todos los datos paginados
 * @throws {Error} Si la petición a GitHub API falla
 */
export const fetchGithubPaginatedData = async (
	url,
	params = {},
	page = 1,
	accumulatedData = []
) => {
	const fullUrl = buildFullUrl(url);

	recordInterPageLatency(url, page);

	try {
		const response = await axios.get(fullUrl, {
			params: {
				...params,
				per_page: 100,
				page,
			},
			headers: buildGithubHeaders(),
		});

		// Registramos éxito
		recordRequestResult('success');

		const currentPageData = response.data;
		const newAccumulatedData = [...accumulatedData, ...currentPageData];
		const linkHeader = response.headers.link;

		// CASO BASE: No hay más páginas
		if (!hasNextPage(linkHeader)) {
			resetMetricContext();
			return newAccumulatedData;
		}

		// CASO RECURSIVO: Hay siguiente página
		return await fetchGithubPaginatedData(url, params, page + 1, newAccumulatedData);
	} catch (error) {
		// Registramos fallo
		recordRequestResult('error');
		throw error;
	}
};

export default {
	fetchGithubPaginatedData,
};
