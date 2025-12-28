import mongoose from 'mongoose';

const prSchema = new mongoose.Schema({
	repository: {
		type: String,
		required: true,
	},
	number: {
		type: Number,
		required: true,
	},
	id: {
		type: Number,
		required: true,
		unique: true,
	},
	state: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	body: String,
	author: {
		// user en la respuesta
		login: {
			type: String,
			required: true,
		},
		html_url: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
	},
	merged: {
		type: Boolean,
		required: true,
		index: true, // índice simple
	},
	merged_by: {
		login: String,
		html_url: String,
		type: String,
	},
	created_at: {
		type: Date,
		required: true,
		index: true, // índice simple
	},
	updated_at: {
		type: Date,
		required: true,
		index: true, // índice simple
	},
	closed_at: Date,
	merged_at: Date,
	commits: Number,
	additions: Number,
	deletions: Number,
	changed_files: Number,
	comments: Number,
	html_url: String,
	diff_url: String,
});

// Índices compuestos para queries comunes
prSchema.index({ repository: 1, state: 1, merged: 1 });
prSchema.index({ repository: 1, created_at: -1 }); // -1 para orden descendente (más reciente a más antiguo)
prSchema.index({ repository: 1, 'author.login': 1 });

const PullRequest = mongoose.model('PullRequest', prSchema);

export default PullRequest;
