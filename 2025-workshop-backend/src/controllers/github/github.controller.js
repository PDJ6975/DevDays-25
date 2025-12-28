import { fetchGithubPaginatedData } from '../../services/github/github.service.js';

export const fetchGenericGithubData = async (req, res) => {
	const { url, params = {} } = req.body;
	try {
		const dataFromGithub = await fetchGithubPaginatedData(url, params);
		return res.status(200).json(dataFromGithub);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
};
