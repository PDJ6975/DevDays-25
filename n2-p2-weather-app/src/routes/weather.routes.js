import { Router } from 'express';
import weatherController from '../controllers/weather.controller.js';
import {
	validateFetchHistoricalWeather,
	validateGetWeatherByCityAndDate,
	validateGetWeatherByCityAndDateRange,
} from '../middlewares/weather.middleware.js';

const router = Router();

router.post(
	'/fetch',
	validateFetchHistoricalWeather,
	weatherController.fetchAndSaveHistoricalWeather
);

router.get('/cities', weatherController.getUniqueCities);

router.post(
	'/city/date',
	validateGetWeatherByCityAndDate,
	weatherController.getWeatherByCityAndDate
);

router.post(
	'/city/date-range',
	validateGetWeatherByCityAndDateRange,
	weatherController.getWeatherByCityAndDateRange
);

export default router;
