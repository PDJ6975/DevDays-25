import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const evidenceSchema = new mongoose.Schema(
	{
		weekNumber: {
			type: Number,
			required: true,
		},
		weekStart: {
			type: Date,
			required: true,
		},
		weekEnd: {
			type: Date,
			required: true,
		},
		avgTemp: {
			type: Number,
			required: true,
		},
		daysInWeek: {
			type: Number,
			required: true,
		},
		compliant: {
			type: Boolean,
			required: true,
		},
	},
	{ _id: false } // No creamos un id para cada evidencia (quitamos ruido)
);

const auditSchema = new mongoose.Schema({
	auditId: {
		type: String,
		default: () => uuidv4(), // genera id automáticamente
		unique: true,
		required: true,
	},

	city: {
		type: String,
		required: true,
	},

	countryCode: {
		type: String,
		required: true,
	},

	dateFrom: {
		type: Date,
		required: true,
		index: true,
	},

	dateTo: {
		type: Date,
		required: true,
		index: true,
	},

	thresholdTemp: {
		type: Number,
		required: true,
	},

	compliant: {
		type: Boolean,
		required: true,
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},

	metadata: {
		totalWeeks: {
			// Total de semanas evaluadas
			type: Number,
			required: true,
		},
		weeksCompliant: {
			// N. semanas que cumplen
			type: Number,
			required: true,
		},
		weeksNonCompliant: {
			// N. semanas que no cumplen
			type: Number,
			required: true,
		},
		complianceRate: {
			// % de cumplimiento
			type: Number,
			required: true,
			min: 0,
			max: 100,
		},
		rule: {
			// Ej: "avg_temp > 18º" Por si algún día la regla cambia
			type: String,
			required: true,
		},
	},

	evidences: [evidenceSchema],
});

auditSchema.index({ city: 1, countryCode: 1, createdAt: -1 });
auditSchema.index({ dateFrom: 1, dateTo: 1 });

// Para limpiar el resultado devuelto por la api al llamar al res.json()
auditSchema.set('toJSON', {
	transform: (doc, ret) => {
		delete ret._id;
		delete ret.__v;

		// Formatear fechas a YYYY-MM-DD
		const formatDate = date => {
			if (!date) return date;
			const d = new Date(date);
			return d.toISOString().split('T')[0];
		};

		if (ret.dateFrom) ret.dateFrom = formatDate(ret.dateFrom);
		if (ret.dateTo) ret.dateTo = formatDate(ret.dateTo);

		if (ret.evidences && Array.isArray(ret.evidences)) {
			ret.evidences = ret.evidences.map(evidence => ({
				...evidence,
				weekStart: formatDate(evidence.weekStart),
				weekEnd: formatDate(evidence.weekEnd),
			}));
		}

		return ret;
	},
});

const Audit = mongoose.model('Audit', auditSchema);

export default Audit;
