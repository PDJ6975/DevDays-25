import axios from 'axios';

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
	// 1. Construir URL completa
	const fullUrl = url.startsWith('http') ? url : `https://api.github.com${url}`;

	// 2. Llamar a la API con paginación
	const response = await axios.get(fullUrl, {
		params: {
			...params, // Parámetros personalizados del usuario
			per_page: 100, // Máximo permitido por GitHub
			page, // Página actual
		},
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			// Añadir token si se encuentra en el .env para aumentar rate limit
			...(process.env.GITHUB_TOKEN && {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			}),
		},
	});

	// 3. Extraer los datos de esta página
	const currentPageData = response.data;

	// 4. Acumular los datos de esta página con los anteriores
	const newAccumulatedData = [...accumulatedData, ...currentPageData];

	// 5. Ver en el encabezado Link si hay referencia a la siguiente página
	const linkHeader = response.headers.link;

	// 6. CASO BASE: Si no hay más páginas, devolver todos los datos acumulados
	if (!linkHeader || !linkHeader.includes('rel="next"')) {
		return newAccumulatedData;
	}

	// 7. CASO RECURSIVO: Si hay siguiente página, llamar de nuevo
	return await fetchGithubPaginatedData(url, params, page + 1, newAccumulatedData);
};

export default {
	fetchGithubPaginatedData,
};
