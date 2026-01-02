import { body, param, query, validationResult } from 'express-validator';

export const validateCreateAudit = [
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

	body('dateFrom')
		.notEmpty()
		.withMessage('dateFrom is required')
		.isISO8601()
		.withMessage('dateFrom must be a valid ISO 8601 date (e.g., 2024-12-01)'),

	body('dateTo')
		.notEmpty()
		.withMessage('dateTo is required')
		.isISO8601()
		.withMessage('dateTo must be a valid ISO 8601 date (e.g., 2024-12-31)')
		.custom(dateTo => {
			const today = new Date();
			today.setHours(0, 0, 0, 0); // normalizamos
			const dateToObj = new Date(dateTo);
			dateToObj.setHours(0, 0, 0, 0); // normalizamos

			if (dateToObj >= today) {
				throw new Error('dateTo must be before today (only complete days allowed)');
			}
			return true;
		})
		.custom((dateTo, { req }) => {
			// Validar que dateTo >= dateFrom
			if (new Date(dateTo) < new Date(req.body.dateFrom)) {
				throw new Error('dateTo must be greater than or equal to dateFrom');
			}
			return true;
		}),

	body('thresholdTemp')
		.isNumeric()
		.withMessage('thresholdTemp must be a number')
		.notEmpty()
		.withMessage('thresholdTemp is required')
		.isFloat({ min: -50, max: 60 })
		.withMessage('thresholdTemp must be between -50 and 60 (°C)'),

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

export const validateGetAuditById = [
	param('auditId')
		.isString()
		.withMessage('auditId must be a string')
		.notEmpty()
		.withMessage('auditId is required')
		.isUUID()
		.withMessage('auditId must be a valid UUID'),

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

export const validateGetAllAudits = [
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('limit must be an integer between 1 and 100')
		.toInt(),

	query('skip')
		.optional()
		.isInt({ min: 0 })
		.withMessage('skip must be a non-negative integer')
		.toInt(),

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

export const validateGetAuditsByCity = [
	param('city')
		.isString()
		.withMessage('city must be a string')
		.notEmpty()
		.withMessage('city is required')
		.trim()
		.isLength({ min: 2, max: 70 })
		.withMessage('city must be between 2 and 70 characters'),

	param('countryCode')
		.isString()
		.withMessage('countryCode must be a string')
		.notEmpty()
		.withMessage('countryCode is required')
		.trim()
		.isLength({ min: 2, max: 2 })
		.withMessage('countryCode must be exactly 2 characters')
		.isAlpha()
		.withMessage('countryCode must contain only letters')
		.toUpperCase(),

	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('limit must be an integer between 1 and 100')
		.toInt(),

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
