import {
	getAllUsers,
	getUserById,
	createUser,
	deleteUser,
	updateUser as updateUserService,
} from '../services/user.service.js';
import { trace, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('user-controller-tracer');

const meter = metrics.getMeter('user-controller-meter');
const userCreationCounter = meter.createCounter('user_creation_count', {
	description: 'Counts number of users created',
	unit: 'users',
});

export const getUsers = async (req, res) => {
	let span;
	try {
		span = tracer.startSpan('getUsers');
		// Simulamos una operación asíncrona
		await new Promise(resolve => setTimeout(resolve, 100));

		const users = getAllUsers();
		// Esto es un atributo personalizado
		span.setAttribute('user.count', users.length);
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	} finally {
		if (span) {
			// Es importante cerrar siempre el span
			span.end();
		}
	}
};

export const getUser = (req, res) => {
	try {
		const { id } = req.params;
		const user = getUserById(id);
		if (user) {
			res.status(200).json(user);
		} else {
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const addUser = (req, res) => {
	userCreationCounter.add(1);
	try {
		const newUser = createUser(req.body);
		res.status(201).json(newUser);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const removeUser = (req, res) => {
	try {
		const { id } = req.params;
		const deletedUser = deleteUser(id);
		if (deletedUser) {
			res.status(200).json(deletedUser);
		} else {
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const updateUser = (req, res) => {
	try {
		const { id } = req.params;
		const updatedUser = updateUserService(id, req.body);
		if (updatedUser) {
			res.status(200).json(updatedUser);
		} else {
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
};
