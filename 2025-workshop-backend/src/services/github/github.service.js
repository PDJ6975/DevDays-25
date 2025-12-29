import axios from 'axios';
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('github-service-meter');
let lastGithubApiCallTimestamp = null;

/**
 * Definición de meter de histograma para calcular el tiempo entre páginas consecutivas de una llamada a github
 */
const interPageLatencyHistogram = meter.createHistogram('github.api.inter_page_latency', {
	description: 'Time elapsed between consecutive GitHub API requests',
	unit: 'ms',
});

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

/**
 * Función genérica recursiva para obtener datos paginados de cualquier endpoint de la API de GitHub
 *
 * @param {string} url - URL completa del endpoint de GitHub (ej: '/repos/owner/repo/pulls')
 * @param {object} params - Parámetros adicionales de la query (state, labels, etc.)
 * @param {number} page - Página actual (uso interno para recursión)
 * @param {Array} accumulatedData - Datos acumulados de páginas anteriores (uso interno)
 * @returns {Promise<Array>} Array con todos los datos paginados
 */
export const fetchGithubPaginatedData = async (
	url,
	params = {},
	page = 1,
	accumulatedData = []
) => {
	const fullUrl = buildFullUrl(url);

	recordInterPageLatency(url, page);

	const response = await axios.get(fullUrl, {
		params: {
			...params,
			per_page: 100,
			page,
		},
		headers: buildGithubHeaders(),
	});

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
};

export default {
	fetchGithubPaginatedData,
};
