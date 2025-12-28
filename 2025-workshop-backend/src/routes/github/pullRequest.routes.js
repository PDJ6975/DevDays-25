import { Router } from 'express';
import {
	getAllPullRequests,
	getPullRequestById,
	fetchGithubPullRequests,
} from '../../controllers/github/pullRequest.controller.js';

const pullRequestRouter = Router();

pullRequestRouter.get('/pullrequests', getAllPullRequests);
pullRequestRouter.get('/pullrequests/:pullRequestId', getPullRequestById);
pullRequestRouter.post('/pullrequests/fetch', fetchGithubPullRequests);

export default pullRequestRouter;
