import PullRequestRepository from '../../repositories/pullRequest.repository.js';
import { fetchGithubPaginatedData } from './github.service.js';
import { mapGitHubPRToModel } from '../../mappers/pullRequest.mapper.js';

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

// Función para guardar PRs
export const savePullRequests = async pullRequestsData => {
	// Buscamos las PRs que ya existen en la BD
	const ids = pullRequestsData.map(pr => pr.id);
	const existingPullRequests = await PullRequestRepository.findByIds(ids);

	// Obtenemos el conjunto de PRs que debemos crear
	const existingIds = new Set(existingPullRequests.map(pr => pr.id));
	const newPullRequests = pullRequestsData.filter(pr => !existingIds.has(pr.id));

	// Guardamos tras mapear las PRs al modelo
	const mappedPullRequests = newPullRequests.map(pr => mapGitHubPRToModel(pr));
	const savedPullRequests = await Promise.all(
		mappedPullRequests.map(pr => PullRequestRepository.create(pr))
	);

	// Devolvemos las PRs
	return [...existingPullRequests, ...savedPullRequests];
};

export default {
	getAllPullRequest,
	getPullRequestById,
	fetchGithubPullRequests,
	savePullRequests,
};
