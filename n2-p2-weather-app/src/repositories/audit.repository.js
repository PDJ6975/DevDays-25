import Audit from '../models/audit.model.js';

/**
 * Busca una auditoría por su auditId
 * @param {string} auditId - UUID de la auditoría
 * @returns {Promise<Object|null>} Auditoría o null
 */
export const findByAuditId = async auditId => {
	return await Audit.findOne({ auditId });
};

/**
 * Obtiene todas las auditorías con opciones
 * @param {Object} options - Opciones de query
 * @returns {Promise<Array>} Array de auditorías
 */
export const findAll = async (options = {}) => {
	const { limit = 50, sort = { createdAt: -1 }, skip = 0 } = options;
	return await Audit.find().sort(sort).limit(limit).skip(skip);
};

/**
 * Busca auditorías de una ciudad específica
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país
 * @param {Object} options - Opciones de query
 * @returns {Promise<Array>} Array de auditorías
 */
export const findByCityAndCountry = async (city, countryCode, options = {}) => {
	const { limit = 50, skip = 0, sort = { createdAt: -1 }, dateFrom, dateTo } = options;

	// Construir filtro base
	const filter = { city, countryCode };

	// Añadir filtro de rango de fechas si se proporciona
	if (dateFrom || dateTo) {
		filter.dateFrom = {};
		if (dateFrom) filter.dateFrom.$gte = new Date(dateFrom);
		if (dateTo) filter.dateFrom.$lte = new Date(dateTo);
	}

	return await Audit.find(filter).sort(sort).skip(skip).limit(limit);
};

/**
 * Crea una nueva auditoría
 * @param {Object} auditData - Datos de la auditoría
 * @returns {Promise<Object>} Auditoría creada
 */
export const create = async auditData => {
	return await Audit.create(auditData);
};

export default {
	create,
	findByAuditId,
	findByCityAndCountry,
	findAll,
};
