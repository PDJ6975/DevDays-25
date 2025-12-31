import Weather from '../models/weather.model.js';

/**
 * Obtiene lista de ciudades únicas con registros de tiempo
 * @returns {Promise<string[]>} Array de nombres de ciudades
 */
const getUniqueCities = async () => {
	return await Weather.distinct('city');
};

/**
 * Obtiene tiempo de una ciudad en una fecha específica
 * @param {string} city - Nombre de la ciudad
 * @param {string|Date} date - Fecha de la lectura
 * @returns {Promise<Object|null>} Tiempo o null si no existe
 */
const getWeatherByCityAndDate = async (city, date) => {
	return await Weather.findOne({
		city: city,
		date: new Date(date),
	});
};

/**
 * Obtiene tiempo de una ciudad en rango de fechas
 * @param {string} city - Nombre de la ciudad
 * @param {string|Date} startDate - Fecha inicio del rango
 * @param {string|Date} endDate - Fecha fin del rango
 * @returns {Promise<Object[]>} Array de lecturas ordenadas por fecha ascendente
 */
const getWeatherByCityAndDates = async (city, startDate, endDate) => {
	return await Weather.find({
		city: city,
		date: {
			$gte: new Date(startDate),
			$lte: new Date(endDate),
		},
	}).sort({ date: 1 }); // Orden ascendente por fecha
};

/**
 * Crea un registro de tiempo
 * @param {Object} data - Datos de la lectura (city, latitude, longitude, date, temperatureMean)
 * @returns {Promise<Object>} Lectura creada
 */
const create = async data => {
	return await Weather.create(data);
};

/**
 * Crea múltiples registros de tiempo en lote
 * @param {Object[]} dataArray - Array de lecturas a crear
 * @returns {Promise<Object[]>} Lecturas creadas (continúa aunque algunos fallen por duplicado)
 */
const createMany = async dataArray => {
	return await Weather.insertMany(dataArray, { ordered: false }); // ordered false para que si uno falla por duplicado continúen los demás
};

export default {
	getUniqueCities,
	getWeatherByCityAndDate,
	getWeatherByCityAndDates,
	create,
	createMany,
};
