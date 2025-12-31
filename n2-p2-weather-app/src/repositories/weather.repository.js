import Weather from '../models/weather.model.js';

/**
 * Obtiene lista de combinaciones únicas de ciudad + código de país
 * @returns {Promise<Array<{city: string, countryCode: string}>>} Array de objetos {city, countryCode}
 */
const getUniqueCities = async () => {
	return await Weather.aggregate([
		{
			$group: {
				_id: { city: '$city', countryCode: '$countryCode' },
			},
		},
		{
			$project: {
				_id: 0,
				city: '$_id.city',
				countryCode: '$_id.countryCode',
			},
		},
		{ $sort: { city: 1, countryCode: 1 } },
	]);
};

/**
 * Obtiene tiempo de una ciudad en una fecha específica
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país (ej: "ES", "AR")
 * @param {string|Date} date - Fecha de la lectura
 * @returns {Promise<Object|null>} Tiempo o null si no existe
 */
const getWeatherByCityAndDate = async (city, countryCode, date) => {
	return await Weather.findOne({
		city: city,
		countryCode: countryCode,
		date: new Date(date),
	});
};

/**
 * Obtiene tiempo de una ciudad en rango de fechas
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país (ej: "ES", "AR")
 * @param {string|Date} startDate - Fecha inicio del rango
 * @param {string|Date} endDate - Fecha fin del rango
 * @returns {Promise<Object[]>} Array de lecturas ordenadas por fecha ascendente
 */
const getWeatherByCityAndDates = async (city, countryCode, startDate, endDate) => {
	return await Weather.find({
		city: city,
		countryCode: countryCode,
		date: {
			$gte: new Date(startDate),
			$lte: new Date(endDate),
		},
	}).sort({ date: 1 }); // Orden ascendente por fecha
};

/**
 * Crea un registro de tiempo
 * @param {Object} data - Datos de la lectura (city, countryCode, latitude, longitude, date, temperatureMean)
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

/**
 * Obtiene documentos existentes que coincidan con las fechas proporcionadas
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país
 * @param {string[]} datesISO - Array de fechas en formato ISO string
 * @returns {Promise<Array<{date: Date}>>} Array de documentos con solo el campo date
 */
const getExistingDates = async (city, countryCode, datesISO) => {
	return await Weather.find(
		{
			city: city,
			countryCode: countryCode,
			date: { $in: datesISO },
		},
		{ date: 1, _id: 0 } // Solo devolvemos la fecha
	);
};

export default {
	getUniqueCities,
	getWeatherByCityAndDate,
	getWeatherByCityAndDates,
	create,
	createMany,
	getExistingDates,
};
