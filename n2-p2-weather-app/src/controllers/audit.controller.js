import AuditService from '../services/audit.service.js';
import WeatherService from '../services/weather.service.js';

export const createAudit = async (req, res) => {
	const { city, countryCode, dateFrom, dateTo, thresholdTemp } = req.body;
	try {
		// 1. Obtener los datos históricos en ese rango para esa ciudad
		const weatherData = await WeatherService.findWeatherByCityAndDates(
			city,
			countryCode,
			dateFrom,
			dateTo
		);

		// 2. Procesar los datos
		const processedData = await AuditService.auditWeatherData(
			city,
			countryCode,
			dateFrom,
			dateTo,
			thresholdTemp,
			weatherData
		);

		// 3. Almacenar la auditoría
		const audit = await AuditService.saveAudit(
			city,
			countryCode,
			dateFrom,
			dateTo,
			thresholdTemp,
			processedData
		);

		return res.status(201).json(audit);
	} catch (error) {
		console.error('Error in createAudit:', error);

		// Error para datos incompletos (viene del servicio)
		if (error.message.includes('weather data')) {
			const response = { message: error.message };
			if (error.details) response.details = error.details;
			return res.status(400).json(response);
		}

		return res.status(500).json({ message: 'Failed to create audit' });
	}
};

/**
 * Obtiene una auditoría por su auditId
 */
export const getAuditById = async (req, res) => {
	const { auditId } = req.params;

	try {
		const audit = await AuditService.findByAuditId(auditId);

		if (!audit) {
			return res.status(404).json({
				message: `Audit with ID ${auditId} not found`,
			});
		}

		return res.status(200).json(audit);
	} catch (error) {
		console.error('Error in getAuditById:', error);
		return res.status(500).json({
			message: 'Failed to fetch audit',
		});
	}
};

/**
 * Obtiene todas las auditorías
 */
export const getAllAudits = async (req, res) => {
	try {
		const { limit, skip, sort } = req.query;

		const options = {
			limit: limit ? parseInt(limit) : 50,
			skip: skip ? parseInt(skip) : 0,
			sort: sort ? JSON.parse(sort) : { createdAt: -1 },
		};

		const audits = await AuditService.findAll(options);

		return res.status(200).json(audits);
	} catch (error) {
		console.error('Error in getAllAudits:', error);
		return res.status(500).json({
			message: 'Failed to fetch audits',
		});
	}
};

/**
 * Obtiene auditorías de una ciudad específica
 */
export const getAuditsByCity = async (req, res) => {
	const { city, countryCode } = req.params;

	try {
		const { limit, dateFrom, dateTo } = req.query;

		const options = {
			limit: limit ? parseInt(limit) : 50,
			sort: { createdAt: -1 },
		};

		// Añadir filtro de fechas si se proporciona
		if (dateFrom || dateTo) {
			options.dateFrom = dateFrom;
			options.dateTo = dateTo;
		}

		const audits = await AuditService.findByCityAndCountry(city, countryCode, options);

		return res.status(200).json(audits);
	} catch (error) {
		console.error('Error in getAuditsByCity:', error);
		return res.status(500).json({
			message: 'Failed to fetch audits for city',
		});
	}
};

/**
 * Exportar todos los métodos
 */
export default {
	createAudit,
	getAuditById,
	getAllAudits,
	getAuditsByCity,
};
