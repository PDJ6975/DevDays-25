import OpenMeteoService from '../services/openmeteo.service.js';
import GeoCodingService from '../services/geocoding.service.js';
import WeatherService from '../services/weather.service.js';

export const getUniqueCities = async (req, res) => {
	try {
		const cities = await WeatherService.findUniqueCities();

		// Si no hay datos, devolver array vacío
		return res.status(200).json(cities);
	} catch (error) {
		console.error('Error in getUniqueCities:', error);
		return res.status(500).json({
			message: 'Failed to fetch cities',
		});
	}
};

export const getWeatherByCityAndDate = async (req, res) => {
	const { city, countryCode, date } = req.body;

	try {
		const weatherInfo = await WeatherService.findWeatherByCityAndDate(city, countryCode, date);

		if (!weatherInfo) {
			return res.status(404).json({
				message: `No weather data found for ${city} on ${date}`,
			});
		}

		return res.status(200).json(weatherInfo);
	} catch (error) {
		console.error('Error in getWeatherByCityAndDate:', error);
		return res.status(500).json({
			message: 'Failed to fetch weather data',
		});
	}
};

export const getWeatherByCityAndDateRange = async (req, res) => {
	const { city, countryCode, startDate, endDate } = req.body;

	try {
		const weatherData = await WeatherService.findWeatherByCityAndDates(
			city,
			countryCode,
			startDate,
			endDate
		);

		// Si no hay datos, devolver array vacío
		return res.status(200).json(weatherData);
	} catch (error) {
		console.error('Error in getWeatherByCityAndDateRange:', error);
		return res.status(500).json({
			message: 'Failed to fetch weather data',
		});
	}
};

export const fetchAndSaveHistoricalWeather = async (req, res) => {
	// Se pasa ciudad, countryCode opcional, y rango de fechas
	const { city, countryCode, weeksBack } = req.body;

	try {
		// 1. Obtener coordenadas de la ciudad
		const geocodingResult = await GeoCodingService.fetchCoordinatesOfCity(city, countryCode);

		// 2. Obtenemos los registros de OpenMeteo
		const openMeteoData = await OpenMeteoService.callOpenMeteoAPI(
			geocodingResult.latitude,
			geocodingResult.longitude,
			weeksBack
		);

		// 3. Guardar en BD y devolver
		const savedWeatherInfo = await WeatherService.saveWeathers(
			city,
			geocodingResult.countryCode,
			openMeteoData
		);

		return res.status(200).json(savedWeatherInfo);
	} catch (error) {
		console.error(`Error in getWeatherCityDates: ${error.message}`, error);
		return res.status(500).json({
			message: 'Failed to fetch weather data',
		});
	}
};

export default {
	fetchAndSaveHistoricalWeather,
	getUniqueCities,
	getWeatherByCityAndDate,
	getWeatherByCityAndDateRange,
};
