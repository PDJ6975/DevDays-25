import express from 'express';
import weatherRoutes from './routes/weather.routes.js';

const app = express();
app.use(express.json());

// Health check
app.get('/', (req, res) => {
	res.send('Weather API - Funcionando correctamente');
});

// Routes
app.use('/api/v1/weather', weatherRoutes);

export default app;
