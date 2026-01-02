/**
 * Convierte código WMO a descripción
 * @param {number} code - Código WMO (0-99)
 * @returns {string} Descripción del clima
 */
export const weatherCodeToDescription = code => {
	const descriptions = {
		0: 'cielo despejado',
		1: 'mayormente despejado',
		2: 'parcialmente nublado',
		3: 'nublado',
		45: 'niebla',
		48: 'niebla con escarcha',
		51: 'llovizna ligera',
		53: 'llovizna moderada',
		55: 'llovizna intensa',
		56: 'llovizna helada ligera',
		57: 'llovizna helada intensa',
		61: 'lluvia ligera',
		63: 'lluvia moderada',
		65: 'lluvia intensa',
		66: 'lluvia helada ligera',
		67: 'lluvia helada intensa',
		71: 'nevada ligera',
		73: 'nevada moderada',
		75: 'nevada intensa',
		77: 'granizo de nieve',
		80: 'chubascos ligeros',
		81: 'chubascos moderados',
		82: 'chubascos intensos',
		85: 'nevadas ligeras',
		86: 'nevadas intensas',
		95: 'tormenta',
		96: 'tormenta con granizo ligero',
		99: 'tormenta con granizo intenso',
	};

	return descriptions[code] || 'condiciones desconocidas';
};

export default {
	weatherCodeToDescription,
};
