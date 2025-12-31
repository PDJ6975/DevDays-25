import mongoose from 'mongoose';

const weatherSchema = new mongoose.Schema({
	city: {
		type: String,
		required: true,
		index: true,
	},

	latitude: {
		type: Number,
		required: true,
	},

	longitude: {
		type: Number,
		required: true,
	},

	// Un solo doc por fecha
	date: {
		type: Date,
		required: true,
		index: true,
	},

	// Media diaria de ese día
	temperatureMean: {
		type: Number,
		required: true,
	},

	// Metadatos
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Índice único compuesto: evita duplicar datos de misma ciudad/fecha
weatherSchema.index({ city: 1, date: 1 }, { unique: true });

const Weather = mongoose.model('Weather', weatherSchema);

export default Weather;
