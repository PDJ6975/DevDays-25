import AuditRepository from '../repositories/audit.repository.js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';

// Extender dayjs con plugins
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

/**
 * Genera clave única para una semana (formato: año-semana ISO)
 * @param {string|Date} date - Fecha
 * @returns {string} Clave única (ej: "2024-W48")
 */
const getWeekKey = date => {
	const d = dayjs(date);
	const weekNumber = d.isoWeek(); // Número de la semana ISO (1-53)
	const year = d.isoWeekYear(); // Año de la semana ISO

	return `${year}-W${String(weekNumber).padStart(2, '0')}`; // pad convierte semanas de un número con 0 delante -> ej 5 -> 05
};

/**
 * Agrupa datos meteorológicos diarios por semanas ISO (lunes-domingo)
 * @param {Array<Object>} weatherData - Datos diarios de temperatura
 * @returns {Array<Object>} Datos agrupados por semana
 */
const groupWeatherByWeeks = weatherData => {
	// 1. Agrupar por semana con un mapa
	const weekMap = new Map();

	// Iteramos por día (ya ordenado de antiguo a reciente)
	weatherData.forEach(day => {
		// Obtenemos la clave de la semana
		const weekKey = getWeekKey(day.date);
		// Si no se encuentra la semana en el mapa la metemos
		if (!weekMap.has(weekKey)) {
			weekMap.set(weekKey, {
				temperatures: [],
				dates: [],
			});
		}

		// Metemos la información del día en la semana
		const weekData = weekMap.get(weekKey);
		weekData.temperatures.push(day.temperatureMean);
		weekData.dates.push(day.date);
	});

	// 2. Calcular promedios de cada semana y formatear
	const weeks = [];
	let weekNumber = 1;

	// Iteramos sobre clave, valor y creamos la evidencia inicial por semana (mapa ya debería venir ordenado por semana)
	for (const [weekKey, weekData] of weekMap) {
		// Calculamos temperatura media de la semana
		const sumTemperatures = weekData.temperatures.reduce((sum, temp) => sum + temp, 0); // 0 el número con que empieza memoria sum del reduce
		const avgTemp = sumTemperatures / weekData.temperatures.length;

		// Obtenemos día de inicio y fin de semana
		const firstDate = dayjs(weekData.dates[0]);
		const weekStart = firstDate.startOf('isoWeek'); // Lunes de la semana
		const weekEnd = firstDate.endOf('isoWeek'); // Domingo de la semana

		weeks.push({
			weekNumber: weekNumber++,
			weekStart: new Date(weekStart.format('YYYY-MM-DD')), // Convertir sin timezone offset para evitar problemas de conversión de dayjs
			weekEnd: new Date(weekEnd.format('YYYY-MM-DD')),
			avgTemp: Math.round(avgTemp * 100) / 100, // 2 decimales -> 22.5678 -> 2256.78 -> round hace 2257 -> 22.57
			daysInWeek: weekData.temperatures.length,
		});
	}

	return weeks;
};

/**
 * Evalúa cumplimiento de cada semana contra el umbral
 * @param {number} thresholdTemp - Temperatura umbral
 * @param {Array<Object>} groupedData - Datos agrupados por semana
 * @returns {Array<Object>} Datos con campo compliant añadido
 */
const calculateCompliance = (thresholdTemp, groupedData) => {
	return groupedData.map(week => ({
		weekNumber: week.weekNumber,
		weekStart: week.weekStart,
		weekEnd: week.weekEnd,
		avgTemp: week.avgTemp,
		daysInWeek: week.daysInWeek,
		compliant: week.avgTemp >= thresholdTemp,
	}));
};

/**
 * Construye objeto de auditoría y lo guarda en BD
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país
 * @param {string|Date} dateFrom - Fecha inicio del periodo
 * @param {string|Date} dateTo - Fecha fin del periodo
 * @param {number} thresholdTemp - Umbral de temperatura
 * @param {Array<Object>} processedData - Evidencias procesadas
 * @returns {Promise<Object>} Auditoría guardada
 */
