/**
 * Mapper para transformar datos de Pull Requests de la API de GitHub al modelo de la aplicación
 */

/**
 * Función para truncar texto del body con máximo 500 caracteres
 */
const truncateText = (text, maxLength = 500) => {
	if (!text) return '';
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength).trim() + '...';
};

export const mapGitHubPRToModel = githubPR => {
	return {
		repository: githubPR.base?.repo?.full_name || 'unknown/unknown',
		number: githubPR.number,
		id: githubPR.id,
		state: githubPR.state,
		title: githubPR.title,
		body: truncateText(githubPR.body, 500),

		// Author (en GitHub API es 'user')
		author: {
			login: githubPR.user.login,
			html_url: githubPR.user.html_url,
			type: githubPR.user.type,
		},

		// Para métricas legibles
		merged: githubPR.merged_at !== null,

		created_at: new Date(githubPR.created_at),
		updated_at: new Date(githubPR.updated_at),
		closed_at: githubPR.closed_at ? new Date(githubPR.closed_at) : null,
		merged_at: githubPR.merged_at ? new Date(githubPR.merged_at) : null,

		html_url: githubPR.html_url,
		diff_url: githubPR.diff_url,
	};
};

export default {
	mapGitHubPRToModel,
};
