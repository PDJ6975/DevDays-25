import axios from 'axios';

/**
 * Construye la URL para OpenMeteo Geocoding API
 * @param {string} city - Nombre de la ciudad
 * @param {string} [countryCode] - Código ISO del país (opcional)
 * @returns {string} URL completa con parámetros
 * @private
 */
const buildGeocodingURL = (city, countryCode) => {
	const baseUrl = 'https://geocoding-api.open-meteo.com/v1/search';

	const params = new URLSearchParams({
		name: city,
		language: 'es',
		count: 1,
	});

	// Añadir countryCode solo si existe
	if (countryCode) {
		params.append('countryCode', countryCode);
	}

	return `${baseUrl}?${params.toString()}`;
};

/**
 * Obtiene coordenadas geográficas de una ciudad usando OpenMeteo Geocoding API
 *
 * @param {string} city - Nombre de la ciudad a buscar (ej: "Sevilla")
 * @param {string} [countryCode] - Código ISO del país (opcional, ej: "ES", "AR")
 * @returns {Promise<{latitude: number, longitude: number}>} Coordenadas geográficas
 * @throws {Error} Si la ciudad no se encuentra
 */
export const fetchCoordinatesOfCity = async (city, countryCode) => {
	// 1. Construir URL
	const url = buildGeocodingURL(city, countryCode);

	// 2. Llamar API
	const response = await axios.get(url);
	const results = response.data.results;

	// 3. Validar que hay resultados
	if (!results || results.length === 0) {
		const errorMsg = countryCode
			? `City "${city}" not found in country "${countryCode}"`
			: `City "${city}" not found`;
		throw new Error(errorMsg);
	}

	// 4. Tomar siempre el primer resultado por simplicidad
	const match = results[0];

	// 5. Devolver coordenadas
	return {
		latitude: match.latitude,
		longitude: match.longitude,
	};
};

export default {
	fetchCoordinatesOfCity,
};
