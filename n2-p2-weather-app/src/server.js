import './otel.js';
import app from './app.js';
import { connectDB } from './db/connection.js';

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

connectDB(MONGO_URI);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
	console.log(`API docs available at http://localhost:${PORT}/docs`);
});
