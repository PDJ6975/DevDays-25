import { body, validationResult } from 'express-validator';

export const validateAudioSummary = [
	body('city')
		.isString()
		.withMessage('city must be a string')
		.notEmpty()
		.withMessage('city is required')
		.trim()
		.isLength({ min: 2, max: 70 })
		.withMessage('city must be between 2 and 70 characters'),

	body('countryCode')
		.notEmpty()
		.isString()
		.withMessage('countryCode must be a string')
		.trim()
		.isLength({ min: 2, max: 2 })
		.withMessage('countryCode must be exactly 2 characters (e.g., ES, AR)')
		.isAlpha()
		.withMessage('countryCode must contain only letters')
		.isUppercase()
		.withMessage('countryCode must be uppercase (e.g., ES, AR)'),

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
