import { body, validationResult } from 'express-validator';

export const validateFetchHistoricalWeather = [
	body('city')
		.isString()
		.withMessage('city must be a string')
		.notEmpty()
		.withMessage('city is required')
		.trim()
		.isLength({ min: 2, max: 70 })
		.withMessage('city must be between 2 and 70 characters'),

	body('countryCode')
		.optional()
		.isString()
		.withMessage('countryCode must be a string')
		.trim()
		.isLength({ min: 2, max: 2 })
		.withMessage('countryCode must be exactly 2 characters (e.g., ES, AR)')
		.isAlpha()
		.withMessage('countryCode must contain only letters')
		.isUppercase()
		.withMessage('countryCode must be uppercase (e.g., ES, AR)'),

	body('weeksBack')
		.toInt() // Convierte a número si viene como string
		.isInt({ min: 1 })
		.withMessage('weeksBack must be a positive integer (>= 1)'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: errors.array(),
			});
		}
		next();
	},
];

export const validateGetWeatherByCityAndDate = [
	body('city')
		.isString()
		.withMessage('city must be a string')
		.notEmpty()
		.withMessage('city is required')
		.trim()
		.isLength({ min: 2, max: 70 })
		.withMessage('city must be between 2 and 70 characters'),

	body('countryCode')
		.isString()
		.withMessage('countryCode must be a string')
		.notEmpty()
		.withMessage('countryCode is required')
		.trim()
		.isLength({ min: 2, max: 2 })
		.withMessage('countryCode must be exactly 2 characters (e.g., ES, AR)')
		.isAlpha()
		.withMessage('countryCode must contain only letters')
		.toUpperCase(), // Normalizar a mayúsculas automáticamente

	body('date')
		.isString()
		.withMessage('date must be a string')
		.notEmpty()
		.withMessage('date is required')
		.isISO8601()
		.withMessage('date must be a valid ISO 8601 date (e.g., 2024-12-01)'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: errors.array(),
			});
		}
		next();
	},
];

export const validateGetWeatherByCityAndDateRange = [
	body('city')
		.isString()
		.withMessage('city must be a string')
		.notEmpty()
		.withMessage('city is required')
		.trim()
		.isLength({ min: 2, max: 70 })
		.withMessage('city must be between 2 and 70 characters'),

	body('countryCode')
		.isString()
		.withMessage('countryCode must be a string')
		.notEmpty()
		.withMessage('countryCode is required')
		.trim()
		.isLength({ min: 2, max: 2 })
		.withMessage('countryCode must be exactly 2 characters (e.g., ES, AR)')
		.isAlpha()
		.withMessage('countryCode must contain only letters')
		.toUpperCase(), // Normalizar a mayúsculas automáticamente

	body('startDate')
		.isString()
		.withMessage('startDate must be a string')
		.notEmpty()
		.withMessage('startDate is required')
		.isISO8601()
		.withMessage('startDate must be a valid ISO 8601 date (e.g., 2024-12-01)'),

	body('endDate')
		.isString()
		.withMessage('endDate must be a string')
		.notEmpty()
		.withMessage('endDate is required')
		.isISO8601()
		.withMessage('endDate must be a valid ISO 8601 date (e.g., 2024-12-31)')
		.custom((endDate, { req }) => {
			// Validar que endDate >= startDate
			if (new Date(endDate) < new Date(req.body.startDate)) {
				throw new Error('endDate must be greater than or equal to startDate');
			}
			return true;
		}),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: errors.array(),
			});
		}
		next();
	},
];
