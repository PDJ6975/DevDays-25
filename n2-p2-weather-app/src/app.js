import express from 'express';
import { httpRequestDuration } from './otel.js';
import weatherRoutes from './routes/weather.routes.js';
import auditRoutes from './routes/audit.routes.js';
import openaiRoutes from './routes/openai.routes.js';

const app = express();
app.use(express.json());

// Middleware para medir el tiempo de respuesta de toda petición
app.use((req, res, next) => {
	const startTime = Date.now();

	res.on('finish', () => {
		const duration = (Date.now() - startTime) / 1000; // convertimos de ms a s

		// Registramos en el histograma
		httpRequestDuration.record(duration, {
			method: req.method,
			route: req.baseUrl + req.route?.path,
			status_code: res.statusCode.toString(),
		});
	});

	next();
});

// Routes
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/audits', auditRoutes);
app.use('/api/v1/ai', openaiRoutes);

export default app;
