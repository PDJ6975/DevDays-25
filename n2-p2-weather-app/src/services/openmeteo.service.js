import axios from 'axios';

/**
 * Construye la URL para OpenMeteo Archive API
 * @param {number} latitude - Latitud de la ubicación
 * @param {number} longitude - Longitud de la ubicación
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {string} URL completa con parámetros
 * @private
 */
const buildOpenMeteoURL = (latitude, longitude, startDate, endDate) => {
	const baseUrl = 'https://archive-api.open-meteo.com/v1/archive';

	const params = new URLSearchParams({
		latitude,
		longitude,
		start_date: startDate,
		end_date: endDate,
		daily: 'temperature_2m_mean',
		timezone: 'auto',
	});

	return `${baseUrl}?${params.toString()}`;
};

/**
 * Calcula rango de fechas basándose en semanas hacia atrás desde hoy
 * @param {number} weeksBack - Número de semanas hacia atrás
 * @returns {{startDate: string, endDate: string}} Fechas en formato YYYY-MM-DD
 */
const calculateDateRange = weeksBack => {
	const endDate = new Date(); // Hoy
	const startDate = new Date();
	startDate.setDate(endDate.getDate() - weeksBack * 7);

	return {
		startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
		endDate: endDate.toISOString().split('T')[0],
	};
};

/**
 * Llama a OpenMeteo Archive API y devuelve datos históricos
 * @param {number} latitude - Latitud de la ubicación
 * @param {number} longitude - Longitud de la ubicación
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Respuesta de OpenMeteo
 * @throws {Error} Si la API falla o devuelve error
 * @private
 */
const callOpenMeteoAPI = async (latitude, longitude, weeksBack) => {
	// Calcular rango de fechas
	const { startDate, endDate } = calculateDateRange(weeksBack);

	const url = buildOpenMeteoURL(latitude, longitude, startDate, endDate);

	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		throw new Error(`Error when trying to get a response from OpenMeteo API: ${error.message}`);
	}
};

export default {
	callOpenMeteoAPI,
};
