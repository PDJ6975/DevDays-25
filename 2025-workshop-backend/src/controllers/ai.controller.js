import { generateText } from '../services/ollama.service.js'; // or '../services/openai.service.js' if we want to try OpenAi

export const generateAIResponse = async (req, res) => {
	try {
		const { prompt } = req.body;

		const aiResponse = await generateText(prompt);
		res.status(200).json({ response: aiResponse });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
