import OpenMeteoService from '../services/openmeteo.service.js';
import GeoCodingService from '../services/geocoding.service.js';
import WeatherService from '../services/weather.service.js';

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
};
