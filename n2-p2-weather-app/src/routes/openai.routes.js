import { Router } from 'express';
import openaiController from '../controllers/openai.controller.js';
import { validateAudioSummary } from '../middlewares/openai.middleware.js';

const router = Router();

router.post('/audio-summary', validateAudioSummary, openaiController.fetchWeatherSummaryGPT);

export default router;
