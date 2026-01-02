import WeatherRepository from '../repositories/weather.repository.js';
import WeatherCodeMapper, { weatherCodeToDescription } from '../utils/weatherCodeMapper.js';

export const findUniqueCities = async () => {
	return await WeatherRepository.getUniqueCities();
};

export const findWeatherByCityAndDate = async (city, countryCode, date) => {
	const result = await WeatherRepository.getWeatherByCityAndDate(city, countryCode, date);

	if (!result) return null;

	// Formatear fecha para respuesta
	return {
		...result.toObject(), // Convertir documento Mongoose a objeto plano
		date: formatDateToString(result.date),
	};
};

export const findWeatherByCityAndDates = async (city, countryCode, startDate, endDate) => {
	const results = await WeatherRepository.getWeatherByCityAndDates(
		city,
		countryCode,
		startDate,
		endDate
	);

	return formatWeathersForResponse(results.map(doc => doc.toObject()));
};

/**
 * Transforma la respuesta de OpenMeteo Archive API al formato del modelo
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país (ej: "ES", "AR")
 * @param {Object} openMeteoResponse - Respuesta de OpenMeteo
 * @returns {Array<Object>} Array de documentos Weather listos para insertar
 * @private
 */
const mapOpenMeteoToWeatherDocs = (city, countryCode, openMeteoResponse) => {
	return openMeteoResponse.daily.time
		.map((dateString, index) => {
			const temperature = openMeteoResponse.daily.temperature_2m_mean[index];
			const weatherCode = openMeteoResponse.daily.weather_code[index];

			// Retornar null para días sin datos
			if (
				temperature === null ||
				temperature === undefined ||
				weatherCode === null ||
				weatherCode === undefined
			) {
				return null;
			}

			return {
				city,
				countryCode,
				latitude: openMeteoResponse.latitude,
				longitude: openMeteoResponse.longitude,
				date: new Date(dateString),
				temperatureMean: temperature,
				weatherDescription: weatherCodeToDescription(weatherCode),
			};
		})
		.filter(Boolean); // Saltar días sin datos disponibles (eliminando los null);
};

/**
 * Filtra documentos para obtener solo los que no existen en BD
 * @param {Array<Object>} weatherDocs - Documentos Weather a verificar
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país
 * @returns {Promise<Array<Object>>} Solo documentos que no existen en BD
 * @private
 */
const filterNewDocuments = async (weatherDocs, city, countryCode) => {
	// Extraer fechas en formato ISO para la query
	const datesISO = weatherDocs.map(doc => doc.date.toISOString());

	// Obtener documentos existentes de BD de la ciudad con esas fechas
	const existingDocs = await WeatherRepository.getExistingDates(city, countryCode, datesISO);

	// Crear Set de fechas existentes para maximizar eficiencia
	const existingDatesSet = new Set(existingDocs.map(doc => doc.date.toISOString()));

	// Filtrar solo documentos nuevos
	return weatherDocs.filter(doc => !existingDatesSet.has(doc.date.toISOString()));
};

/**
 * Formatea un objeto Date a string YYYY-MM-DD
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 * @private
 */
const formatDateToString = date => {
	return date.toISOString().split('T')[0];
};

/**
 * Transforma los documentos internos a formato de respuesta
 * @param {Array<Object>} weatherDocs - Documentos con date como Date object
 * @returns {Array<Object>} Documentos con date como string YYYY-MM-DD
 * @private
 */
const formatWeathersForResponse = weatherDocs => {
	return weatherDocs.map(doc => ({
		...doc,
		date: formatDateToString(doc.date),
	}));
};

/**
 * Guarda lecturas meteorológicas en la base de datos
 *
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país (ej: "ES", "AR")
 * @param {Object} openMeteoResponse - Respuesta completa de OpenMeteo Archive API
 * @returns {Promise<Array<Object>>} Array de documentos con fechas formateadas como string
 */
export const saveWeathers = async (city, countryCode, openMeteoResponse) => {
	// 1. Transformar respuesta de OpenMeteo a nuestro modelo
	const mappedWeathers = mapOpenMeteoToWeatherDocs(city, countryCode, openMeteoResponse);

	// 2. Filtrar solo documentos que no existen en BD
	const newDocuments = await filterNewDocuments(mappedWeathers, city, countryCode);

	// 3. Insertar solo documentos nuevos (si hay)
	if (newDocuments.length > 0) {
		await WeatherRepository.createMany(newDocuments);
	}

	// 4. Formatear fechas para respuesta (Date → string YYYY-MM-DD)
	return formatWeathersForResponse(mappedWeathers);
};

export default {
	findUniqueCities,
	findWeatherByCityAndDate,
	findWeatherByCityAndDates,
	saveWeathers,
};
