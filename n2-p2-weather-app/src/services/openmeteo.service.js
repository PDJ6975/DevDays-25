import axios from 'axios';
import GeoCodingService from './geocoding.service.js';
import WeatherService from './weather.service.js';

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
 * Llama a OpenMeteo Archive API y devuelve datos históricos
 * @param {number} latitude - Latitud de la ubicación
 * @param {number} longitude - Longitud de la ubicación
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Respuesta de OpenMeteo
 * @throws {Error} Si la API falla o devuelve error
 * @private
 */
const callOpenMeteoAPI = async (latitude, longitude, startDate, endDate) => {
	const url = buildOpenMeteoURL(latitude, longitude, startDate, endDate);
	const response = await axios.get(url);
	return response.data;
};

/**
 * Obtiene datos meteorológicos históricos de OpenMeteo y los guarda en BD
 *
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país
 * @param {string} startDate - Fecha inicio en formato YYYY-MM-DD
 * @param {string} endDate - Fecha fin en formato YYYY-MM-DD
 * @returns {Promise<Array<Object>>} Array de lecturas meteorológicas guardadas
 * @throws {Error} Si geocoding falla, OpenMeteo API falla, fechas inválidas, o error de BD
 */
export const fetchHistoricalWeather = async (city, countryCode, startDate, endDate) => {
	// Validar fechas
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		throw new Error('Invalid date format. Expected YYYY-MM-DD');
	}

	if (start > end) {
		throw new Error('start_date must be before or equal to end_date');
	}

	try {
		// 1. Obtener coordenadas de la ciudad
		const { latitude, longitude } = await GeoCodingService.fetchCoordinatesOfCity(
			city,
			countryCode
		);

		// 2. Llamar a OpenMeteo API
		const openMeteoData = await callOpenMeteoAPI(latitude, longitude, startDate, endDate);

		// 3. Guardar en BD y devolver
		return await WeatherService.saveWeathers(city, countryCode, openMeteoData);
	} catch (error) {
		throw new Error(
			`Failed to fetch weather data for ${city}, ${countryCode}: ${error.message}`
		);
	}
};

export default {
	fetchHistoricalWeather,
};
