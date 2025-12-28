import PullRequestRepository from '../../repositories/pullRequest.repository.js';
import { fetchGithubPaginatedData } from './github.service.js';

/**
 * Obtiene todas las Pull Requests de la base de datos
 */
export const getAllPullRequest = async () => {
	return await PullRequestRepository.findAll();
};

/**
 * Obtiene una Pull Request por su ID
 */
export const getPullRequestById = async id => {
	return await PullRequestRepository.findById(id);
};

/**
 * Función para obtener Pull Requests de un repositorio
 *
 * @param {string} repoOwner - Propietario del repositorio (ej: 'facebook')
 * @param {string} repoName - Nombre del repositorio (ej: 'react')
 * @param {string} state - Estado de las PRs: 'open', 'closed', 'all' (default: 'all')
 * @returns {Promise<Array>} Array con todas las Pull Requests del repositorio
 */
export const fetchGithubPullRequests = async (repoOwner, repoName, state = 'all') => {
	const url = `/repos/${repoOwner}/${repoName}/pulls`;
	return await fetchGithubPaginatedData(url, { state });
};

export default {
	getAllPullRequest,
	getPullRequestById,
	fetchGithubPullRequests,
};
