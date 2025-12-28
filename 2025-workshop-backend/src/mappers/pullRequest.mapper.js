/**
 * Mapper para transformar datos de Pull Requests de la API de GitHub al modelo de la aplicación
 */
export const mapGitHubPRToModel = githubPR => {
	return {
		repository: githubPR.base?.repo?.full_name || 'unknown/unknown',
		number: githubPR.number,
		id: githubPR.id,
		state: githubPR.state,
		title: githubPR.title,
		body: githubPR.body || '',

		// Author (en GitHub API es 'user')
		author: {
			login: githubPR.user.login,
			html_url: githubPR.user.html_url,
			type: githubPR.user.type,
		},

		// Puede ser null (si es así convertimos a false)
		merged: githubPR.merged || false,

		// Puede ser null si no está mergeado
		merged_by: githubPR.merged_by
			? {
					login: githubPR.merged_by.login,
					html_url: githubPR.merged_by.html_url,
					type: githubPR.merged_by.type,
			  }
			: null,

		created_at: new Date(githubPR.created_at),
		updated_at: new Date(githubPR.updated_at),
		closed_at: githubPR.closed_at ? new Date(githubPR.closed_at) : null,
		merged_at: githubPR.merged_at ? new Date(githubPR.merged_at) : null,

		commits: githubPR.commits || 0,
		additions: githubPR.additions || 0,
		deletions: githubPR.deletions || 0,
		changed_files: githubPR.changed_files || 0,
		comments: githubPR.comments || 0,

		html_url: githubPR.html_url,
		diff_url: githubPR.diff_url,
	};
};

export default {
	mapGitHubPRToModel,
};
