import express from 'express';
import { userRouter } from './routes/user.routes.js';
import { issueRouter } from './routes/issue.routes.js';
import { auditRouter } from './routes/audit.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { bundle } from '@readme/openapi-parser'
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(express.json());
app.use('/api/v1', userRouter);
app.use('/api/v1', issueRouter);
app.use('/api/v1', auditRouter);
app.use('/api/v1', aiRouter);

// Bundle OpenAPI and set up Swagger UI
bundle('src/docs/openapi.yaml')
    .then((api) => {
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(api));
    })
    .catch((err) => {
        console.error('Error loading OpenAPI document:', err);
    });

export default app;