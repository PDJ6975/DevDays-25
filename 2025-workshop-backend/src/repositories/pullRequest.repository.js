import PullRequest from '../models/pullRequest.model.js';

/**
 * Obtiene todas las Pull Requests
 */
const findAll = async () => {
	return await PullRequest.find();
};

/**
 * Busca una Pull Request por su ID
 */
const findById = async id => {
	return await PullRequest.findOne({ id });
};

/**
 * Crea una nueva Pull Request
 */
const create = async data => {
	const pullRequest = new PullRequest(data);
	return await pullRequest.save();
};

export default {
	findAll,
	findById,
	create,
};
