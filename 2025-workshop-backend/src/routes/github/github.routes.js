import { Router } from 'express';
import { fetchGenericGithubData } from '../../controllers/github/github.controller.js';

const githubRouter = Router();

githubRouter.post('/github/fetch', fetchGenericGithubData);

export default githubRouter;
