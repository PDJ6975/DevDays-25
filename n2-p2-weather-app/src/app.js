import express from 'express';
import weatherRoutes from './routes/weather.routes.js';
import auditRoutes from './routes/audit.routes.js';
import openaiRoutes from './routes/openai.routes.js';

const app = express();
app.use(express.json());

// Health check
app.get('/', (req, res) => {
	res.send('Weather API - Funcionando correctamente');
});

// Routes
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/audits', auditRoutes);
app.use('/api/v1/ai', openaiRoutes);

export default app;