const saveAudit = async (city, countryCode, dateFrom, dateTo, thresholdTemp, processedData) => {
	// Calcular metadata
	const totalWeeks = processedData.length;
	const weeksCompliant = processedData.filter(week => week.compliant).length;
	const weeksNonCompliant = totalWeeks - weeksCompliant;
	const complianceRate = totalWeeks > 0 ? Math.round((weeksCompliant / totalWeeks) * 100) : 0;

	// Calcular cumplimiento global (todas las semanas deben cumplir)
	const compliant = processedData.every(week => week.compliant);

	// Generar regla
	const rule = `Average weekly temperature >= ${thresholdTemp}°C`;

	// Construir objeto de auditoría
	const auditData = {
		city,
		countryCode,
		dateFrom: new Date(dayjs(dateFrom).format('YYYY-MM-DD')),
		dateTo: new Date(dayjs(dateTo).format('YYYY-MM-DD')),
		thresholdTemp,
		compliant,
		metadata: {
			totalWeeks,
			weeksCompliant,
			weeksNonCompliant,
			complianceRate,
			rule,
		},
		evidences: processedData,
	};

	return await AuditRepository.create(auditData);
};

/**
 * Procesa los datos meteorológicos y los procesa para que queden listos para el almacenamiento
 *
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código ISO del país
 * @param {string} dateFrom - Fecha inicio (YYYY-MM-DD)
 * @param {string} dateTo - Fecha fin (YYYY-MM-DD)
 * @param {number} thresholdTemp - Umbral de temperatura
 * @returns {Promise<Object>} Auditoría creada
 * @throws {Error} Si no hay datos suficientes
 */
export const auditWeatherData = async (
	city,
	countryCode,
	dateFrom,
	dateTo,
	thresholdTemp,
	weatherData
) => {
	// 1. Validar que existan datos

	// Calcular weeksBack para ayudar al usuario si hay error: semanas desde hoy hasta dateFrom (redondeado hacia arriba)
	const today = dayjs();
	const weeksFromToday = Math.ceil(today.diff(dayjs(dateFrom, 'YYYY-MM-DD'), 'week', true));

	if (!weatherData || weatherData.length === 0) {
		const error = Error(
			`No weather data found for ${city}, ${countryCode} between ${dateFrom} and ${dateTo}. ` +
				`Please fetch data using: POST /api/v1/weather/fetch with appropriate date range.`
		);
		error.details = {
			fetchRequest: {
				method: 'POST',
				endpoint: '/api/v1/weather/fetch',
				body: {
					city,
					countryCode,
					weeksBack: weeksFromToday,
				},
			},
		};

		throw error;
	}

	// 2. Calcular completitud del rango solicitado (+1 para que incluya todos los días) -> 15/12 - 13/12 = 2 -> +1 = 3 días (13,14,15)
	const expectedDays = dayjs(dateTo).diff(dayjs(dateFrom), 'day') + 1;

	// 3. Si falta cualquier día, error para que el usuario haga fetch de nuevo
	if (weatherData.length < expectedDays) {
		const missingDays = expectedDays - weatherData.length;

		const error = new Error(
			`Incomplete weather data: found ${weatherData.length}/${expectedDays} days (missing ${missingDays}). ` +
				`Fetch complete data first: POST /api/v1/weather/fetch`
		);
		error.details = {
			found: weatherData.length,
			expected: expectedDays,
			missing: missingDays,
			fetchRequest: {
				method: 'POST',
				endpoint: '/api/v1/weather/fetch',
				body: {
					city,
					countryCode,
					weeksBack: weeksFromToday,
				},
			},
		};
		throw error;
	}

	// 4. Agrupar datos diarios por semana
	const groupedData = groupWeatherByWeeks(weatherData);

	// 5. Calcular cumplimiento
	const processedData = calculateCompliance(thresholdTemp, groupedData);

	return processedData;
};

/**
 * Busca auditoría por auditId
 */
export const findByAuditId = async auditId => {
	return await AuditRepository.findByAuditId(auditId);
};

/**
 * Lista todas las auditorías
 */
export const findAll = async options => {
	return await AuditRepository.findAll(options);
};

/**
 * Busca auditorías por ciudad
 */
export const findByCityAndCountry = async (city, countryCode, options) => {
	return await AuditRepository.findByCityAndCountry(city, countryCode, options);
};

export default {
	auditWeatherData,
	findByAuditId,
	findAll,
	findByCityAndCountry,
	saveAudit,
};
