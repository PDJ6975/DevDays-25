import OpenAI from 'openai';

const openai = new OpenAI({
	baseURL: 'http://localhost:11434/v1',
	apiKey: 'ollama',
});

// Leer el modelo de Ollama desde variables de entorno
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

export const generateText = async prompt => {
	try {
		const response = await openai.responses.create({
			model: OLLAMA_MODEL,
			input: prompt,
		});
		return response.output_text;
	} catch (error) {
		throw error;
	}
};
