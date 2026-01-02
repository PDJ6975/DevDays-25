import OpenAIService from '../services/openai.service.js';
import OpenMeteoService from '../services/openmeteo.service.js';
import WeatherService from '../services/weather.service.js';

export const fetchWeatherSummaryGPT = async (req, res) => {
	const { city, countryCode } = req.body;
	try {
		// 1. Obtener fechas de inicio y de fin dado el día actual
		const { startDate, endDate } = OpenMeteoService.calculateDateRange(1);

		// 2. Obtenemos los datos de esa semana para esa ciudad
		const weatherData = await WeatherService.findWeatherByCityAndDates(
			city,
			countryCode,
			startDate,
			endDate
		);

		// 3. Compactamos la información para que sea legible por el LLM
		const compactData = OpenAIService.compactWeatherInfo(weatherData, city, countryCode);

		// 4. Llamamos al LLM para obtener resumen del tiempo en audio
		const { audioBuffer, transcript } = await OpenAIService.generateAudioWeatherSummary(
			compactData,
			city,
			countryCode
		);

		res.set({
			'Content-Type': 'audio/mpeg',
			'Content-Length': audioBuffer.length,
			'Content-Disposition': `attachment; filename="resumen-${city}-${countryCode}.mp3"`,
			'X-Transcript': encodeURIComponent(transcript),
		});

		res.send(audioBuffer);
	} catch (error) {
		console.error('Error in fetchWeatherSummaryGPT:', error);

		if (error.message.includes('No complete data')) {
			const response = { message: error.message };
			if (error.details) response.details = error.details;
			return res.status(400).json(response);
		}
		return res.status(500).json({ message: 'Failed to generate weather summary' });
	}
};

export default {
	fetchWeatherSummaryGPT,
};
