import pullRequestService from '../../services/github/pullRequest.services.js';

export const getAllPullRequests = async (req, res) => {
	try {
		const pullRequests = await pullRequestService.getAllPullRequest();
		return res.status(200).json(pullRequests);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getPullRequestById = async (req, res) => {
	const { pullRequestId } = req.params;
	try {
		const pullRequest = await pullRequestService.getPullRequestById(pullRequestId);
		if (!pullRequest) {
			return res.status(404).json({ message: 'Pull Request Not Found' });
		}
		return res.status(200).json(pullRequest);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const fetchGithubPullRequests = async (req, res) => {
	const { owner, name, state = 'all' } = req.body.repository;
	try {
		const githubPullRequests = await pullRequestService.fetchGithubPullRequests(
			owner,
			name,
			state
		);
		const savedPullRequests = await pullRequestService.savePullRequests(githubPullRequests);
		return res.status(200).json(savedPullRequests);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
};
