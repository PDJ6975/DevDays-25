import { Router } from 'express';
import weatherController from '../controllers/weather.controller.js';
import { validateFetchHistoricalWeather } from '../middlewares/weather.middleware.js';

const router = Router();

router.post(
	'/fetch',
	validateFetchHistoricalWeather,
	weatherController.fetchAndSaveHistoricalWeather
);

export default router;
