import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export const compactWeatherInfo = (weatherData, city, countryCode) => {
	console.log(weatherData);
	console.log(weatherData.length);
	// 1. Validamos que haya un registro de 7 datos (7 días)
	if (!weatherData || weatherData.length !== 7) {
		const error = Error(
			`No complete data was found for the last 7 days for ${city}, ${countryCode}.` +
				`Please fetch data using: POST /api/v1/weather/fetch with appropriate date range.`
		);
		error.details = {
			fetchRequest: {
				method: 'POST',
				endpoint: '/api/v1/weather/fetch',
				body: {
					city,
					countryCode,
					weeksBack: 1,
				},
			},
		};

		throw error;
	}

	// 2. Transformamos estructura
	const weekData = {
		dates: [],
		temperatures: [],
		conditions: [],
	};

	weatherData.forEach(day => {
		weekData.dates.push(day.date);
		weekData.temperatures.push(day.temperatureMean);
		weekData.conditions.push(day.weatherDescription);
	});

	// 3. Creamos una table entedible por el LLM: - 2025-12-30: 18.3ºC, claro
	const dataTable = weekData.dates
		.map((date, i) => `- ${date}: ${weekData.temperatures[i]}°C, ${weekData.conditions[i]}`)
		.join('\n'); // Para salto de linea entre cada fila

	return dataTable;
};

export const generateAudioWeatherSummary = async (dataTable, city, countryCode) => {
	try {
		// Responses API de OpenAI todavía no soporta salida de audio, tenemos que usar Chat Completation
		const response = await openai.chat.completions.create({
			model: 'gpt-audio',
			modalities: ['text', 'audio'],
			audio: {
				voice: 'alloy',
				format: 'mp3',
			},
			messages: [
				{
					// Rol del LLM
					role: 'system',
					content: `Eres un meteorólogo profesional. 
  Tu objetivo es crear un resumen natural y conversacional para audio.
  Máximo 150 palabras. Tono amigable y profesional en español.`,
				},
				{
					// Tarea específica
					role: 'user',
					content: `Genera un resumen del tiempo de los últimos 7 días en ${city}, ${countryCode}.

  Datos meteorológicos de la semana:
  ${dataTable}

  Incluye:
  - Una introducción breve y atractiva
  - Temperatura promedio y rango (menciona la máxima y mínima de la semana)
  - Condiciones climáticas predominantes
  - 1-2 detalles interesantes, si existen
  - Un cierre natural

  Importante: Genera UN SOLO PÁRRAFO fluido y conversacional, listo para ser leído en voz alta.`,
				},
			],
			store: true, // Para ver logs desde dashboard de openAI
		});

		const message = response.choices[0].message;

		// Validar que se ha devuelto audio
		if (!message.audio || !message.audio.data) {
			throw new Error('OpenAI did not return audio data');
		}

		return {
			transcript: message.audio.transcript || message.content,
			audioBuffer: Buffer.from(message.audio.data, 'base64'), // archivo mp3 en bytes binarios
		};
	} catch (error) {
		console.error('Error generating summary at generateAudioWeatherSummary:', error);
		throw new Error('The summary could not be generated with AI.');
	}
};

export default {
	compactWeatherInfo,
	generateAudioWeatherSummary,
};
